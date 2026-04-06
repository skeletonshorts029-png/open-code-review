import { mockProblems } from "@/lib/data/mock-problems";
import {
  AuthenticatedUser,
  ProblemRecord,
  ProjectRecord,
  SavedProblemRecord,
  UserProfile,
} from "@/lib/types";
import { isSupabaseConfigured, supabase, supabaseUrl } from "@/lib/supabase/client";

type UserRow = {
  uid: string;
  full_name: string;
  email: string;
  profile_image: string | null;
  role: UserProfile["role"] | null;
  sector: string | null;
  budget: string | null;
  country: string | null;
  experience_level: string | null;
  goals: string | null;
  onboarding_complete: boolean;
  created_at: string | null;
  education_level: string | null;
  skills: string[] | null;
  interests: string[] | null;
  available_time: string | null;
  startup_stage: string | null;
  team_size: string | null;
  existing_idea: string | null;
  revenue_status: string | null;
  ticket_size: string | null;
  preferred_sectors: string[] | null;
  risk_level: string | null;
  preferred_region: string | null;
  notifications: UserProfile["notifications"] | null;
  theme: UserProfile["theme"] | null;
};

type ProblemRow = {
  id: string;
  title: string;
  description: string;
  affected_users: string;
  sector: string;
  real_world_context: string | null;
  severity: ProblemRecord["severity"];
  demand_score: number;
  monetization_score: number;
  difficulty_score: number;
  competition_score: number;
  buildynex_score: number;
  ai_explanation: string;
  opportunity_tag: ProblemRecord["opportunityTag"];
  why_it_exists: string;
  pain_points: string[] | null;
  market_need_summary: string;
  target_users: string[] | null;
  service_business_ideas: string[] | null;
  physical_product_ideas: string[] | null;
  recommendation_for: ProblemRecord["recommendationFor"] | null;
};

type ProjectRow = {
  id: string;
  user_id: string;
  project_name: string;
  selected_problem_id: string;
  selected_problem_title: string;
  sector: string;
  role: ProjectRecord["role"];
  solution_data: ProjectRecord["solutionData"];
  roadmap_data: ProjectRecord["roadmapData"];
  branding_data: ProjectRecord["brandingData"];
  progress_status: ProjectRecord["progressStatus"];
  created_at: string | null;
  updated_at: string | null;
};

type SavedProblemRow = {
  id: string;
  user_id: string;
  problem_id: string;
  saved_at: string | null;
};

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as Partial<T>;
}

function normalizeList(value?: string[] | null) {
  return value || [];
}

function toFriendlyError(error: unknown, fallback: string) {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message || "")
      : error instanceof Error
        ? error.message
        : "";
  const details =
    typeof error === "object" && error !== null && "details" in error
      ? String((error as { details?: unknown }).details || "")
      : "";
  const hint =
    typeof error === "object" && error !== null && "hint" in error
      ? String((error as { hint?: unknown }).hint || "")
      : "";

  const lowerMessage = message.toLowerCase();

  if (message.includes('relation "public.') || lowerMessage.includes("does not exist")) {
    return `${fallback} The Supabase tables are missing. Run the SQL in supabase/schema.sql in your Supabase SQL Editor first.`;
  }

  if (lowerMessage.includes("permission denied") || lowerMessage.includes("row-level security")) {
    return `${fallback} Supabase table policies are blocking access. Run the SQL in supabase/schema.sql so the users/projects/saved_problems policies are created.`;
  }

  if (lowerMessage.includes("bucket not found")) {
    return 'Supabase Storage bucket "profile-images" is missing. Create it or run the SQL in supabase/schema.sql first.';
  }

  if (lowerMessage.includes("failed to fetch")) {
    return `${fallback} Buildynex could not reach Supabase. Check your internet connection, confirm your Supabase URL and publishable key, and try again in a few seconds.`;
  }

  const parts = [message, details, hint].filter(Boolean);
  return parts.length ? parts.join(" ") : fallback;
}

function toUserProfile(row: UserRow): UserProfile {
  return {
    uid: row.uid,
    fullName: row.full_name,
    email: row.email,
    profileImage: row.profile_image || "",
    role: row.role || undefined,
    sector: row.sector || undefined,
    budget: row.budget || undefined,
    country: row.country || undefined,
    experienceLevel: row.experience_level || undefined,
    goals: row.goals || undefined,
    onboardingComplete: row.onboarding_complete,
    createdAt: row.created_at || undefined,
    educationLevel: row.education_level || undefined,
    skills: normalizeList(row.skills),
    interests: normalizeList(row.interests),
    availableTime: row.available_time || undefined,
    startupStage: row.startup_stage || undefined,
    teamSize: row.team_size || undefined,
    existingIdea: row.existing_idea || undefined,
    revenueStatus: row.revenue_status || undefined,
    ticketSize: row.ticket_size || undefined,
    preferredSectors: normalizeList(row.preferred_sectors),
    riskLevel: row.risk_level || undefined,
    preferredRegion: row.preferred_region || undefined,
    notifications: row.notifications || {
      weeklyDigest: true,
      productUpdates: true,
      dealAlerts: true,
    },
    theme: row.theme || "dark",
  };
}

