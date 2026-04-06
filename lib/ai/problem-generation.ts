import { ProblemRecord, UserRole } from "@/lib/types";

export interface GenerateProblemsInput {
  role?: UserRole;
  sector?: string;
  budget?: string;
  country?: string;
  experienceLevel?: string;
  goals?: string;
  query?: string;
  count?: number;
}

const VALID_SEVERITIES = ["High", "Medium", "Emerging"] as const;
const VALID_TAGS = ["White Space", "Infrastructure Gap", "Behavior Shift", "Fast-Growth"] as const;
const VALID_ROLES = ["Student", "Founder", "Investor"] as const;
const VALID_WILLINGNESS = ["Low", "Medium", "High"] as const;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asString(entry))
      .filter(Boolean);
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

function clampPainLevel(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(10, Math.round(numeric)));
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return slug || `problem-${Date.now()}`;
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function normalizeTitleKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSeverity(value: unknown, demandScore: number, monetizationScore: number) {
  const direct = VALID_SEVERITIES.find((item) => item === value);
  if (direct) return direct;

  if (demandScore >= 85 || monetizationScore >= 85) return "High";
  if (demandScore >= 70 || monetizationScore >= 70) return "Medium";
  return "Emerging";
}

function normalizeOpportunityTag(value: unknown) {
  return VALID_TAGS.find((item) => item === value) || "Infrastructure Gap";
}

function normalizeWillingnessToPay(value: unknown, monetizationScore: number) {
  const direct = VALID_WILLINGNESS.find((item) => item === value);
  if (direct) return direct;

  if (monetizationScore >= 80) return "High";
  if (monetizationScore >= 55) return "Medium";
  return "Low";
}

function normalizeRoleRecommendations(value: unknown, roleHint?: UserRole) {
  const roles = asStringArray(value).filter((entry): entry is UserRole =>
    VALID_ROLES.includes(entry as UserRole)
  );

  if (roles.length) return uniqueStrings(roles) as UserRole[];
  if (roleHint) return uniqueStrings([roleHint, "Founder"]) as UserRole[];
  return [...VALID_ROLES];
}

function defaultBuildynexScore(demandScore: number, monetizationScore: number, difficultyScore: number, competitionScore: number) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        demandScore * 0.35 +
          monetizationScore * 0.3 +
          (100 - difficultyScore) * 0.2 +
          (100 - competitionScore) * 0.15
      )
    )
  );
}

