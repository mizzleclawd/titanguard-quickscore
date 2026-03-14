import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

type MetaRecord = Record<string, string>;

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
const META_KEY_ALLOWLIST = new Set(["employeeCount", "overallScore", "riskLevel", "destination", "channel"]);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_DAILY_MAX = 20;
const RATE_LIMIT_BLOCK_MS = 30 * 60 * 1000;
const HANDOFF_MAX_ATTEMPTS = 3;
const HANDOFF_RETRY_DELAYS_MS = [60_000, 5 * 60_000, 15 * 60_000];

function clampString(value: string | undefined, max: number): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, max);
}

function sanitizePath(value: string | undefined, fallback = "/"): string {
  const trimmed = clampString(value, 400) || fallback;
  return trimmed.replace(/([?&])(token|key|email|phone|contactEmail|contactName)=[^&]+/gi, "$1$2=[redacted]");
}

function sanitizeMeta(meta: MetaRecord | undefined): MetaRecord | undefined {
  if (!meta) return undefined;
  const entries = Object.entries(meta)
    .filter(([key]) => META_KEY_ALLOWLIST.has(key))
    .slice(0, 10)
    .map(([key, value]) => [key, String(value).slice(0, 200)] as const);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

function normalizeEvent(args: {
  assessmentId?: Id<"assessments">;
  companyName?: string;
  contactEmail?: string;
  contactName?: string;
  eventType: string;
  eventLabel?: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  landingPath: string;
  referrer?: string;
  meta?: MetaRecord;
}) {
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
    landingPath: sanitizePath(args.landingPath),
    referrer: sanitizePath(args.referrer, "") || undefined,
    meta: sanitizeMeta(args.meta),
  };
  const approxPayloadSize = JSON.stringify(sanitized).length;
  if (approxPayloadSize > 4000) throw new Error("event payload too large");
  return sanitized;
}

function hmacSha256(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function secureCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function enforceRateLimit(ctx: any, key: string) {
  const now = Date.now();
  const current = await ctx.db.query("submitRateLimits").withIndex("by_key", (q: any) => q.eq("key", key)).unique();
  if (!current) {
    await ctx.db.insert("submitRateLimits", {
      key,
      windowStartedAt: now,
      attempts: 1,
      lastSeenAt: now,
    });
    return;
  }
  if (current.blockedUntil && current.blockedUntil > now) throw new Error("rate limit exceeded");

  const withinWindow = now - current.windowStartedAt <= RATE_LIMIT_WINDOW_MS;
  const withinDay = now - current.windowStartedAt <= 24 * 60 * 60 * 1000;
  const attempts = withinWindow ? current.attempts + 1 : 1;
  const dailyAttempts = withinDay ? current.attempts + 1 : 1;
  const patch: Record<string, number | undefined> = {
    attempts,
    lastSeenAt: now,
    windowStartedAt: withinWindow ? current.windowStartedAt : now,
  };
  if (attempts > RATE_LIMIT_MAX_ATTEMPTS || dailyAttempts > RATE_LIMIT_DAILY_MAX) {
    patch.blockedUntil = now + RATE_LIMIT_BLOCK_MS;
    await ctx.db.patch(current._id, patch);
    throw new Error("rate limit exceeded");
  }
  patch.blockedUntil = undefined;
  await ctx.db.patch(current._id, patch);
}

async function verifyBotProofOrThrow(botProof: string, fingerprint: string) {
  const raw = clampString(botProof, 800);
  if (!raw) throw new Error("bot proof missing");
  const [issuedAtRaw, nonce, providedSig] = raw.split(".");
  if (!issuedAtRaw || !nonce || !providedSig) throw new Error("invalid bot proof");
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) throw new Error("invalid bot proof");
  if (Date.now() - issuedAt > 15 * 60 * 1000) throw new Error("bot proof expired");
  const secret = process.env.TITANGUARD_BOT_PROOF_SECRET;
  if (!secret) throw new Error("bot proof secret missing");
  const expected = hmacSha256(secret, `${issuedAt}.${nonce}.${fingerprint}`);
  if (!secureCompare(expected, providedSig)) throw new Error("invalid bot proof");
}

export const issueBotProof = action({
  args: { fingerprint: v.string() },
  handler: async (_ctx, args) => {
    const fingerprint = clampString(args.fingerprint, 120) || "anon";
    const nonce = randomUUID();
    const issuedAt = Date.now();
    const secret = process.env.TITANGUARD_BOT_PROOF_SECRET;
    if (!secret) throw new Error("bot proof secret missing");
    const signature = hmacSha256(secret, `${issuedAt}.${nonce}.${fingerprint}`);
    return `${issuedAt}.${nonce}.${signature}`;
  },
});

