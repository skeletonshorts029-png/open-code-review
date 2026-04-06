import {
  BrandingData,
  GeneratedProjectBundle,
  ProblemRecord,
  ProjectRecord,
  RoadmapStep,
  SolutionData,
  UserProfile,
  UserRole,
} from "@/lib/types";
import { getBrandingData, getRoadmapData, getSolutionData } from "@/lib/data/role-content";

export interface GenerateProjectAssetsInput {
  problem: ProblemRecord;
  profile?: Partial<UserProfile>;
  activeProject?: Partial<ProjectRecord> | null;
}

const VALID_PHASES = ["Research", "Validation", "MVP", "Branding", "Launch", "Growth"] as const;
const VALID_STATUSES = ["Ready", "In Progress", "Up Next"] as const;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value.map((entry) => asString(entry)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,;|]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return fallback;
}

function uniqueStrings(value: string[]) {
  return Array.from(new Set(value.filter(Boolean)));
}

function normalizeRole(role?: UserRole) {
  return role || "Founder";
}

function normalizePhase(value: string) {
  const lower = value.toLowerCase();
  return VALID_PHASES.find((entry) => entry.toLowerCase() === lower) || value;
}

function normalizeStatus(value: string) {
  const lower = value.toLowerCase();
  return VALID_STATUSES.find((entry) => entry.toLowerCase() === lower) || "Up Next";
}

function sectionScore(section: SolutionData["sections"][number]) {
  let score = 0;
  score += section.title.length >= 10 ? 8 : 3;
  score += section.points.length * 8;
  score += section.points.reduce((total, point) => total + Math.min(point.length, 160), 0) / 30;
  const joined = `${section.title} ${section.points.join(" ")}`.toLowerCase();
  if (joined.includes("ai")) score += 6;
  if (joined.includes("gtm") || joined.includes("go-to-market")) score += 5;
  if (joined.includes("monet")) score += 4;
  if (joined.includes("defens")) score += 4;
  return score;
}

function roadmapStepScore(step: RoadmapStep) {
  let score = 0;
  score += step.outputs.length * 8;
  score += step.focus ? Math.min(step.focus.length, 180) / 16 : 0;
  score += step.successMetric ? Math.min(step.successMetric.length, 180) / 18 : 0;
  score += step.keyRisk ? Math.min(step.keyRisk.length, 180) / 18 : 0;
  if (/\d/.test(step.successMetric || "")) score += 8;
  if ((step.keyRisk || "").length > 40) score += 5;
  return score;
}

function brandingScore(branding: BrandingData) {
  let score = 0;
  score += branding.nameIdeas.length * 8;
  score += branding.taglineIdeas.length * 6;
  score += branding.personality.length * 3;
  score += branding.colorPalette.length * 2;
  if (branding.positioning.length > 80) score += 8;
  if (branding.logoPrompt.length > 120) score += 8;
  return score;
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function solutionSectionTitleFingerprint(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeSolutionData(raw: unknown, problem: ProblemRecord, role: UserRole): SolutionData {
  const fallback = getSolutionData(problem, role);
  if (!raw || typeof raw !== "object") return fallback;

  const source = raw as Record<string, unknown>;
  const sections = Array.isArray(source.sections)
    ? source.sections
        .map((section) => {
          if (!section || typeof section !== "object") return null;
          const row = section as Record<string, unknown>;
          const title = asString(row.title);
          const points = uniqueStrings(asStringArray(row.points)).slice(0, 6);
          if (!title || !points.length) return null;
          return { title, points };
        })
        .filter(Boolean) as SolutionData["sections"]
    : [];

  return {
    headline: asString(source.headline, fallback.headline),
    summary: asString(source.summary, fallback.summary),
    sections: sections.length ? sections : fallback.sections,
  };
}

function normalizeRoadmapData(raw: unknown, problem: ProblemRecord, role: UserRole): RoadmapStep[] {
  const fallback = getRoadmapData(problem, role);
  if (!Array.isArray(raw)) return fallback;

  const rows = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const phase = normalizePhase(asString(source.phase));
      const outputs = uniqueStrings(asStringArray(source.outputs)).slice(0, 5);
      if (!phase || !outputs.length) return null;

      return {
        phase,
        duration: asString(source.duration, "Next phase"),
        status: normalizeStatus(asString(source.status)),
        ownerLens: asString(source.ownerLens, `Plan this phase through a ${role.toLowerCase()} lens.`),
        focus: asString(source.focus),
        successMetric: asString(source.successMetric),
        keyRisk: asString(source.keyRisk),
        outputs,
      } satisfies RoadmapStep;
    })
    .filter(Boolean) as RoadmapStep[];

  if (!rows.length) return fallback;

  const byPhase = new Map(rows.map((row) => [row.phase.toLowerCase(), row]));
  return VALID_PHASES.map((phase, index) => byPhase.get(phase.toLowerCase()) || fallback[index]);
}