function normalizeProblemRecord(
  raw: Record<string, unknown>,
  roleHint?: UserRole,
  fallbackSector?: string
): ProblemRecord | null {
  const title = asString(raw.title).replace(/\s+/g, " ").trim();
  if (!title) return null;

  const sector = asString(raw.sector, fallbackSector || "General");
  const demandScore = clampScore(raw.demandScore, 78);
  const monetizationScore = clampScore(raw.monetizationScore, 74);
  const difficultyScore = clampScore(raw.difficultyScore, 52);
  const competitionScore = clampScore(raw.competitionScore, 49);
  const painLevel = clampPainLevel(raw.painLevel, Math.max(6, Math.round(demandScore / 10)));
  const severity = normalizeSeverity(raw.severity, demandScore, monetizationScore);
  const buildynexScore = clampScore(
    raw.buildynexScore ?? raw.aiProblemScore,
    defaultBuildynexScore(demandScore, monetizationScore, difficultyScore, competitionScore)
  );

  const painPoints = uniqueStrings(
    asStringArray(raw.painPoints, [
      "Current workflows create avoidable delays and manual effort.",
      "Users cannot prioritize or resolve the issue with existing tools.",
      "Teams lose money or trust because the signal arrives too late.",
      "The pain compounds as the organization scales.",
    ])
  ).slice(0, 5);

  const targetUsers = uniqueStrings(
    asStringArray(raw.targetUsers, ["Operators", "Managers", "Buyers"])
  ).slice(0, 5);

  return {
    id: slugify(`${sector}-${title}`),
    title,
    description: asString(
      raw.description || raw.detailedDescription,
      `${title} is a recurring workflow problem in ${sector.toLowerCase()} that creates measurable operational pain.`
    ),
    affectedUsers: asString(raw.affectedUsers, targetUsers.join(", ")),
    sector,
    realWorldContext: asString(
      raw.realWorldContext,
      `This pain appears in the day-to-day operating environment where ${targetUsers[0]?.toLowerCase() || "frontline teams"} have to coordinate people, tools, and physical work under time pressure.`
    ),
    painLevel,
    frequency: asString(
      raw.frequency,
      painLevel >= 8 ? "Daily or multiple times per week" : "Weekly and operationally recurring"
    ),
    willingnessToPay: normalizeWillingnessToPay(raw.willingnessToPay, monetizationScore),
    severity,
    demandScore,
    monetizationScore,
    difficultyScore,
    competitionScore,
    buildynexScore,
    aiExplanation: asString(
      raw.aiExplanation,
      "Demand and monetization look promising, but execution quality and differentiation will determine how attractive this opportunity becomes."
    ),
    existingSolutions: asString(
      raw.existingSolutions,
      "Teams usually patch this with spreadsheets, WhatsApp, fragmented SaaS tools, or manual coordination, which breaks under real operating pressure."
    ),
    gapOpportunity: asString(
      raw.gapOpportunity,
      "There is room for a focused product that removes the painful step instead of just reporting on it."
    ),
    aiSolutionPotential: asString(
      raw.aiSolutionPotential,
      "AI can classify issues earlier, reduce manual triage, recommend next actions, and surface the highest-risk cases before teams fall behind."
    ),
    opportunityTag: normalizeOpportunityTag(raw.opportunityTag),
    whyItExists: asString(
      raw.whyItExists,
      "Legacy tools, fragmented workflows, and unclear ownership keep this pain unresolved."
    ),
    painPoints,
    marketNeedSummary: asString(
      raw.marketNeedSummary,
      `Buyers in ${sector.toLowerCase()} need a faster and more reliable way to solve this pain without replacing their full workflow stack.`
    ),
    targetUsers,
    serviceBusinessIdeas: uniqueStrings(
      asStringArray(raw.serviceBusinessIdeas, [
        `Managed operations service for teams dealing with ${title.toLowerCase()}.`,
        `Workflow optimization and reporting service for ${sector.toLowerCase()} operators.`,
        "Implementation and monitoring service that reduces the cost of manual coordination.",
      ])
    ).slice(0, 4),
    physicalProductIdeas: uniqueStrings(
      asStringArray(raw.physicalProductIdeas, [
        `Smart hardware kit that helps teams detect and prevent ${title.toLowerCase()}.`,
        `Sensor-enabled device or tagged equipment add-on for ${sector.toLowerCase()} workflows.`,
        "Compact operational tool that creates clearer real-world visibility at the point of work.",
      ])
    ).slice(0, 4),
    recommendationFor: normalizeRoleRecommendations(raw.recommendationFor, roleHint),
  } satisfies ProblemRecord;
}

export function buildProblemGenerationPrompt(input: GenerateProblemsInput) {
  const count = Math.max(10, Math.min(12, input.count || 10));

  return [
    "You are an expert startup problem analyst and venture capitalist.",
    "Your task is to identify REAL-WORLD PROBLEMS that people are actively facing today across different industries, including both digital services and physical products.",
    "Do not give generic or obvious problems.",
    "Focus on problems that are painful, frequent, urgent, and monetizable.",
    `Return at least ${count} HIGH-QUALITY distinct problems as JSON only using the shape {\"problems\":[...]}.`,
    "Avoid generic AI wrappers, vague social apps, motivation apps, better social media ideas, or overused startup filler.",
    "Make the problems feel discovered from real observation, not imagination.",
    "Focus especially on student problems, small business problems, Indian market problems, daily life inefficiencies, hidden problems people do not talk about, service-sector pains, and physical product opportunities.",
    "Each problem object must include: title, detailedDescription, affectedUsers, targetUsers, painLevel, frequency, willingnessToPay, sector, existingSolutions, gapOpportunity, aiSolutionPotential, realWorldContext, severity, demandScore, monetizationScore, difficultyScore, competitionScore, aiProblemScore, buildynexScore, aiExplanation, opportunityTag, whyItExists, painPoints, marketNeedSummary, serviceBusinessIdeas, physicalProductIdeas, recommendationFor.",
    "Use only these severity values: High, Medium, Emerging.",
    "Use only these opportunityTag values: White Space, Infrastructure Gap, Behavior Shift, Fast-Growth.",
    "Use recommendationFor as an array containing one or more of: Student, Founder, Investor.",
    "Use willingnessToPay as one of: Low, Medium, High.",
    "Pain level must be an integer from 1 to 10.",
    "Scores must be integers from 0 to 100.",
    "Every problem must be rooted in a real operating environment, not abstract software fluff.",
    "Prefer field operations pain, compliance pain, hospitality pain, healthcare operations pain, logistics pain, repair or maintenance pain, workflow pain tied to physical environments, and overlooked service-sector inefficiencies.",
    "For every problem, include 2-4 realistic serviceBusinessIdeas and 2-4 realistic physicalProductIdeas that could be built around the same pain.",
    input.role ? `Primary user role: ${input.role}.` : "Primary user role: Founder.",
    input.sector ? `Sector focus: ${input.sector}.` : "Sector focus: Any strong B2B or workflow-heavy sector.",
    input.country ? `Country or market: ${input.country}.` : "Country or market: India first, then broader global applicability.",
    input.budget ? `Budget context: ${input.budget}.` : "Budget context: Lean early-stage builder constraints.",
    input.experienceLevel ? `Experience level: ${input.experienceLevel}.` : "Experience level: Mixed.",
    input.goals ? `User goals: ${input.goals}.` : "User goals: Find painful, credible problems worth building around.",
    input.query ? `Extra discovery hint from the user: ${input.query}.` : "Extra discovery hint: none.",
    "Existing solutions must explain why the current workaround or tool is weak.",
    "Gap opportunity must explain what is still missing in the market.",
    "AI solution potential must explain exactly how AI can help solve the problem.",
    "Return JSON only. No markdown fences. No commentary.",
  ].join("\n");
}