export const submit = mutation({
  args: {
    companyName: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    industry: v.string(),
    employeeCount: v.string(),
    responses: v.record(v.string(), v.record(v.string(), v.number())),
    botProof: v.string(),
    fingerprint: v.string(),
    ...utmArgs,
  },
  handler: async (ctx, args) => {
    await verifyBotProofOrThrow(args.botProof, args.fingerprint);
    await enforceRateLimit(ctx, `${clampString(args.fingerprint, 120) || "anon"}:${clampString(args.contactEmail, 160) || "unknown"}`);

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
    const riskLevel = overallScore >= 80 ? "low" : overallScore >= 60 ? "medium" : overallScore >= 40 ? "high" : "critical";
    const now = Date.now();

    const id = await ctx.db.insert("assessments", {
      companyName: clampString(args.companyName, 120) || "Unknown",
      contactEmail: clampString(args.contactEmail, 160) || "unknown@example.invalid",
      contactName: clampString(args.contactName, 120) || "Unknown",
      industry: clampString(args.industry, 80) || "Other",
      employeeCount: clampString(args.employeeCount, 40) || "Unknown",
      responses: args.responses,
      overallScore,
      categoryScores,
      riskLevel,
      completedAt: now,
      reportViewed: false,
      utmSource: clampString(args.utmSource, 80) || "direct",
      utmMedium: clampString(args.utmMedium, 80) || "none",
      utmCampaign: clampString(args.utmCampaign, 120) || "quickscore-default",
      utmTerm: clampString(args.utmTerm, 120),
      utmContent: clampString(args.utmContent, 120),
      landingPath: sanitizePath(args.landingPath),
      referrer: sanitizePath(args.referrer, "") || undefined,
      lifecycleStage: "assessed",
      bookedCall: false,
      followUpRequested: false,
    });

    await ctx.db.insert("leadEvents", {
      assessmentId: id,
      companyName: clampString(args.companyName, 120),
      contactEmail: clampString(args.contactEmail, 160),
      contactName: clampString(args.contactName, 120),
      eventType: "assessment_completed",
      eventLabel: riskLevel,
      createdAt: now,
      utmSource: clampString(args.utmSource, 80) || "direct",
      utmMedium: clampString(args.utmMedium, 80) || "none",
      utmCampaign: clampString(args.utmCampaign, 120) || "quickscore-default",
      utmTerm: clampString(args.utmTerm, 120),
      utmContent: clampString(args.utmContent, 120),
      landingPath: sanitizePath(args.landingPath),
      referrer: sanitizePath(args.referrer, "") || undefined,
      meta: { overallScore: String(overallScore), riskLevel },
    });

    const payloadHash = hmacSha256(process.env.TITANGUARD_LEAD_WEBHOOK_SECRET || "dev-secret", JSON.stringify({ id, overallScore, riskLevel }));
    await ctx.db.insert("leadHandoffs", {
      assessmentId: id,
      destination: process.env.TITANGUARD_LEAD_WEBHOOK_URL || "configured-at-runtime",
      status: "pending",
      payloadHash,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
      nextAttemptAt: now,
    });
    return id;
  },
});

export const get = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => ctx.db.get(args.id),
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
    if (!EVENT_TYPE_ALLOWLIST.has(args.eventType)) throw new Error("invalid eventType");
    const sanitized = normalizeEvent(args);
    await ctx.db.insert("leadEvents", { ...sanitized, createdAt: Date.now() });
    if (args.assessmentId && args.eventType === "book_call_clicked") {
      await ctx.db.patch(args.assessmentId, { bookedCall: true, lifecycleStage: "book_call_clicked" });
    }
    if (args.assessmentId && args.eventType === "follow_up_requested") {
      await ctx.db.patch(args.assessmentId, { followUpRequested: true, lifecycleStage: "follow_up_requested" });
    }
  },
});

export const processLeadHandoff = internalAction({
  args: { handoffId: v.id("leadHandoffs") },
  handler: async (ctx, args) => {
    const handoff = await ctx.runQuery(internal.assessments.getHandoffForProcessing, { handoffId: args.handoffId });
    if (!handoff) throw new Error("handoff not found");
    const endpoint = process.env.TITANGUARD_LEAD_WEBHOOK_URL;
    const secret = process.env.TITANGUARD_LEAD_WEBHOOK_SECRET;
    if (!endpoint || !secret) {
      await ctx.runMutation(internal.assessments.recordHandoffFailure, { handoffId: args.handoffId, responseCode: 500, responsePreview: "handoff env missing" });
      return { ok: false };
    }
    const timestamp = String(Date.now());
    const nonce = randomUUID();
    const body = JSON.stringify(handoff.payload);
    const signature = hmacSha256(secret, `${timestamp}.${nonce}.${body}`);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-titanguard-event": "lead_assessment",
          "x-titanguard-timestamp": timestamp,
          "x-titanguard-nonce": nonce,
          "x-titanguard-signature": signature,
        },
        body,
      });
      const preview = (await response.text()).slice(0, 200);
      if (!response.ok) {
        await ctx.runMutation(internal.assessments.recordHandoffFailure, { handoffId: args.handoffId, responseCode: response.status, responsePreview: preview });
        return { ok: false };
      }
      await ctx.runMutation(internal.assessments.recordHandoffSuccess, { handoffId: args.handoffId, responseCode: response.status });
      return { ok: true };
    } catch (error) {
      await ctx.runMutation(internal.assessments.recordHandoffFailure, {
        handoffId: args.handoffId,
        responseCode: 0,
        responsePreview: error instanceof Error ? error.message.slice(0, 200) : "unknown error",
      });
      return { ok: false };
    }
  },
});