function normalizeBrandingData(raw: unknown, problem: ProblemRecord): BrandingData {
  const fallback = getBrandingData(problem);
  if (!raw || typeof raw !== "object") return fallback;

  const source = raw as Record<string, unknown>;
  const colorPalette = uniqueStrings(asStringArray(source.colorPalette)).slice(0, 6);
  const nameIdeas = uniqueStrings(asStringArray(source.nameIdeas)).slice(0, 4);
  const taglineIdeas = uniqueStrings(asStringArray(source.taglineIdeas)).slice(0, 4);
  const personality = uniqueStrings(asStringArray(source.personality)).slice(0, 6);

  return {
    nameIdeas: nameIdeas.length ? nameIdeas : fallback.nameIdeas,
    taglineIdeas: taglineIdeas.length ? taglineIdeas : fallback.taglineIdeas,
    positioning: asString(source.positioning, fallback.positioning),
    logoPrompt: asString(source.logoPrompt, fallback.logoPrompt),
    colorPalette: colorPalette.length ? colorPalette : fallback.colorPalette,
    typography: asString(source.typography, fallback.typography),
    personality: personality.length ? personality : fallback.personality,
  };
}

function desiredSolutionSignals(role: UserRole) {
  switch (role) {
    case "Student":
      return [
        "learning loop",
        "manual MVP",
        "first user proof",
        "low-cost launch wedge",
      ];
    case "Investor":
      return [
        "category wedge",
        "fundable insight",
        "expansion path",
        "defensibility signal",
      ];
    default:
      return [
        "ICP wedge",
        "AI advantage",
        "distribution loop",
        "revenue engine",
        "defensibility",
      ];
  }
}

