import { GeneratedProjectBundle, ProblemRecord, ProjectRecord } from "@/lib/types";
import { setActiveProjectId } from "@/lib/projects/project-session";
import { getProblemById, getProjectById } from "@/lib/supabase/database";

export interface ResolvedWorkspace {
  routeId: string;
  problem: ProblemRecord | null;
  project: ProjectRecord | null;
  seedBundle: GeneratedProjectBundle | null;
}

export async function resolveWorkspaceFromRoute(id: string, userId?: string): Promise<ResolvedWorkspace> {
  const project = await getProjectById(id, userId);

  if (project) {
    const problem = await getProblemById(project.selectedProblemId);
    if (typeof window !== "undefined" && project.id) {
      setActiveProjectId(project.id, {
        id: project.id,
        projectName: project.projectName,
        selectedProblemTitle: project.selectedProblemTitle,
        sector: project.sector,
        role: project.role,
      });
    }

    return {
      routeId: project.id || id,
      problem,
      project,
      seedBundle: {
        solutionData: project.solutionData,
        roadmapData: project.roadmapData,
        brandingData: project.brandingData,
      },
    };
  }

  const problem = await getProblemById(id);

  return {
    routeId: problem?.id || id,
    problem,
    project: null,
    seedBundle: null,
  };
}