export const processPendingLeadHandoffs = internalAction({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.runQuery(internal.assessments.listDueHandoffs, {});
    const results = [] as Array<{ handoffId: string; ok: boolean }>;
    for (const handoff of pending) {
      const result = await ctx.runAction(internal.assessments.processLeadHandoff, { handoffId: handoff._id });
      results.push({ handoffId: handoff._id, ok: Boolean(result?.ok) });
    }
    return results;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const assessments = await ctx.db.query("assessments").collect();
    return {
      total: assessments.length,
      avgScore: assessments.length > 0 ? Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length) : 0,
      byRisk: {
        critical: assessments.filter((a) => a.riskLevel === "critical").length,
        high: assessments.filter((a) => a.riskLevel === "high").length,
        medium: assessments.filter((a) => a.riskLevel === "medium").length,
        low: assessments.filter((a) => a.riskLevel === "low").length,
      },
    };
  },
});

export const getHandoffForProcessing = internalQuery({
  args: { handoffId: v.id("leadHandoffs") },
  handler: async (ctx, args) => {
    const handoff = await ctx.db.get(args.handoffId);
    if (!handoff) return null;
    const assessment = await ctx.db.get(handoff.assessmentId);
    if (!assessment) return null;
    return {
      handoff,
      payload: {
        assessmentId: assessment._id,
        companyName: assessment.companyName,
        contactEmail: assessment.contactEmail,
        contactName: assessment.contactName,
        industry: assessment.industry,
        employeeCount: assessment.employeeCount,
        overallScore: assessment.overallScore,
        riskLevel: assessment.riskLevel,
        utmSource: assessment.utmSource,
        utmMedium: assessment.utmMedium,
        utmCampaign: assessment.utmCampaign,
        completedAt: assessment.completedAt,
      },
    };
  },
});

export const listDueHandoffs = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const handoffs = await ctx.db.query("leadHandoffs").withIndex("by_status", (q) => q.eq("status", "pending")).collect();
    const retries = await ctx.db.query("leadHandoffs").withIndex("by_status", (q) => q.eq("status", "retry_pending")).collect();
    return [...handoffs, ...retries].filter((row) => (row.nextAttemptAt || 0) <= now);
  },
});

export const recordHandoffSuccess = internalMutation({
  args: { handoffId: v.id("leadHandoffs"), responseCode: v.number() },
  handler: async (ctx, args) => {
    const handoff = await ctx.db.get(args.handoffId);
    if (!handoff) return;
    await ctx.db.patch(args.handoffId, {
      status: "delivered",
      attempts: handoff.attempts + 1,
      lastAttemptAt: Date.now(),
      updatedAt: Date.now(),
      nextAttemptAt: undefined,
      deadLetterReason: undefined,
    });
    await ctx.db.insert("handoffAttempts", {
      handoffId: args.handoffId,
      status: "delivered",
      responseCode: args.responseCode,
      responsePreview: "ok",
      createdAt: Date.now(),
    });
  },
});

export const recordHandoffFailure = internalMutation({
  args: { handoffId: v.id("leadHandoffs"), responseCode: v.number(), responsePreview: v.string() },
  handler: async (ctx, args) => {
    const handoff = await ctx.db.get(args.handoffId);
    if (!handoff) return;
    const attempts = handoff.attempts + 1;
    const shouldDeadLetter = attempts >= HANDOFF_MAX_ATTEMPTS;
    await ctx.db.patch(args.handoffId, {
      status: shouldDeadLetter ? "dead_letter" : "retry_pending",
      attempts,
      lastAttemptAt: Date.now(),
      nextAttemptAt: shouldDeadLetter ? undefined : Date.now() + HANDOFF_RETRY_DELAYS_MS[Math.min(attempts - 1, HANDOFF_RETRY_DELAYS_MS.length - 1)],
      updatedAt: Date.now(),
      deadLetterReason: shouldDeadLetter ? args.responsePreview.slice(0, 200) : undefined,
    });
    await ctx.db.insert("handoffAttempts", {
      handoffId: args.handoffId,
      status: shouldDeadLetter ? "dead_letter" : "retry_pending",
      responseCode: args.responseCode,
      responsePreview: args.responsePreview.slice(0, 200),
      createdAt: Date.now(),
    });
  },
});
