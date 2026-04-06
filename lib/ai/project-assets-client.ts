import { AiMode } from "@/lib/ai/ai-mode";
import { GeneratedProjectBundle, ProblemRecord, ProjectRecord, UserProfile } from "@/lib/types";

interface ProjectAssetsResponse extends GeneratedProjectBundle {
  error?: string;
  model?: string;
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

  const response = await fetch("/api/project-assets/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problem, profile, aiMode, activeProject }),
  });

  const data = (await response.json()) as ProjectAssetsResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error || "Failed to generate AI project assets.");
  }

  const bundle: GeneratedProjectBundle = {
    solutionData: data.solutionData,
    roadmapData: data.roadmapData,
    brandingData: data.brandingData,
  };

  setCachedProjectBundle(problem.id, profile?.role, aiMode, bundle, activeProject?.id);
  return bundle;
}
