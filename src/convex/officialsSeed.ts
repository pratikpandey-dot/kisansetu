import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Seeds demo government-official accounts (idempotent). */
export const ensureOfficialsSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("officials").collect();
    if (existing.length > 0) return { seeded: 0 };

    const officials = [
      {
        email: "official@kisan.gov.in",
        name: "Ramesh Chandra",
        designation: "Procurement Officer",
        department: "Dept. of Agriculture, UP Govt.",
        accessCode: "JH-AGRI-7788",
      },
      {
        email: "verification.cell@kisan.gov.in",
        name: "Sunita Devi",
        designation: "Verification Cell Head",
        department: "Dept. of Agriculture, UP Govt.",
        accessCode: "UP-AGRI-3344",
      },
    ];
    for (const o of officials) {
      await ctx.db.insert("officials", o);
    }
    return { seeded: officials.length };
  },
});
