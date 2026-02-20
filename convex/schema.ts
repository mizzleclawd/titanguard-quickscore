import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
    // Company info
    companyName: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    industry: v.string(),
    employeeCount: v.string(),

    // Responses (category -> question index -> answer value 0-4)
    responses: v.record(v.string(), v.record(v.string(), v.number())),

    // Computed scores
    overallScore: v.number(),
    categoryScores: v.record(v.string(), v.number()),
    riskLevel: v.string(), // "critical" | "high" | "medium" | "low"
    
    // Metadata
    completedAt: v.number(),
    reportViewed: v.boolean(),
  }),
});
