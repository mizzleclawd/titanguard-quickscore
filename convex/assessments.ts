import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    companyName: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    industry: v.string(),
    employeeCount: v.string(),
    responses: v.record(v.string(), v.record(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    // Calculate scores per category
    const categoryScores: Record<string, number> = {};
    let totalPoints = 0;
    let maxPoints = 0;

    for (const [category, questions] of Object.entries(args.responses)) {
      let catTotal = 0;
      let catMax = 0;
      for (const [, score] of Object.entries(questions)) {
        catTotal += score;
        catMax += 4; // max score per question
      }
      categoryScores[category] = catMax > 0 ? Math.round((catTotal / catMax) * 100) : 0;
      totalPoints += catTotal;
      maxPoints += catMax;
    }

    const overallScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    let riskLevel: string;
    if (overallScore >= 80) riskLevel = "low";
    else if (overallScore >= 60) riskLevel = "medium";
    else if (overallScore >= 40) riskLevel = "high";
    else riskLevel = "critical";

    const id = await ctx.db.insert("assessments", {
      ...args,
      overallScore,
      categoryScores,
      riskLevel,
      completedAt: Date.now(),
      reportViewed: false,
    });

    return id;
  },
});

export const get = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const markReportViewed = mutation({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { reportViewed: true });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const assessments = await ctx.db.query("assessments").collect();
    return {
      total: assessments.length,
      avgScore: assessments.length > 0
        ? Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length)
        : 0,
      byRisk: {
        critical: assessments.filter(a => a.riskLevel === "critical").length,
        high: assessments.filter(a => a.riskLevel === "high").length,
        medium: assessments.filter(a => a.riskLevel === "medium").length,
        low: assessments.filter(a => a.riskLevel === "low").length,
      },
    };
  },
});