export function buildProjectAssetsPrompt(input: GenerateProjectAssetsInput) {
  const role = normalizeRole(input.profile?.role);
  const problem = input.problem;
  const existingProject = input.activeProject;

  return [
    "You are Buildynex AI, an elite venture studio strategist.",
    "Create premium startup execution assets that feel deeply researched, AI-native, and investor-grade.",
    "Return valid JSON only.",
    'Use this exact top-level JSON shape: {"solutionData":{"headline":"","summary":"","sections":[{"title":"","points":[""]}]},"roadmapData":[{"phase":"","duration":"","status":"","ownerLens":"","focus":"","successMetric":"","keyRisk":"","outputs":[""]}],"brandingData":{"nameIdeas":[""],"taglineIdeas":[""],"positioning":"","logoPrompt":"","colorPalette":[""],"typography":"","personality":[""]}}',
    "No markdown fences. No commentary.",
    `Role lens: ${role}.`,
    input.profile?.budget ? `Budget: ${input.profile.budget}.` : "Budget: lean but credible early-stage execution.",
    input.profile?.country ? `Country or market: ${input.profile.country}.` : "Country or market: global.",
    input.profile?.experienceLevel ? `Experience level: ${input.profile.experienceLevel}.` : "Experience level: mixed.",
    input.profile?.goals ? `Builder goals: ${input.profile.goals}.` : "Builder goals: turn strong problems into actionable startup paths.",
    `Problem title: ${problem.title}.`,
    `Problem sector: ${problem.sector}.`,
    `Problem description: ${problem.description}.`,
    `Affected users: ${problem.affectedUsers}.`,
    `Real-world context: ${problem.realWorldContext}.`,
    `Why it exists: ${problem.whyItExists}.`,
    `Pain points: ${problem.painPoints.join(" | ")}.`,
    `Market need summary: ${problem.marketNeedSummary}.`,
    `Target users: ${problem.targetUsers.join(", ")}.`,
    `Service-business angles: ${problem.serviceBusinessIdeas.join(" | ") || "None provided"}.`,
    `Physical-product angles: ${problem.physicalProductIdeas.join(" | ") || "None provided"}.`,
    `Demand score: ${problem.demandScore}. Monetization score: ${problem.monetizationScore}. Difficulty score: ${problem.difficultyScore}. Competition score: ${problem.competitionScore}. Buildynex score: ${problem.buildynexScore}.`,
    existingProject?.projectName ? `Active project name: ${existingProject.projectName}.` : "No active project name yet.",
    existingProject?.brandingData?.nameIdeas?.length
      ? `Existing active-project brand ideas: ${existingProject.brandingData.nameIdeas.join(", ")}.`
      : "No saved brand ideas yet.",
    existingProject?.solutionData?.headline
      ? `Existing active-project headline to evolve: ${existingProject.solutionData.headline}.`
      : "No saved startup plan yet.",
    existingProject?.roadmapData?.length
      ? `Existing active-project roadmap phases already present: ${existingProject.roadmapData.map((step) => `${step.phase}: ${step.focus || step.ownerLens}`).join(" | ")}.`
      : "No saved roadmap yet.",
    `For solutionData, create 5-6 sharp sections that include signals such as ${desiredSolutionSignals(role).join(", ")}.`,
    "The startup plan must feel AI-generated, decisive, and commercially specific. Avoid generic startup clichés.",
    "Write crisp, forceful section titles and 3-5 concrete points per section.",
    "For roadmapData, output exactly 6 phases in this order: Research, Validation, MVP, Branding, Launch, Growth.",
    "Use only these statuses: Ready, In Progress, Up Next.",
    "Each roadmap step must include a sharply written focus line, a quantitative successMetric, a realistic keyRisk, and 3-5 deliverables that feel specific to this startup, not generic advice.",
    "Durations should show momentum and make the roadmap feel ambitious but believable.",
    "For brandingData, return 3-4 memorable names, 3-4 premium taglines, one category-defining positioning line, one vivid logo prompt for AI logo generation, 4-6 hex colors, one typography direction, and 4-6 personality traits.",
    "Preserve the strongest parts of any active project context, but improve and sharpen them rather than copying blandly.",
    "The final answer should feel like the best synthesis of multiple elite AI strategists working together.",
  ].join("\n");
}

export function normalizeGeneratedProjectBundle(
  payload: unknown,
  input: GenerateProjectAssetsInput
): GeneratedProjectBundle {
  const role = normalizeRole(input.profile?.role);
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  return {
    solutionData: normalizeSolutionData(source.solutionData, input.problem, role),
    roadmapData: normalizeRoadmapData(source.roadmapData, input.problem, role),
    brandingData: normalizeBrandingData(source.brandingData, input.problem),
  };
}

function mergeSolutionSections(bundles: GeneratedProjectBundle[], input: GenerateProjectAssetsInput) {
  const role = normalizeRole(input.profile?.role);
  const fallback = getSolutionData(input.problem, role);
  const allSections = dedupeByKey(
    bundles.flatMap((bundle) => bundle.solutionData.sections),
    (section) => solutionSectionTitleFingerprint(section.title)
  ).sort((left, right) => sectionScore(right) - sectionScore(left));

  const targetCount = Math.max(
    input.activeProject?.solutionData?.sections?.length || 0,
    fallback.sections.length,
    5
  );

  const sections = allSections.slice(0, targetCount);
  const bestBundle = bundles
    .slice()
    .sort((left, right) => scoreGeneratedProjectBundle(right) - scoreGeneratedProjectBundle(left))[0];

  return {
    headline:
      bestBundle?.solutionData.headline ||
      input.activeProject?.solutionData?.headline ||
      fallback.headline,
    summary:
      bestBundle?.solutionData.summary ||
      input.activeProject?.solutionData?.summary ||
      fallback.summary,
    sections: sections.length ? sections : fallback.sections,
  } satisfies SolutionData;
}

