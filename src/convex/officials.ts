import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

/* ------------------------------------------------------------------ */
/* Sign-in / identity                                                  */
/* ------------------------------------------------------------------ */

/**
 * Verifies an official's email + access code. If the signed-in user already
 * has an official profile, it is returned immediately (re-login case).
 */
export const verifyAccessCode = mutation({
  args: { email: v.string(), accessCode: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const code = args.accessCode.trim().toUpperCase();

    const official = await ctx.db
      .query("officials")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!official) return { ok: false as const, reason: "not_found" };
    if (official.accessCode !== code) return { ok: false as const, reason: "bad_code" };

    // Link the signed-in user to this official profile so the official
    // pages can look the profile up by user id.
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { ok: false as const, reason: "not_signed_in" };

    if (official.userId !== userId) {
      await ctx.db.patch(official._id, { userId, lastLoginAt: Date.now() });
    } else {
      await ctx.db.patch(official._id, { lastLoginAt: Date.now() });
    }

    return {
      ok: true as const,
      official: {
        _id: official._id,
        name: official.name,
        designation: official.designation,
        department: official.department,
      },
    };
  },
});

/** Current signed-in user's official profile (null if none). */
export const getMyOfficial = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("officials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/* ------------------------------------------------------------------ */
/* Overview stats                                                      */
/* ------------------------------------------------------------------ */

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const [farmers, bookings, txs] = await Promise.all([
      ctx.db.query("farmers").collect(),
      ctx.db.query("bookings").collect(),
      ctx.db.query("transactions").collect(),
    ]);
    const totalPaid = txs
      .filter((t) => t.status === "paid")
      .reduce((s, t) => s + t.amount, 0);
    const totalPending = txs
      .filter((t) => t.status === "pending")
      .reduce((s, t) => s + t.amount, 0);
    return {
      totalFarmers: farmers.length,
      verified: farmers.filter((f) => f.verificationStatus === "verified").length,
      pendingVerification: farmers.filter((f) => f.verificationStatus === "pending").length,
      rejected: farmers.filter((f) => f.verificationStatus === "rejected").length,
      activeBookings: bookings.filter((b) => b.status === "confirmed").length,
      totalPaid,
      totalPending,
      pendingTxCount: txs.filter((t) => t.status === "pending").length,
    };
  },
});

/* ------------------------------------------------------------------ */
/* Farmer directory + verification actions                             */
/* ------------------------------------------------------------------ */

type FarmerRow = {
  _id: Id<"farmers">;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  landSizeAcres: number;
  verificationStatus: string;
  createdAt: number;
  docsCount: number;
  bookingsCount: number;
};

export const listFarmers = query({
  args: {},
  handler: async (ctx) => {
    const [farmers, docs, bookings] = await Promise.all([
      ctx.db.query("farmers").withIndex("by_created").order("desc").collect(),
      ctx.db.query("documents").collect(),
      ctx.db.query("bookings").collect(),
    ]);

    const docsByFarmer = new Map<Id<"farmers">, number>();
    for (const d of docs) {
      docsByFarmer.set(d.farmerId, (docsByFarmer.get(d.farmerId) ?? 0) + 1);
    }
    const bookingsByFarmer = new Map<Id<"farmers">, number>();
    for (const b of bookings) {
      bookingsByFarmer.set(b.farmerId, (bookingsByFarmer.get(b.farmerId) ?? 0) + 1);
    }

    const rows: FarmerRow[] = farmers.map((f) => ({
      _id: f._id,
      name: f.name,
      phone: f.phone,
      village: f.village,
      district: f.district,
      state: f.state,
      landSizeAcres: f.landSizeAcres,
      verificationStatus: f.verificationStatus,
      createdAt: f.createdAt,
      docsCount: docsByFarmer.get(f._id) ?? 0,
      bookingsCount: bookingsByFarmer.get(f._id) ?? 0,
    }));
    return rows;
  },
});

export const setVerificationStatus = mutation({
  args: { farmerId: v.id("farmers"), status: v.string() },
  handler: async (ctx: MutationCtx, args) => {
    await requireOfficial(ctx);
    if (!["pending", "verified", "rejected"].includes(args.status)) {
      throw new Error("Invalid status");
    }
    await ctx.db.patch(args.farmerId, { verificationStatus: args.status });
  },
});

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export const listPendingTransactions = query({
  args: {},
  handler: async (ctx) => {
    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_created")
      .order("desc")
      .collect();
    const farmers = await ctx.db.query("farmers").collect();
    const byId = new Map<Id<"farmers">, Doc<"farmers">>();
    for (const f of farmers) byId.set(f._id, f);

    return txs
      .filter((t) => t.status === "pending")
      .map((t) => {
        const f = byId.get(t.farmerId);
        return {
          _id: t._id,
          reference: t.reference,
          crop: t.crop,
          quantityQuintal: t.quantityQuintal,
          amount: t.amount,
          createdAt: t.createdAt,
          farmerName: f?.name ?? "—",
          village: f?.village ?? "—",
        };
      });
  },
});

export const markTransactionPaid = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx: MutationCtx, args) => {
    await requireOfficial(ctx);
    await ctx.db.patch(args.transactionId, { status: "paid" });
  },
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function requireOfficial(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Sign in required");
  const official = await ctx.db
    .query("officials")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!official) throw new Error("Official profile required");
  return official;
}
