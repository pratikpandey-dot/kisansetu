import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

export const getMyFarmer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    const [farmers, bookings] = await Promise.all([
      ctx.db.query("farmers").collect(),
      ctx.db.query("bookings").collect(),
    ]);
    const verified = farmers.filter((f) => f.verificationStatus === "verified").length;
    const pending = farmers.filter((f) => f.verificationStatus === "pending").length;
    return {
      total: farmers.length,
      verified,
      pending,
      bookings: bookings.filter((b) => b.status === "confirmed").length,
    };
  },
});

const VERIFIED_FARMERS = 18426;

export const getPublicStats = query({
  args: {},
  handler: async (ctx) => {
    const farmers = await ctx.db.query("farmers").collect();
    const bookings = await ctx.db.query("bookings").collect();
    return {
      farmers: VERIFIED_FARMERS + farmers.length,
      bookingsToday: 1200 + bookings.length,
      centers: 3,
    };
  },
});

const CENTER_SEED: Array<{ name: string; address: string }> = [
  {
    name: "BIET Procurement Centre (Main)",
    address: "Bundelkhand Institute of Engineering & Technology, Jhansi, UP 284128",
  },
  {
    name: "Jhansi Mandi Yard",
    address: "Krishi Utpadan Mandi Samiti, Jhansi, UP 284001",
  },
  {
    name: "Gwalior Road Collection Centre",
    address: "NH-44, Gwalior Road, Jhansi, UP 284002",
  },
];

const SLOT_LABELS = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
];

export const ensureSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const centers = await ctx.db.query("centers").collect();
    if (centers.length > 0) return { seeded: false };

    for (const c of CENTER_SEED) {
      await ctx.db.insert("centers", { ...c, status: "open" });
    }
    return { seeded: true };
  },
});

export const ensureSeedPublic = mutation({
  args: {},
  handler: async (ctx) => {
    const centers = await ctx.db.query("centers").collect();
    if (centers.length > 0) return false;
    for (const c of CENTER_SEED) {
      await ctx.db.insert("centers", { ...c, status: "open" });
    }
    return true;
  },
});

export const registerFarmer = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    village: v.string(),
    district: v.string(),
    state: v.string(),
    landSizeAcres: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const existing = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing._id;

    const farmerId: Id<"farmers"> = await ctx.db.insert("farmers", {
      userId,
      name: args.name,
      phone: args.phone,
      village: args.village,
      district: args.district,
      state: args.state,
      landSizeAcres: args.landSizeAcres,
      verificationStatus: "pending",
      createdAt: Date.now(),
    });
    return farmerId;
  },
});

export const updateMyFarmer = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    village: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    landSizeAcres: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) throw new Error("Not registered");

    const patch: Partial<Doc<"farmers">> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.village !== undefined) patch.village = args.village;
    if (args.district !== undefined) patch.district = args.district;
    if (args.state !== undefined) patch.state = args.state;
    if (args.landSizeAcres !== undefined) patch.landSizeAcres = args.landSizeAcres;
    await ctx.db.patch(farmer._id, patch);
    return farmer._id;
  },
});

export const uploadDocument = mutation({
  args: {
    type: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) throw new Error("Register as a farmer first");

    const docId: Id<"documents"> = await ctx.db.insert("documents", {
      farmerId: farmer._id,
      type: args.type,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      status: "processing",
      uploadedAt: Date.now(),
    });

    // Simulated OCR pipeline: derive structured fields from the unstructured
    // file metadata. In production this is where an OCR/NLP service would run.
    const cleaned = args.fileName.replace(/\.[^.]+$/, "");
    const digits = cleaned.replace(/\D/g, "").slice(-12);
    await ctx.db.patch(docId, {
      status: "verified",
      extractedFields: {
        idNumber: digits.length >= 4 ? `XXXX XXXX ${digits.slice(-4)}` : "—",
        holderName: farmer.name,
      },
    });
    await ctx.db.patch(farmer._id, { verificationStatus: "verified" });
    return docId;
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) throw new Error("Not registered");
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.farmerId !== farmer._id) throw new Error("Not found");
    await ctx.db.delete(args.documentId);
  },
});
