import {
  GoalProgressData,
  ProblemRecord,
  UserProfile,
} from "@/lib/types";
import { normalizeGeneratedProblems } from "@/lib/ai/problem-generation";
import { normalizeGeneratedProjectBundle } from "@/lib/ai/project-assets";

interface NormalizeIdeaProjectInput {
  profile?: Partial<UserProfile>;
  ideaPrompt: string;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return slug || `idea-${Date.now()}`;
}

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

function clamp(value: unknown, fallback: number, min = 0, max = 100) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function deriveSector(ideaPrompt: string, profile?: Partial<UserProfile>) {
  if (profile?.sector?.trim()) return profile.sector.trim();

  const prompt = ideaPrompt.toLowerCase();
  if (/(student|school|college|campus|tuition|exam|learning|education)/.test(prompt)) return "Education";
  if (/(food|restaurant|kitchen|mess|meal|vendor|delivery|cafe)/.test(prompt)) return "Food Service";
  if (/(health|clinic|patient|hospital|doctor|medical|wellness)/.test(prompt)) return "Healthcare";
  if (/(logistics|shipment|warehouse|dispatch|transport|fleet)/.test(prompt)) return "Logistics";
  if (/(factory|manufacturing|plant|industrial|machine|production)/.test(prompt)) return "Manufacturing";
  if (/(fintech|payment|bank|loan|credit|invoice)/.test(prompt)) return "Fintech";
  if (/(property|housing|rent|broker|real estate)/.test(prompt)) return "Real Estate";
  return "Enterprise AI";
}

function deriveProblemTitle(ideaPrompt: string, sector: string) {
  const cleaned = ideaPrompt
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.?!].*$/, "")
    .slice(0, 72);

  if (cleaned.length >= 24) {
    return cleaned;
  }

  return `Inefficient ${sector.toLowerCase()} workflow coordination`;
}

function deriveTargetUsers(sector: string, role?: string) {
  const roleHint = role || "Founder";

  switch (sector) {
    case "Education":
      return ["Students", "College operators", "Academic coordinators", roleHint];
    case "Food Service":
      return ["Food vendors", "Kitchen operators", "Restaurant managers", roleHint];
    case "Healthcare":
      return ["Patients", "Clinic operators", "Care coordinators", roleHint];
    case "Logistics":
      return ["Dispatch teams", "Fleet operators", "Warehouse managers", roleHint];
    case "Manufacturing":
      return ["Factory supervisors", "Production planners", "Operations teams", roleHint];
    default:
      return ["Operators", "Managers", "Buyers", roleHint];
  }
}

function normalizeGoalsData(raw: unknown, problem: ProblemRecord): GoalProgressData {
  const fallbackSeries = [
    { label: "Week 1", progress: 15, done: true },
    { label: "Week 2", progress: 32, done: true },
    { label: "Week 4", progress: 48, done: false },
    { label: "Week 6", progress: 64, done: false },
    { label: "Week 8", progress: 79, done: false },
    { label: "Week 12", progress: 100, done: false },
  ];

  if (!raw || typeof raw !== "object") {
    return {
      overallCompletion: 32,
      milestoneSummary: `You have framed the ${problem.sector.toLowerCase()} opportunity and now need proof from real users before moving too fast into build mode.`,
      completedItems: ["Problem defined", "Primary user pain mapped", "Initial solution angle drafted"],
      inProgressItems: ["Customer interviews", "Value proposition refinement", "MVP scope cut"],
      upcomingItems: ["Prototype launch", "Landing page build", "Website review and AI scoring"],
      timeSeries: fallbackSeries,
    };
  }

  const source = raw as Record<string, unknown>;
  const timeSeries = Array.isArray(source.timeSeries)
    ? source.timeSeries
        .map((point) => {
          if (!point || typeof point !== "object") return null;
          const row = point as Record<string, unknown>;
          const label = asString(row.label);
          if (!label) return null;
          return {
            label,
            progress: clamp(row.progress, 0),
            done: Boolean(row.done),
          };
        })
        .filter(Boolean) as GoalProgressData["timeSeries"]
    : [];

  return {
    overallCompletion: clamp(source.overallCompletion, 32),
    milestoneSummary: asString(
      source.milestoneSummary,
      `You have shaped the initial opportunity around ${problem.title.toLowerCase()} and now need stronger validation and execution discipline.`
    ),
    completedItems: asStringArray(source.completedItems, [
      "Problem defined",
      "Target users identified",
      "Startup direction drafted",
    ]).slice(0, 6),
    inProgressItems: asStringArray(source.inProgressItems, [
      "Customer interviews",
      "MVP scoping",
      "Landing page positioning",
    ]).slice(0, 6),
    upcomingItems: asStringArray(source.upcomingItems, [
      "Prototype release",
      "Website scoring",
      "Launch planning",
    ]).slice(0, 6),
    timeSeries: timeSeries.length ? timeSeries.slice(0, 6) : fallbackSeries,
  };
}

