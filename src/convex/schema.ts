import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ---------------------- Kisan Setu domain tables ----------------------

    // Farmer profile — one per signed-in user, created at registration.
    farmers: defineTable({
      userId: v.id("users"),
      name: v.string(),
      phone: v.string(),
      village: v.string(),
      district: v.string(),
      state: v.string(),
      landSizeAcres: v.number(),
      // "pending" | "verified" | "rejected"
      verificationStatus: v.string(),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_created", ["createdAt"]),

    // Procurement centres.
    centers: defineTable({
      name: v.string(),
      address: v.string(),
      // "open" | "closed"
      status: v.string(),
    }),

    // Bookable time slots at a centre on a given day (epoch ms day + label).
    slots: defineTable({
      centerId: v.id("centers"),
      // epoch ms of the day (midnight local)
      day: v.number(),
      label: v.string(), // e.g. "09:00 AM - 10:00 AM"
      capacity: v.number(),
      booked: v.number(),
    })
      .index("by_center_day", ["centerId", "day"])
      .index("by_day", ["day"]),

    // A farmer's booking for one slot. Queue order is derived from createdAt.
    bookings: defineTable({
      farmerId: v.id("farmers"),
      slotId: v.id("slots"),
      // "confirmed" | "completed" | "cancelled"
      status: v.string(),
      queueToken: v.string(),
      createdAt: v.number(),
    })
      .index("by_farmer", ["farmerId"])
      .index("by_slot", ["slotId"])
      .index("by_created", ["createdAt"]),

    // KYC documents uploaded by farmers for verification (OCR-ready metadata).
    documents: defineTable({
      farmerId: v.id("farmers"),
      // "aadhaar" | "pan" | "landRecord" | "bankPassbook"
      type: v.string(),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
      // "uploaded" | "processing" | "verified" | "rejected"
      status: v.string(),
      extractedFields: v.optional(
        v.object({
          idNumber: v.optional(v.string()),
          holderName: v.optional(v.string()),
        }),
      ),
      uploadedAt: v.number(),
    }).index("by_farmer", ["farmerId"]),

    // Payments / settlement records.
    transactions: defineTable({
      farmerId: v.id("farmers"),
      crop: v.string(),
      quantityQuintal: v.number(),
      ratePerQuintal: v.number(),
      amount: v.number(),
      // "pending" | "paid"
      status: v.string(),
      reference: v.string(),
      createdAt: v.number(),
    })
      .index("by_farmer", ["farmerId"])
      .index("by_created", ["createdAt"]),

    // Government officials — sign in on /auth with email + access code.
    officials: defineTable({
      email: v.string(),
      name: v.string(),
      designation: v.string(),
      department: v.string(),
      // e.g. "JH-AGRI-7788" — verified against input at sign-in
      accessCode: v.string(),
      // signed-in user linked at first access-code login
      userId: v.optional(v.id("users")),
      lastLoginAt: v.optional(v.number()),
    })
      .index("by_email", ["email"])
      .index("by_user", ["userId"]),

    // Today's MSP rates shown on the Prices page.
    rates: defineTable({
      crop: v.string(),
      pricePerQuintal: v.number(),
      updatedAt: v.number(),
    }).index("by_crop", ["crop"]),

    // Cached AI insights per user (regenerated on demand).
    insights: defineTable({
      userId: v.id("users"),
      text: v.string(),
      // generated with the LLM key, or fell back to rule-based output
      online: v.boolean(),
      generatedAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
