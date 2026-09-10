import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) return [];
    return await ctx.db
      .query("documents")
      .withIndex("by_farmer", (q) => q.eq("farmerId", farmer._id))
      .collect();
  },
});

export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!farmer) return [];
    return await ctx.db
      .query("transactions")
      .withIndex("by_farmer", (q) => q.eq("farmerId", farmer._id))
      .order("desc")
      .collect();
  },
});

export const getRates = query({
  args: {},
  handler: async (ctx) => {
    const rates = await ctx.db.query("rates").collect();
    if (rates.length > 0) {
      return rates.sort((a, b) => a.crop.localeCompare(b.crop));
    }
    return DEFAULT_RATES.map((r) => ({
      _id: "seed" as const,
      crop: r.crop,
      pricePerQuintal: r.pricePerQuintal,
      updatedAt: 0,
    }));
  },
});

const DEFAULT_RATES = [
  { crop: "Wheat", pricePerQuintal: 2275 },
  { crop: "Paddy (Common)", pricePerQuintal: 2183 },
  { crop: "Paddy (Grade A)", pricePerQuintal: 2203 },
  { crop: "Maize", pricePerQuintal: 2090 },
  { crop: "Gram (Chana)", pricePerQuintal: 5650 },
  { crop: "Mustard", pricePerQuintal: 5650 },
  { crop: "Barley", pricePerQuintal: 1850 },
  { crop: "Soybean", pricePerQuintal: 4892 },
  { crop: "Sesamum", pricePerQuintal: 7280 },
  { crop: "Tur (Arhar)", pricePerQuintal: 7000 },
];

/** Seeds the 7 hourly slots for every centre on a given day (idempotent). */
export const seedSlotsForDay = mutation({
  args: { day: v.number() },
  handler: async (ctx, args) => {
    const centers = await ctx.db.query("centers").collect();
    if (centers.length === 0) return { seeded: 0 };

    const existing = await ctx.db
      .query("slots")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .collect();
    if (existing.length > 0) return { seeded: 0 };

    const labels = [
      "08:00 AM - 09:00 AM",
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "12:00 PM - 01:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
    ];
    let seeded = 0;
    for (const center of centers) {
      for (const label of labels) {
        await ctx.db.insert("slots", {
          centerId: center._id,
          day: args.day,
          label,
          capacity: 12,
          booked: 0,
        });
        seeded += 1;
      }
    }
    return { seeded };
  },
});