export function buildIdeaProjectPrompt(input: {
  ideaPrompt: string;
  profile?: Partial<UserProfile>;
}) {
  return [
    "You are Buildynex AI, a premium startup builder for turning rough ideas into full venture-ready project plans.",
    "Take the user's raw idea prompt and convert it into one strong problem-first startup project.",
    "Return JSON only with this exact top-level shape:",
    '{"generatedProblem":{"title":"","detailedDescription":"","affectedUsers":"","targetUsers":[""],"painLevel":8,"frequency":"","willingnessToPay":"High","sector":"","existingSolutions":"","gapOpportunity":"","aiSolutionPotential":"","realWorldContext":"","severity":"High","demandScore":80,"monetizationScore":80,"difficultyScore":50,"competitionScore":40,"aiProblemScore":82,"buildynexScore":82,"aiExplanation":"","opportunityTag":"White Space","whyItExists":"","painPoints":[""],"marketNeedSummary":"","serviceBusinessIdeas":[""],"physicalProductIdeas":[""],"recommendationFor":["Founder"]},"solutionData":{"headline":"","summary":"","sections":[{"title":"","points":[""]}]},"roadmapData":[{"phase":"Research","duration":"","status":"Ready","ownerLens":"","focus":"","successMetric":"","keyRisk":"","outputs":[""]}],"brandingData":{"nameIdeas":[""],"taglineIdeas":[""],"positioning":"","logoPrompt":"","colorPalette":[""],"typography":"","personality":[""]},"goalsData":{"overallCompletion":30,"milestoneSummary":"","completedItems":[""],"inProgressItems":[""],"upcomingItems":[""],"timeSeries":[{"label":"Week 1","progress":15,"done":true}]}}',
    "Do not add markdown fences or extra commentary.",
    "The generatedProblem must be real-world, painful, monetizable, and grounded in actual user workflows.",
    "The solutionData must be role-aware and commercially credible.",
    "The roadmapData must contain exactly 6 phases in this order: Research, Validation, MVP, Branding, Launch, Growth.",
    "Use only roadmap statuses: Ready, In Progress, Up Next.",
    "The goalsData must feel like a founder work tracker with time-based progress and clear completed, in-progress, and upcoming items.",
    input.profile?.role ? `Primary builder role: ${input.profile.role}.` : "Primary builder role: Founder.",
    input.profile?.sector ? `Preferred sector: ${input.profile.sector}.` : "Preferred sector: let the strongest fit emerge from the idea.",
    input.profile?.budget ? `Budget context: ${input.profile.budget}.` : "Budget context: lean early-stage execution.",
    input.profile?.country ? `Country or market: ${input.profile.country}.` : "Country or market: India first with global relevance where useful.",
    input.profile?.experienceLevel ? `Experience level: ${input.profile.experienceLevel}.` : "Experience level: mixed.",
    input.profile?.goals ? `Builder goals: ${input.profile.goals}.` : "Builder goals: generate a full project and execution path from the idea.",
    `Raw idea prompt: ${input.ideaPrompt}.`,
    "Make the problem specific, the project practical, the roadmap concrete, and the goals actionable.",
  ].join("\n");
}

export function normalizeGeneratedIdeaProject(
  payload: unknown,
  input: NormalizeIdeaProjectInput
) {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const generatedProblem = normalizeGeneratedProblems(
    { problems: [source.generatedProblem || source.problem] },
    {
      roleHint: input.profile?.role,
      fallbackSector: input.profile?.sector,
    }
  )[0];

  if (!generatedProblem) {
    throw new Error("The AI response did not include a usable problem for this idea.");
  }

  const bundle = normalizeGeneratedProjectBundle(
    {
      solutionData: source.solutionData,
      roadmapData: source.roadmapData,
      brandingData: source.brandingData,
    },
    {
      problem: generatedProblem,
      profile: input.profile,
    }
  );

  const goalsData = normalizeGoalsData(source.goalsData, generatedProblem);

  return {
    problem: generatedProblem,
    bundle,
    goalsData,
  };
}