function toProblemRecord(row: ProblemRow): ProblemRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    affectedUsers: row.affected_users,
    sector: row.sector,
    realWorldContext: row.real_world_context || "",
    severity: row.severity,
    demandScore: row.demand_score,
    monetizationScore: row.monetization_score,
    difficultyScore: row.difficulty_score,
    competitionScore: row.competition_score,
    buildynexScore: row.buildynex_score,
    aiExplanation: row.ai_explanation,
    opportunityTag: row.opportunity_tag,
    whyItExists: row.why_it_exists,
    painPoints: normalizeList(row.pain_points),
    marketNeedSummary: row.market_need_summary,
    targetUsers: normalizeList(row.target_users),
    serviceBusinessIdeas: normalizeList(row.service_business_ideas),
    physicalProductIdeas: normalizeList(row.physical_product_ideas),
    recommendationFor: row.recommendation_for || ["Founder"],
  };
}

function toProjectRecord(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectName: row.project_name,
    selectedProblemId: row.selected_problem_id,
    selectedProblemTitle: row.selected_problem_title,
    sector: row.sector,
    role: row.role,
    solutionData: row.solution_data,
    roadmapData: row.roadmap_data,
    brandingData: row.branding_data,
    progressStatus: row.progress_status,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

function toSavedProblemRecord(row: SavedProblemRow): SavedProblemRecord {
  return {
    id: row.id,
    userId: row.user_id,
    problemId: row.problem_id,
    savedAt: row.saved_at || undefined,
  };
}

function toUserRow(uid: string, data: Partial<UserProfile>) {
  return stripUndefined({
    uid,
    full_name: data.fullName,
    email: data.email,
    profile_image: data.profileImage,
    role: data.role,
    sector: data.sector,
    budget: data.budget,
    country: data.country,
    experience_level: data.experienceLevel,
    goals: data.goals,
    onboarding_complete: data.onboardingComplete,
    education_level: data.educationLevel,
    skills: data.skills,
    interests: data.interests,
    available_time: data.availableTime,
    startup_stage: data.startupStage,
    team_size: data.teamSize,
    existing_idea: data.existingIdea,
    revenue_status: data.revenueStatus,
    ticket_size: data.ticketSize,
    preferred_sectors: data.preferredSectors,
    risk_level: data.riskLevel,
    preferred_region: data.preferredRegion,
    notifications: data.notifications,
    theme: data.theme,
  });
}

function toProblemRow(problem: ProblemRecord): ProblemRow {
  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    affected_users: problem.affectedUsers,
    sector: problem.sector,
    real_world_context: problem.realWorldContext,
    severity: problem.severity,
    demand_score: problem.demandScore,
    monetization_score: problem.monetizationScore,
    difficulty_score: problem.difficultyScore,
    competition_score: problem.competitionScore,
    buildynex_score: problem.buildynexScore,
    ai_explanation: problem.aiExplanation,
    opportunity_tag: problem.opportunityTag,
    why_it_exists: problem.whyItExists,
    pain_points: problem.painPoints,
    market_need_summary: problem.marketNeedSummary,
    target_users: problem.targetUsers,
    service_business_ideas: problem.serviceBusinessIdeas,
    physical_product_ideas: problem.physicalProductIdeas,
    recommendation_for: problem.recommendationFor,
  };
}

function toProjectRow(project: ProjectRecord) {
  return stripUndefined({
    id: project.id,
    user_id: project.userId,
    project_name: project.projectName,
    selected_problem_id: project.selectedProblemId,
    selected_problem_title: project.selectedProblemTitle,
    sector: project.sector,
    role: project.role,
    solution_data: project.solutionData,
    roadmap_data: project.roadmapData,
    branding_data: project.brandingData,
    progress_status: project.progressStatus,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  });
}

export function buildFallbackProfile(
  user: AuthenticatedUser,
  data: Partial<UserProfile> = {}
): UserProfile {
  return {
    uid: user.uid,
    fullName: data.fullName || user.displayName || "Buildynex User",
    email: data.email || user.email || "",
    profileImage: data.profileImage || user.photoURL || "",
    onboardingComplete: Boolean(data.onboardingComplete),
    createdAt: data.createdAt || new Date().toISOString(),
    notifications: data.notifications || {
      weeklyDigest: true,
      productUpdates: true,
      dealAlerts: true,
    },
    theme: data.theme || "dark",
    ...data,
  };
}

