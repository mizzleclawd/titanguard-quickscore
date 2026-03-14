import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const utmArgs = {
  utmSource: v.string(),
  utmMedium: v.string(),
  utmCampaign: v.string(),
  utmTerm: v.optional(v.string()),
  utmContent: v.optional(v.string()),
  landingPath: v.string(),
  referrer: v.optional(v.string()),
};

export const submit = mutation({
  args: {
    companyName: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    industry: v.string(),
    employeeCount: v.string(),
    responses: v.record(v.string(), v.record(v.string(), v.number())),
    ...utmArgs,
  },
  handler: async (ctx, args) => {
    const categoryScores: Record<string, number> = {};
    let totalPoints = 0;
    let maxPoints = 0;

    for (const [category, questions] of Object.entries(args.responses)) {
      let catTotal = 0;
      let catMax = 0;
      for (const [, score] of Object.entries(questions)) {
        catTotal += score;
        catMax += 4;
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
      lifecycleStage: "assessed",
      bookedCall: false,
      followUpRequested: false,
    });

    await ctx.db.insert("leadEvents", {
      assessmentId: id,
      companyName: args.companyName,
      contactEmail: args.contactEmail,
      contactName: args.contactName,
      eventType: "assessment_completed",
      eventLabel: riskLevel,
      createdAt: Date.now(),
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      utmTerm: args.utmTerm,
      utmContent: args.utmContent,
      landingPath: args.landingPath,
      referrer: args.referrer,
      meta: {
        overallScore: String(overallScore),
        riskLevel,
      },
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

export const logEvent = mutation({
  args: {
    assessmentId: v.optional(v.id("assessments")),
    companyName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    eventType: v.string(),
    eventLabel: v.optional(v.string()),
    ...utmArgs,
    meta: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("leadEvents", {
      ...args,
      createdAt: Date.now(),
    });

    if (args.assessmentId && args.eventType === "book_call_clicked") {
      await ctx.db.patch(args.assessmentId, {
        bookedCall: true,
        lifecycleStage: "book_call_clicked",
      });
    }

    if (args.assessmentId && args.eventType === "follow_up_requested") {
      await ctx.db.patch(args.assessmentId, {
        followUpRequested: true,
        lifecycleStage: "follow_up_requested",
      });
    }
  },
});

export const getRecentLeadSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db.query("assessments").order("desc").take(1);
    if (latest.length === 0) return null;
    const assessment = latest[0];
    const events = await ctx.db
      .query("leadEvents")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", assessment._id))
      .collect();
    return {
      assessment,
      events,
    };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const assessments = await ctx.db.query("assessments").collect();
    return {
      total: assessments.length,
      avgScore:
        assessments.length > 0
          ? Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length)
          : 0,
      byRisk: {
        critical: assessments.filter((a) => a.riskLevel === "critical").length,
        high: assessments.filter((a) => a.riskLevel === "high").length,
        medium: assessments.filter((a) => a.riskLevel === "medium").length,
        low: assessments.filter((a) => a.riskLevel === "low").length,
      },
    };
  },
});
