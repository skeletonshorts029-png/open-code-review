"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { useAuth } from "@/context/auth-context";
import { getProjects, getSavedProblems } from "@/lib/supabase/database";
import { ProjectRecord, SavedProblemRecord } from "@/lib/types";

export default function DashboardPage() {
  const { profile, user, backendReady } = useAuth();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [savedProblems, setSavedProblems] = useState<SavedProblemRecord[]>([]);

  useEffect(() => {
    async function load() {
      if (!user || !backendReady) return;

      try {
        const [projectRows, savedRows] = await Promise.all([getProjects(user.uid), getSavedProblems(user.uid)]);
        setProjects(projectRows);
        setSavedProblems(savedRows);
      } catch {
        setProjects([]);
        setSavedProblems([]);
      }
    }

    load();
  }, [user, backendReady]);

  return (
    <div>
      <PageHeader
        title="Command center"
        copy="Track your discovery pipeline, saved analyses, and startup execution progress from one premium workspace."
        action={<Button href="/dashboard/idea-lab">Open Idea Hub</Button>}
      />

      <div className="premium-card mb-8 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Pill tone="info">{profile?.role || "Builder mode"}</Pill>
            <h2 className="mt-4 text-3xl font-semibold text-white">Welcome back, {profile?.fullName?.split(" ")[0] || "builder"}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Your workspace is tuned for {profile?.sector || "your chosen sector"}. Continue discovering pain, save strong problems, and move the best opportunity into solution, roadmap, and brand execution.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm text-slate-400">Sector focus</div>
              <div className="mt-2 text-2xl font-semibold text-white">{profile?.sector || "Set in onboarding"}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm text-slate-400">Goal lens</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">{profile?.goals || "Define your goals in onboarding to personalize recommendations."}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Saved analyses" value={String(savedProblems.length)} change="AI problems kept for later review" />
        <DashboardStatCard label="Projects in workspace" value={String(projects.length)} change="Execution assets synced" />
        <DashboardStatCard label="Role lens" value={profile?.role || "Builder"} change="Discovery and planning tuned to your role" />
        <DashboardStatCard label="Sector focus" value={profile?.sector || "Open"} change="AI search will use this when no sector is entered" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">Recent projects</h2>
              <p className="mt-2 text-sm text-slate-400">Resume where you left off.</p>
            </div>
            <Button href="/dashboard/projects" variant="secondary">View all</Button>
          </div>
          <div className="mt-6 space-y-4">
            {projects.length ? (
              projects.slice(0, 3).map((project) => (
                <div key={project.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Pill tone="info">{project.sector}</Pill>
                    <Pill tone="success">{project.progressStatus}</Pill>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{project.projectName}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{project.selectedProblemTitle}</p>
                </div>
              ))
            ) : (
              <EmptyState title="No projects saved yet" copy="Open Idea Hub, turn a raw startup direction into a full AI workspace, and save the strongest project to start your execution library." actionHref="/dashboard/idea-lab" actionLabel="Open Idea Hub" />
            )}
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">Quick actions</h2>
              <p className="mt-2 text-sm text-slate-400">Jump into the next strategic move.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {[
              ["Idea Hub", "/dashboard/idea-lab", "Turn a raw startup idea into a full project, roadmap, and brand."],
              ["Goals", "/dashboard/goals", "Track project progress and score the website you build."],
              ["Review saved analyses", "/dashboard/projects", "Continue from your strongest opportunities."],
              ["Update profile", "/dashboard/profile", "Refine your role, sector, and goals."],
            ].map(([title, href, copy]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-lg font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
                <Button href={href} variant="secondary" className="mt-4">Open</Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <PageHeader title="AI problem discovery" copy="The old pre-made problem cards are removed. Use Idea Hub to turn a rough startup direction into a focused AI problem set and a working project." />
        <EmptyState
          title="No canned problems here"
          copy="Go to Idea Hub, describe the real-world pain or market you want to build in, and Buildynex will generate a focused AI problem set you can turn straight into a startup plan."
          actionHref="/dashboard/idea-lab"
          actionLabel="Open Idea Hub"
        />
      </div>
    </div>
  );
}




