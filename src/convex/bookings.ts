import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

async function countAhead(
  ctx: QueryCtx,
  slotId: Id<"slots">,
  createdAt: number,
): Promise<number> {
  const all = await ctx.db
    .query("bookings")
    .withIndex("by_slot", (q) => q.eq("slotId", slotId))
    .collect();
  return all.filter(
    (b: Doc<"bookings">) => b.status === "confirmed" && b.createdAt < createdAt,
  ).length;
}

/** Returns the signed-in farmer's active booking plus live queue position. */
export const getMyBooking = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) return null;

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_farmer", (q) => q.eq("farmerId", farmer._id))
      .collect();

    const active = bookings.find((b) => b.status === "confirmed");
    const history = bookings
      .filter((b) => b.status !== "confirmed")
      .sort((a, b) => b.createdAt - a.createdAt);

    if (!active) return { active: null, history };

    const slot = await ctx.db.get(active.slotId);
    const center = slot ? await ctx.db.get(slot.centerId) : null;
    const ahead = await countAhead(ctx, active.slotId, active.createdAt);
    const slotBookings = await ctx.db
      .query("bookings")
      .withIndex("by_slot", (q) => q.eq("slotId", active.slotId))
      .collect();

    return {
      active: {
        booking: active,
        slot,
        centerName: center?.name ?? "",
        position: ahead + 1,
        totalInQueue: slotBookings.filter((b) => b.status === "confirmed").length,
      },
      history,
    };
  },
});



export const bookSlot = mutation({
  args: { slotId: v.id("slots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) throw new Error("Register as a farmer first");
    if (farmer.verificationStatus !== "verified") {
      throw new Error(
        "Your documents are still being verified. Please wait for verification.",
      );
    }

    const slot = await ctx.db.get(args.slotId);
    if (!slot) throw new Error("Slot not found");
    if (slot.booked >= slot.capacity) throw new Error("This slot is full");

    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_farmer", (q) => q.eq("farmerId", farmer._id))
      .collect();
    if (existing.some((b) => b.status === "confirmed")) {
      throw new Error("You already have an active booking. Cancel it first.");
    }

    const token = "KS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const bookingId: Id<"bookings"> = await ctx.db.insert("bookings", {
      farmerId: farmer._id,
      slotId: args.slotId,
      status: "confirmed",
      queueToken: token,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.slotId, { booked: slot.booked + 1 });
    return { bookingId, token };
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer || booking.farmerId !== farmer._id) throw new Error("Not found");

    await ctx.db.patch(args.bookingId, { status: "cancelled" });
    const slot = await ctx.db.get(booking.slotId);
    if (slot && slot.booked > 0) {
      await ctx.db.patch(slot._id, { booked: slot.booked - 1 });
    }
  },
});