export async function uploadProfileImage(file: File, uid: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const path = `${uid}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("profile-images").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("profile-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    throw new Error(toFriendlyError(error, "Could not upload your profile image."));
  }
}

export async function createUserProfileDocument(
  user: AuthenticatedUser,
  data: Partial<UserProfile> = {}
) {
  if (!supabase || !isSupabaseConfigured) return buildFallbackProfile(user, data);

  const fallback = buildFallbackProfile(user, data);
  const { data: existingRow, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("uid", user.uid)
    .maybeSingle<UserRow>();

  if (selectError) {
    throw new Error(toFriendlyError(selectError, "Could not load your Supabase profile."));
  }

  if (!existingRow) {
    const insertPayload = toUserRow(user.uid, fallback);
    const { data: insertedRow, error: insertError } = await supabase
      .from("users")
      .upsert(insertPayload, { onConflict: "uid" })
      .select("*")
      .single<UserRow>();

    if (insertError) {
      throw new Error(toFriendlyError(insertError, "Could not create your Supabase profile."));
    }

    return toUserProfile(insertedRow);
  }

  if (Object.keys(data).length) {
    const mergedProfile: UserProfile = {
      ...toUserProfile(existingRow),
      ...data,
      onboardingComplete:
        toUserProfile(existingRow).onboardingComplete || data.onboardingComplete || false,
    };

    const { data: updatedRow, error: updateError } = await supabase
      .from("users")
      .upsert(toUserRow(user.uid, mergedProfile), { onConflict: "uid" })
      .select("*")
      .single<UserRow>();

    if (updateError) {
      throw new Error(toFriendlyError(updateError, "Could not update your Supabase profile."));
    }

    return toUserProfile(updatedRow);
  }

  return toUserProfile(existingRow);
}

export async function getUserProfile(uid: string) {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("uid", uid)
    .maybeSingle<UserRow>();

  if (error) {
    throw new Error(toFriendlyError(error, "Could not load your Supabase profile."));
  }

  return data ? toUserProfile(data) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  try {
    const { data: updatedRow, error } = await supabase
      .from("users")
      .upsert(toUserRow(uid, data), { onConflict: "uid" })
      .select("*")
      .single<UserRow>();

    if (error) {
      throw error;
    }

    return toUserProfile(updatedRow);
  } catch (error) {
    throw new Error(toFriendlyError(error, "Could not save your Supabase profile."));
  }
}

export async function getProblems() {
  if (!supabase || !isSupabaseConfigured) {
    return mockProblems;
  }

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .order("buildynex_score", { ascending: false });

  if (error || !data?.length) {
    return mockProblems;
  }

  return (data as ProblemRow[]).map(toProblemRecord);
}

export async function upsertProblems(problems: ProblemRecord[]) {
  if (!supabase || !isSupabaseConfigured || !problems.length) {
    return;
  }

  const { error } = await supabase
    .from("problems")
    .upsert(problems.map(toProblemRow), { onConflict: "id" });

  if (error) {
    throw new Error(toFriendlyError(error, "Could not save generated problems to Supabase."));
  }
}

export async function getProblemById(id: string) {
  const fromMock = mockProblems.find((problem) => problem.id === id);

  if (!supabase || !isSupabaseConfigured) {
    return fromMock || null;
  }

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .maybeSingle<ProblemRow>();

  if (error || !data) {
    return fromMock || null;
  }

  return toProblemRecord(data);
}

export async function saveProblemForUser(payload: SavedProblemRecord) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const record: SavedProblemRow = {
    id: payload.id || `${payload.userId}_${payload.problemId}`,
    user_id: payload.userId,
    problem_id: payload.problemId,
    saved_at: payload.savedAt || new Date().toISOString(),
  };

  const { error } = await supabase.from("saved_problems").upsert(record, { onConflict: "id" });

  if (error) {
    throw new Error(toFriendlyError(error, "Could not save this analysis to Supabase."));
  }
}

export async function getSavedProblems(userId: string) {
  if (!supabase || !isSupabaseConfigured) return [] as SavedProblemRecord[];

  const { data, error } = await supabase
    .from("saved_problems")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error || !data) {
    return [] as SavedProblemRecord[];
  }

  return (data as SavedProblemRow[]).map(toSavedProblemRecord);
}

export async function saveProject(project: ProjectRecord) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const payload = toProjectRow({
    ...project,
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (project.id) {
    const { error } = await supabase.from("projects").upsert(payload, { onConflict: "id" });
    if (error) {
      throw new Error(toFriendlyError(error, "Could not update this project in Supabase."));
    }
    return project.id;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(toFriendlyError(error, "Could not save this project in Supabase."));
  }

  return data.id;
}

export async function getProjects(userId: string) {
  if (!supabase || !isSupabaseConfigured) return [] as ProjectRecord[];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [] as ProjectRecord[];
  }

  return (data as ProjectRow[]).map(toProjectRecord);
}

export async function getProjectById(projectId: string, userId?: string) {
  if (!supabase || !isSupabaseConfigured) return null;

  let query = supabase.from("projects").select("*").eq("id", projectId);
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle<ProjectRow>();

  if (error || !data) {
    return null;
  }

  return toProjectRecord(data);
}

export async function deleteProject(projectId: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) {
    throw new Error(toFriendlyError(error, "Could not delete this project from Supabase."));
  }
}

export function getSupabaseProjectLabel() {
  if (!supabaseUrl) return "your Supabase project";

  try {
    return new URL(supabaseUrl).hostname.replace(".supabase.co", "");
  } catch {
    return "your Supabase project";
  }
}