export function extractJsonString(value: unknown) {
  const raw =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value
            .map((entry) => {
              if (typeof entry === "string") return entry;
              if (entry && typeof entry === "object" && "text" in entry) {
                return asString((entry as { text?: unknown }).text);
              }
              return "";
            })
            .join("\n")
        : "";

  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();

  if (!cleaned) return "";

  const direct = cleaned.trim();
  if ((direct.startsWith("{") && direct.endsWith("}")) || (direct.startsWith("[") && direct.endsWith("]"))) {
    return direct;
  }

  const starts = [cleaned.indexOf("{"), cleaned.indexOf("[")].filter((index) => index >= 0);
  if (!starts.length) {
    return cleaned;
  }

  const start = Math.min(...starts);
  const openChar = cleaned[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return cleaned.slice(start, index + 1);
      }
    }
  }

  return cleaned.slice(start).trim();
}

export function normalizeGeneratedProblems(
  payload: unknown,
  options: { roleHint?: UserRole; fallbackSector?: string } = {}
) {
  const rawProblems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { problems?: unknown }).problems)
      ? (payload as { problems: unknown[] }).problems
      : [];

  return rawProblems
    .map((item) =>
      item && typeof item === "object"
        ? normalizeProblemRecord(item as Record<string, unknown>, options.roleHint, options.fallbackSector)
        : null
    )
    .filter((item): item is ProblemRecord => Boolean(item));
}

function scoreProblem(problem: ProblemRecord) {
  let score = problem.buildynexScore;
  score += (problem.painLevel || 0) * 2;
  score += problem.severity === "High" ? 8 : problem.severity === "Medium" ? 4 : 0;
  score += problem.willingnessToPay === "High" ? 8 : problem.willingnessToPay === "Medium" ? 4 : 0;
  score += problem.serviceBusinessIdeas.length >= 2 ? 4 : 0;
  score += problem.physicalProductIdeas.length >= 2 ? 4 : 0;
  score += problem.description.length > 120 ? 3 : 0;
  score += problem.marketNeedSummary.length > 90 ? 3 : 0;
  return score;
}

function problemFingerprint(problem: ProblemRecord) {
  return `${normalizeTitleKey(problem.title)}|${problem.sector.toLowerCase()}|${problem.opportunityTag.toLowerCase()}`;
}

export function mergeAndRankProblems(problems: ProblemRecord[], targetCount = 10) {
  const seen = new Set<string>();
  const deduped = problems
    .filter((problem) => {
      const key = problemFingerprint(problem);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => scoreProblem(right) - scoreProblem(left));

  const picked: ProblemRecord[] = [];
  const usedSectors = new Set<string>();

  for (const problem of deduped) {
    if (!usedSectors.has(problem.sector) || picked.length >= Math.max(4, targetCount - 3)) {
      picked.push(problem);
      usedSectors.add(problem.sector);
    }
    if (picked.length >= targetCount) break;
  }

  for (const problem of deduped) {
    if (picked.length >= targetCount) break;
    if (!picked.some((item) => item.id === problem.id)) {
      picked.push(problem);
    }
  }

  return picked.slice(0, targetCount);
}
