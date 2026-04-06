"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import {
  clearActiveProjectId,
  getActiveProjectId,
  setActiveProjectId,
  subscribeToActiveProject,
} from "@/lib/projects/project-session";
import { ProjectRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ProjectCard({
  project,
  onDelete,
}: {
  project: ProjectRecord;
  onDelete?: (projectId: string) => void;
}) {
  const router = useRouter();
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const isActive = activeProjectId === project.id;

  useEffect(() => {
    setActiveProjectIdState(getActiveProjectId());
    return subscribeToActiveProject((summary) => {
      setActiveProjectIdState(summary?.id || getActiveProjectId());
    });
  }, []);

  function makeActive() {
    if (!project.id) return;
    setActiveProjectId(project.id, {
      id: project.id,
      projectName: project.projectName,
      selectedProblemTitle: project.selectedProblemTitle,
      sector: project.sector,
      role: project.role,
    });
    setActiveProjectIdState(project.id);
  }

  function openRoute(path: string) {
    router.push(path);
  }

  async function handleDelete() {
    if (!project.id || !onDelete) return;
    if (isActive) {
      clearActiveProjectId(project.id);
      setActiveProjectIdState(null);
    }
    await onDelete(project.id);
  }

  return (
    <div className="premium-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Pill tone="info">{project.sector}</Pill>
            <Pill tone="success">{project.progressStatus}</Pill>
            {isActive ? <Pill tone="warning">Active project</Pill> : null}
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-white">{project.projectName}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">{project.selectedProblemTitle}</p>
        </div>
        <div className="text-sm text-slate-500">Created {formatDate(project.createdAt)}</div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          onClick={makeActive}
          className="border-none bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_26px_rgba(139,92,246,0.28)] hover:shadow-[0_0_36px_rgba(34,211,238,0.36)]"
        >
          {isActive ? "Project Activated" : "Activate Project"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => openRoute(`/dashboard/branding/${project.id}`)}
          className="border-fuchsia-400/20 bg-fuchsia-500/12 text-fuchsia-100 hover:border-fuchsia-300/40 hover:bg-fuchsia-500/18"
        >
          Brand Studio
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => openRoute(`/dashboard/solution/${project.id}`)}
          className="border-indigo-500/30 bg-indigo-500/12 text-indigo-100 hover:border-indigo-300/55 hover:bg-indigo-500/20"
        >
          Startup Plan
        </Button>
        <Button
          variant="secondary"
          onClick={() => openRoute(`/dashboard/roadmap/${project.id}`)}
          className="border-cyan-500/25 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-500/18"
        >
          Roadmap
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => openRoute(`/dashboard/problem/${project.selectedProblemId}`)}
          className="border-amber-400/20 bg-amber-500/10 text-amber-100 hover:border-amber-300/45 hover:bg-amber-500/18"
        >
          Problem brief
        </Button>
        
        {project.id && onDelete ? (
          <button 
            className="ml-auto text-sm font-medium text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10" 
            onClick={() => void handleDelete()}
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