export function createFallbackIdeaProject(input: NormalizeIdeaProjectInput) {
  const sector = deriveSector(input.ideaPrompt, input.profile);
  const title = deriveProblemTitle(input.ideaPrompt, sector);
  const targetUsers = deriveTargetUsers(sector, input.profile?.role);
  const role = input.profile?.role || "Founder";

  const fallbackProblem: ProblemRecord = {
    id: slugify(`${sector}-${title}`),
    title,
    description: `Teams dealing with ${title.toLowerCase()} still rely on manual coordination, fragmented tools, and reactive decisions, which slows execution and creates avoidable waste.`,
    affectedUsers: targetUsers.join(", "),
    sector,
    realWorldContext: `This pain appears in live operating environments where ${targetUsers[0].toLowerCase()} need faster coordination, clearer visibility, and fewer manual handoffs.`,
    painLevel: 8,
    frequency: "Weekly and operationally recurring",
    willingnessToPay: "High",
    severity: "High",
    demandScore: 78,
    monetizationScore: 74,
    difficultyScore: 54,
    competitionScore: 46,
    buildynexScore: 79,
    aiExplanation: "The idea points to a credible operational pain with enough urgency and monetization potential to justify a lean first startup direction.",
    existingSolutions: "Teams usually patch this with spreadsheets, chat tools, or generic SaaS workflows that create visibility but do not remove the core bottleneck.",
    gapOpportunity: "There is room for a focused product that removes the painful decision step instead of adding another passive dashboard.",
    aiSolutionPotential: "AI can reduce triage time, recommend next actions, surface risk early, and personalize execution flows based on real usage signals.",
    opportunityTag: "Infrastructure Gap",
    whyItExists: "The workflow still depends on fragmented tools, unclear ownership, and manual follow-up that breaks as complexity rises.",
    painPoints: [
      "Manual coordination slows execution and introduces avoidable delays.",
      "Teams lack a clean way to prioritize the highest-value next action.",
      "Existing tools report on the problem without solving the operating bottleneck.",
      "The pain becomes more expensive as scale and complexity increase.",
    ],
    marketNeedSummary: `Buyers in ${sector.toLowerCase()} need a faster, clearer, and more reliable way to solve this workflow pain without replacing their entire stack.`,
    targetUsers,
    serviceBusinessIdeas: [
      `Implementation and workflow optimization service for ${sector.toLowerCase()} teams handling ${title.toLowerCase()}.`,
      `Managed operations support layer that improves execution quality around ${title.toLowerCase()}.`,
      "Advisory plus analytics offering for teams trying to remove manual coordination waste.",
    ],
    physicalProductIdeas: [
      `Operational hardware add-on that captures workflow state earlier in the ${sector.toLowerCase()} process.`,
      "Sensor or kiosk-based touchpoint that reduces manual updates and creates cleaner live visibility.",
      "Compact field device or physical system that helps teams confirm status and next actions faster.",
    ],
    recommendationFor: [role, "Founder"].filter((value, index, array) => array.indexOf(value) === index) as ProblemRecord["recommendationFor"],
  };

  const bundle = normalizeGeneratedProjectBundle(
    {},
    {
      problem: fallbackProblem,
      profile: input.profile,
    }
  );

  const goalsData = normalizeGoalsData({}, fallbackProblem);

  return {
    problem: fallbackProblem,
    bundle,
    goalsData,
  };
}

export function scoreGeneratedIdeaProject(result: ReturnType<typeof normalizeGeneratedIdeaProject>) {
  let score = result.problem.buildynexScore;
  score += result.bundle.solutionData.sections.length * 10;
  score += result.bundle.roadmapData.length >= 6 ? 12 : 0;
  score += result.bundle.brandingData.nameIdeas.length * 2;
  score += result.goalsData.timeSeries.length * 2;
  score += result.goalsData.completedItems.length;
  return score;
}
