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

const EVENT_TYPE_ALLOWLIST = new Set([
  "contact_captured",
  "assessment_completed",
  "thank_you_viewed",
  "book_call_clicked",
  "follow_up_requested",
]);

const META_KEY_ALLOWLIST = new Set([
  "employeeCount",
  "overallScore",
  "riskLevel",
  "destination",
  "channel",
]);

function clampString(value: string | undefined, max: number): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, max);
}

function sanitizeMeta(meta: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!meta) return undefined;
  const entries = Object.entries(meta)
    .filter(([key]) => META_KEY_ALLOWLIST.has(key))
    .slice(0, 10)
    .map(([key, value]) => [key, String(value).slice(0, 200)] as const);

  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

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
    if (!EVENT_TYPE_ALLOWLIST.has(args.eventType)) {
      throw new Error("invalid eventType");
    }

    const sanitized = {
      assessmentId: args.assessmentId,
      companyName: clampString(args.companyName, 120),
      contactEmail: clampString(args.contactEmail, 160),
      contactName: clampString(args.contactName, 120),
      eventType: args.eventType,
      eventLabel: clampString(args.eventLabel, 80),
      utmSource: clampString(args.utmSource, 80) || "direct",
      utmMedium: clampString(args.utmMedium, 80) || "none",
      utmCampaign: clampString(args.utmCampaign, 120) || "quickscore-default",
      utmTerm: clampString(args.utmTerm, 120),
      utmContent: clampString(args.utmContent, 120),
      landingPath: clampString(args.landingPath, 400) || "/",
      referrer: clampString(args.referrer, 240),
      meta: sanitizeMeta(args.meta),
    };

    const approxPayloadSize = JSON.stringify(sanitized).length;
    if (approxPayloadSize > 4000) {
      throw new Error("event payload too large");
    }

    await ctx.db.insert("leadEvents", {
      ...sanitized,
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
