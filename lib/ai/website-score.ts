import { WebsiteScoreData } from "@/lib/types";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value.map((entry) => asString(entry)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return fallback;
}

function clampScore(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export function htmlToScoringText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

export function buildWebsiteScorePrompt(input: {
  url: string;
  pageTitle?: string;
  pageText: string;
  projectName?: string;
  projectSector?: string;
  projectGoal?: string;
}) {
  return [
    "You are Buildynex AI, a strict startup website reviewer.",
    "Score the website like an investor, founder, and conversion strategist.",
    "Return JSON only with this exact shape:",
    '{"overallScore":78,"messagingScore":80,"trustScore":70,"conversionScore":76,"uxScore":74,"summary":"","strengths":[""],"weaknesses":[""],"nextActions":[""]}',
    "Do not add markdown fences or commentary.",
    `Website URL: ${input.url}.`,
    input.pageTitle ? `Detected page title: ${input.pageTitle}.` : "Detected page title: unavailable.",
    input.projectName ? `Related project name: ${input.projectName}.` : "Related project name: not provided.",
    input.projectSector ? `Related project sector: ${input.projectSector}.` : "Related project sector: not provided.",
    input.projectGoal ? `Related startup goal: ${input.projectGoal}.` : "Related startup goal: not provided.",
    "Score based on clarity of value proposition, trust signals, conversion readiness, and UX quality.",
    "The summary should be concise and direct.",
    "Provide 3-5 strengths, 3-5 weaknesses, and 3-5 nextActions.",
    `Website text snapshot: ${input.pageText || "No readable text found."}`,
  ].join("\n");
}

export function normalizeWebsiteScore(payload: unknown): WebsiteScoreData {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  return {
    overallScore: clampScore(source.overallScore, 72),
    messagingScore: clampScore(source.messagingScore, 74),
    trustScore: clampScore(source.trustScore, 70),
    conversionScore: clampScore(source.conversionScore, 68),
    uxScore: clampScore(source.uxScore, 71),
    summary: asString(
      source.summary,
      "The site has the bones of a real startup presence, but the message, trust cues, and conversion path still need sharpening."
    ),
    strengths: asStringArray(source.strengths, [
      "The site clearly references a specific startup or product concept.",
      "The layout likely gives visitors a fast first impression.",
      "There is enough content for AI to assess the offer direction.",
    ]).slice(0, 5),
    weaknesses: asStringArray(source.weaknesses, [
      "The value proposition is not yet sharp enough on first read.",
      "Trust and proof signals need to be stronger.",
      "The conversion path could be clearer.",
    ]).slice(0, 5),
    nextActions: asStringArray(source.nextActions, [
      "Tighten the hero headline around one painful problem and one user.",
      "Add stronger proof such as outcomes, testimonials, or concrete screenshots.",
      "Clarify the main call to action above the fold.",
    ]).slice(0, 5),
  };
}

export function scoreGeneratedWebsiteReview(review: WebsiteScoreData) {
  return (
    review.overallScore * 2 +
    review.messagingScore +
    review.trustScore +
    review.conversionScore +
    review.uxScore +
    review.strengths.length * 2 +
    review.nextActions.length
  );
}
