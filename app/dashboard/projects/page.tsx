"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { useAuth } from "@/context/auth-context";
import { deleteProject, getProjects } from "@/lib/supabase/database";
import { ProjectRecord } from "@/lib/types";

export default function ProjectsPage() {
  const { user, backendReady } = useAuth();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
    async function load() {
      if (!user || !backendReady) return;

      try {
        setProjects(await getProjects(user.uid));
      } catch {
        setProjects([]);
      }
    }

    load();
  }, [user, backendReady]);

  async function handleDelete(projectId: string) {
    await deleteProject(projectId);
    setProjects((current) => current.filter((project) => project.id !== projectId));
  }

  return (
    <div>
      <PageHeader title="Saved startup projects" copy="Every project keeps the original problem, role-aware solution, roadmap, and brand direction connected in one record." />
      <div className="space-y-6">
        {projects.length ? (
          projects.map((project) => <ProjectCard key={project.id} project={project} onDelete={handleDelete} />)
        ) : (
          <EmptyState title="No saved projects yet" copy="Open a problem, generate a solution, and save it to your workspace so you can revisit it later from this page." actionHref="/dashboard/discover" actionLabel="Discover problems" />
        )}
      </div>
    </div>
  );
}