function mergeRoadmapSteps(bundles: GeneratedProjectBundle[], input: GenerateProjectAssetsInput) {
  const role = normalizeRole(input.profile?.role);
  const fallback = getRoadmapData(input.problem, role);

  return VALID_PHASES.map((phase, index) => {
    const candidates = bundles
      .flatMap((bundle) => bundle.roadmapData)
      .filter((step) => step.phase.toLowerCase() === phase.toLowerCase())
      .sort((left, right) => roadmapStepScore(right) - roadmapStepScore(left));

    const fromActiveProject = input.activeProject?.roadmapData?.find(
      (step) => step.phase.toLowerCase() === phase.toLowerCase()
    );

    return candidates[0] || fromActiveProject || fallback[index];
  });
}

function mergeBrandingData(bundles: GeneratedProjectBundle[], input: GenerateProjectAssetsInput) {
  const fallback = getBrandingData(input.problem);
  const rankedBranding = bundles
    .map((bundle) => bundle.brandingData)
    .sort((left, right) => brandingScore(right) - brandingScore(left));
  const best = rankedBranding[0] || input.activeProject?.brandingData || fallback;

  const mergedNames = uniqueStrings([
    ...(input.activeProject?.brandingData?.nameIdeas || []),
    ...rankedBranding.flatMap((branding) => branding.nameIdeas),
  ]).slice(0, 4);
  const mergedTaglines = uniqueStrings([
    ...(input.activeProject?.brandingData?.taglineIdeas || []),
    ...rankedBranding.flatMap((branding) => branding.taglineIdeas),
  ]).slice(0, 4);
  const mergedPalette = uniqueStrings([
    ...(input.activeProject?.brandingData?.colorPalette || []),
    ...rankedBranding.flatMap((branding) => branding.colorPalette),
  ]).slice(0, 6);
  const mergedPersonality = uniqueStrings([
    ...(input.activeProject?.brandingData?.personality || []),
    ...rankedBranding.flatMap((branding) => branding.personality),
  ]).slice(0, 6);

  return {
    nameIdeas: mergedNames.length ? mergedNames : best.nameIdeas || fallback.nameIdeas,
    taglineIdeas: mergedTaglines.length ? mergedTaglines : best.taglineIdeas || fallback.taglineIdeas,
    positioning:
      best.positioning ||
      input.activeProject?.brandingData?.positioning ||
      fallback.positioning,
    logoPrompt:
      best.logoPrompt ||
      input.activeProject?.brandingData?.logoPrompt ||
      fallback.logoPrompt,
    colorPalette: mergedPalette.length ? mergedPalette : best.colorPalette || fallback.colorPalette,
    typography:
      best.typography ||
      input.activeProject?.brandingData?.typography ||
      fallback.typography,
    personality: mergedPersonality.length ? mergedPersonality : best.personality || fallback.personality,
  } satisfies BrandingData;
}

export function fuseGeneratedProjectBundles(
  bundles: GeneratedProjectBundle[],
  input: GenerateProjectAssetsInput
): GeneratedProjectBundle {
  if (!bundles.length) {
    return {
      solutionData: getSolutionData(input.problem, normalizeRole(input.profile?.role)),
      roadmapData: getRoadmapData(input.problem, normalizeRole(input.profile?.role)),
      brandingData: getBrandingData(input.problem),
    };
  }

  return {
    solutionData: mergeSolutionSections(bundles, input),
    roadmapData: mergeRoadmapSteps(bundles, input),
    brandingData: mergeBrandingData(bundles, input),
  };
}

export function scoreGeneratedProjectBundle(bundle: GeneratedProjectBundle) {
  let score = 0;
  score += bundle.solutionData.sections.length * 16;
  score += bundle.solutionData.sections.reduce((total, section) => total + section.points.length, 0) * 3;
  score += bundle.roadmapData.length >= 6 ? 24 : bundle.roadmapData.length * 4;
  score += bundle.roadmapData.reduce((total, step) => total + step.outputs.length * 2, 0);
  score += bundle.roadmapData.reduce((total, step) => total + roadmapStepScore(step), 0) / 18;
  score += brandingScore(bundle.brandingData);
  if (bundle.solutionData.summary.length > 140) score += 8;
  if (bundle.solutionData.headline.length > 30) score += 5;
  if (bundle.brandingData.positioning.length > 90) score += 8;
  return score;
}
