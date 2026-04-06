import { ProblemRecord, RoadmapStep, UserRole } from "@/lib/types";

type RoadmapReviewInput = {
  problem: ProblemRecord;
  step: RoadmapStep;
  role?: UserRole;
};

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

function uniqueStrings(value: string[]) {
  return Array.from(new Set(value.filter(Boolean)));
}

function clampScore(value: unknown, fallback = 68) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export function buildRoadmapReviewPrompt({ problem, step, role }: RoadmapReviewInput) {
  return [
    "You are Buildynex AI, reviewing a real startup execution phase after the founder completed it.",
    "Evaluate whether this roadmap phase was done well and return JSON only.",
    'Return this exact JSON shape: {"reviewScore":0,"reviewVerdict":"","reviewSummary":"","reviewStrengths":[""],"reviewConcerns":[""],"reviewNextActions":[""]}',
    "Verdict should be one of: Strong, Mixed, Needs Work.",
    `Role lens: ${role || "Founder"}.`,
    `Problem: ${problem.title}.`,
    `Sector: ${problem.sector}.`,
    `Phase: ${step.phase}.`,
    `Expected focus: ${step.focus || "Not provided"}.`,
    `Success signal: ${step.successMetric || "Not provided"}.`,
    `Risk watch: ${step.keyRisk || "Not provided"}.`,
    `Expected outputs: ${step.outputs.join(" | ")}.`,
    `Time spent hours: ${step.timeSpentHours ?? "Unknown"}.`,
    `Started at: ${step.startedAt || "Unknown"}.`,
    `Completed at: ${step.completedAt || "Unknown"}.`,
    `Experience summary from founder: ${step.experienceSummary || "Not provided"}.`,
    `Key findings from founder: ${step.keyFindings || "Not provided"}.`,
    `Blockers or notes: ${step.blockersNotes || "Not provided"}.`,
    `Proof points delivered: ${(step.proofPoints || []).join(" | ") || "Not provided"}.`,
    "Be practical and judgmental in a useful way.",
    "If the work is weak, say why clearly.",
    "If the work is strong, explain what was done well.",
    "Next actions should be concrete and short.",
  ].join("\n");
}

export function normalizeRoadmapReview(payload: unknown, step: RoadmapStep): Partial<RoadmapStep> {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const score = clampScore(source.reviewScore, step.reviewScore ?? 68);
  const verdict = asString(source.reviewVerdict, step.reviewVerdict || (score >= 80 ? "Strong" : score >= 60 ? "Mixed" : "Needs Work"));
  const reviewStrengths = uniqueStrings(asStringArray(source.reviewStrengths)).slice(0, 4);
  const reviewConcerns = uniqueStrings(asStringArray(source.reviewConcerns)).slice(0, 4);
  const reviewNextActions = uniqueStrings(asStringArray(source.reviewNextActions)).slice(0, 4);

  return {
    reviewScore: score,
    reviewVerdict: verdict,
    reviewSummary: asString(source.reviewSummary, step.reviewSummary || ""),
    reviewStrengths,
    reviewConcerns,
    reviewNextActions,
  };
}

export function scoreRoadmapReview(review: Partial<RoadmapStep>) {
  let score = 0;
  if (review.reviewScore !== undefined) score += 20;
  if (review.reviewSummary && review.reviewSummary.length > 80) score += 24;
  score += (review.reviewStrengths?.length || 0) * 8;
  score += (review.reviewConcerns?.length || 0) * 8;
  score += (review.reviewNextActions?.length || 0) * 10;
  return score;
}
