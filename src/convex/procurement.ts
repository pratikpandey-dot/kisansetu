import { query } from "./_generated/server";
import { v } from "convex/values";

/** Public (no auth) — for the landing page stats. */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const farmers = await ctx.db.query("farmers").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const centers = await ctx.db.query("centers").collect();
    const settled = bookings.filter((b) => b.status === "completed").length;
    return {
      farmers: farmers.length,
      verified: farmers.filter((f) => f.verificationStatus === "verified").length,
      bookings: bookings.length,
      centers: centers.length,
      settled,
    };
  },
});

export const getCenters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("centers").collect();
  },
});

/** The next 14 days of slots for every center (used by the booking page). */
export const getSlots = query({
  args: { day: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const day = args.day ?? startOfToday();
    const slots = await ctx.db
      .query("slots")
      .withIndex("by_day", (q) => q.eq("day", day))
      .collect();
    const centers = await ctx.db.query("centers").collect();
    const centerById = new Map(centers.map((c) => [c._id, c]));
    return slots
      .map((s) => ({
        ...s,
        centerName: centerById.get(s.centerId)?.name ?? "Unknown centre",
      }))
      .sort((a, b) => a.centerName.localeCompare(b.centerName) || a.label.localeCompare(b.label));
  },
});

/** Public queue snapshot — farmers ahead per slot across all centers. */
export const getQueues = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    const active = bookings.filter((b) => b.status === "confirmed");
    const counts = new Map<string, number>();
    for (const b of active) {
      counts.set(b.slotId, (counts.get(b.slotId) ?? 0) + 1);
    }
    return counts;
  },
});

function startOfToday(): number {
  const now = Date.now();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
