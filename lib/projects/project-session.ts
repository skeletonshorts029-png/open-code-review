import { ProjectRecord, RoadmapStep } from "@/lib/types";

const ACTIVE_PROJECT_KEY = "buildynex:active-project";
const ACTIVE_PROJECT_META_KEY = "buildynex:active-project-meta";
const ACTIVE_PROJECT_EVENT = "buildynex:active-project-changed";

export type ActiveProjectSummary = Pick<
  ProjectRecord,
  "id" | "projectName" | "selectedProblemTitle" | "sector" | "role"
>;

function emitActiveProjectChange(summary: ActiveProjectSummary | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ACTIVE_PROJECT_EVENT, {
      detail: summary,
    })
  );
}

export function getActiveProjectId() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function getActiveProjectSummary() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROJECT_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveProjectSummary;
  } catch {
    return null;
  }
}

export function setActiveProjectId(projectId: string, summary?: ActiveProjectSummary) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
    if (summary) {
      window.localStorage.setItem(ACTIVE_PROJECT_META_KEY, JSON.stringify(summary));
      emitActiveProjectChange(summary);
    } else {
      const current = getActiveProjectSummary();
      emitActiveProjectChange(current && current.id === projectId ? current : null);
    }
  } catch {
    // Ignore localStorage failures.
  }
}

export function clearActiveProjectId(projectId?: string) {
  if (typeof window === "undefined") return;
  try {
    const current = window.localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!projectId || current === projectId) {
      window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
      window.localStorage.removeItem(ACTIVE_PROJECT_META_KEY);
      emitActiveProjectChange(null);
    }
  } catch {
    // Ignore localStorage failures.
  }
}

export function subscribeToActiveProject(listener: (summary: ActiveProjectSummary | null) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<ActiveProjectSummary | null>).detail ?? getActiveProjectSummary();
    listener(detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === ACTIVE_PROJECT_KEY || event.key === ACTIVE_PROJECT_META_KEY) {
      listener(getActiveProjectSummary());
    }
  };

  window.addEventListener(ACTIVE_PROJECT_EVENT, onCustom as EventListener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(ACTIVE_PROJECT_EVENT, onCustom as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getActiveWorkspaceHref(section: "solution" | "roadmap" | "branding") {
  const activeProjectId = getActiveProjectId();
  return activeProjectId ? `/dashboard/${section}/${activeProjectId}` : "/dashboard/projects";
}

export function roadmapProgressKey(problemId: string) {
  return `buildynex:roadmap-progress:${problemId}`;
}

export function getStoredRoadmap(problemId: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(roadmapProgressKey(problemId));
    if (!raw) return null;
    return JSON.parse(raw) as RoadmapStep[];
  } catch {
    return null;
  }
}

export function setStoredRoadmap(problemId: string, roadmapData: RoadmapStep[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(roadmapProgressKey(problemId), JSON.stringify(roadmapData));
  } catch {
    // Ignore localStorage failures.
  }
}

export function mergeTrackedRoadmap(baseSteps: RoadmapStep[], savedSteps: RoadmapStep[]) {
  const savedMap = new Map(savedSteps.map((step) => [step.phase, step]));
  return baseSteps.map((step) => {
    const saved = savedMap.get(step.phase);
    return saved
      ? {
          ...step,
          completedByUser: saved.completedByUser,
          startedAt: saved.startedAt,
          completedAt: saved.completedAt,
          timeSpentHours: saved.timeSpentHours,
          experienceSummary: saved.experienceSummary,
          keyFindings: saved.keyFindings,
          blockersNotes: saved.blockersNotes,
          proofPoints: saved.proofPoints,
          reviewScore: saved.reviewScore,
          reviewVerdict: saved.reviewVerdict,
          reviewSummary: saved.reviewSummary,
          reviewStrengths: saved.reviewStrengths,
          reviewConcerns: saved.reviewConcerns,
          reviewNextActions: saved.reviewNextActions,
        }
      : step;
  });
}

export function mergeProjectWithStoredRoadmap(project: ProjectRecord) {
  const stored = getStoredRoadmap(project.selectedProblemId);
  if (!stored?.length) return project;
  return {
    ...project,
    roadmapData: mergeTrackedRoadmap(project.roadmapData, stored),
  };
}
