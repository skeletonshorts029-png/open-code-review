import { AiMode } from "@/lib/ai/ai-mode";
import { fuseGeneratedProjectBundles } from "@/lib/ai/project-assets";
import { GeneratedProjectBundle, ProblemRecord, ProjectRecord, UserProfile } from "@/lib/types";

interface ProjectAssetsResponse extends Partial<GeneratedProjectBundle> {
  error?: string;
  model?: string;
}

function errorKey(problemId: string, role?: string, aiMode: AiMode = "balanced", projectId?: string) {
  return `buildynex:ai-bundle-error:${projectId || problemId}:${problemId}:${role || "Founder"}:${aiMode}`;
}

function cacheKey(problemId: string, role?: string, aiMode: AiMode = "balanced", projectId?: string) {
  return `buildynex:ai-bundle:${projectId || problemId}:${problemId}:${role || "Founder"}:${aiMode}`;
}

export function getCachedProjectBundle(
  problemId: string,
  role?: string,
  aiMode: AiMode = "balanced",
  projectId?: string
): GeneratedProjectBundle | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(cacheKey(problemId, role, aiMode, projectId));
    if (!raw) return null;
    return JSON.parse(raw) as GeneratedProjectBundle;
  } catch {
    return null;
  }
}

export function setCachedProjectBundle(
  problemId: string,
  role: string | undefined,
  aiMode: AiMode,
  bundle: GeneratedProjectBundle,
  projectId?: string
) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(cacheKey(problemId, role, aiMode, projectId), JSON.stringify(bundle));
  } catch {
    // Ignore storage write failures and continue with in-memory usage.
  }
}

export function getCachedProjectBundleError(
  problemId: string,
  role?: string,
  aiMode: AiMode = "balanced",
  projectId?: string
) {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(errorKey(problemId, role, aiMode, projectId));
  } catch {
    return null;
  }
}

function setCachedProjectBundleError(
  problemId: string,
  role: string | undefined,
  aiMode: AiMode,
  errorMessage: string | null,
  projectId?: string
) {
  if (typeof window === "undefined") return;

  try {
    const key = errorKey(problemId, role, aiMode, projectId);
    if (errorMessage) {
      window.sessionStorage.setItem(key, errorMessage);
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore sessionStorage failures and continue.
  }
}

export async function fetchProjectBundle(
  problem: ProblemRecord,
  profile?: Partial<UserProfile>,
  aiMode: AiMode = "balanced",
  activeProject?: Partial<ProjectRecord> | null
) {
  const cached = getCachedProjectBundle(problem.id, profile?.role, aiMode, activeProject?.id);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch("/api/project-assets/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ problem, profile, aiMode, activeProject }),
    });

    const rawText = await response.text();
    let data = {} as ProjectAssetsResponse;
    try {
      data = rawText ? (JSON.parse(rawText) as ProjectAssetsResponse) : ({} as ProjectAssetsResponse);
    } catch {
      data = { error: rawText || "Failed to parse AI project assets response." };
    }
    if (!response.ok || data.error) {
      throw new Error(data.error || rawText || "Failed to generate AI project assets.");
    }
    if (!data.solutionData || !data.roadmapData || !data.brandingData) {
      throw new Error(rawText || "AI project assets response was incomplete.");
    }

    const bundle: GeneratedProjectBundle = {
      solutionData: data.solutionData,
      roadmapData: data.roadmapData,
      brandingData: data.brandingData,
    };

    setCachedProjectBundleError(problem.id, profile?.role, aiMode, data.error || null, activeProject?.id);
    setCachedProjectBundle(problem.id, profile?.role, aiMode, bundle, activeProject?.id);
    return bundle;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate AI project assets.";
    const fallbackBundle = fuseGeneratedProjectBundles([], {
      problem,
      profile,
      activeProject,
    });

    setCachedProjectBundleError(problem.id, profile?.role, aiMode, errorMessage, activeProject?.id);
    setCachedProjectBundle(problem.id, profile?.role, aiMode, fallbackBundle, activeProject?.id);
    return fallbackBundle;
  }
}
