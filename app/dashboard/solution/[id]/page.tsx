"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectSaveButton } from "@/components/dashboard/project-save-button";
import { WorkflowSteps } from "@/components/dashboard/workflow-steps";
import { BuildynexLoader } from "@/components/shared/buildynex-loader";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { Button } from "@/components/ui/button";
import { useAiMode } from "@/context/ai-mode-context";
import { useAuth } from "@/context/auth-context";
import { fetchProjectBundle } from "@/lib/ai/project-assets-client";
import { resolveWorkspaceFromRoute } from "@/lib/projects/resolve-workspace";
import { GeneratedProjectBundle, ProblemRecord, ProjectRecord } from "@/lib/types";

export default function SolutionPage() {
  const params = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const { label, mode } = useAiMode();
  const [problem, setProblem] = useState<ProblemRecord | null>(null);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [bundle, setBundle] = useState<GeneratedProjectBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [workspaceId, setWorkspaceId] = useState("");
  const role = profile?.role || "Founder";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!params?.id) return;
      setLoading(true);
      setAiError(null);

      try {
        const workspace = await resolveWorkspaceFromRoute(params.id, user?.uid);
        if (cancelled) return;

        setWorkspaceId(workspace.routeId);
        setProject(workspace.project);
        setProblem(workspace.problem);

        if (workspace.seedBundle) {
          setBundle(workspace.seedBundle);
          setLoading(false);
        }

        if (!workspace.problem) {
          setBundle(null);
          setLoading(false);
          return;
        }

        const nextBundle = await fetchProjectBundle(
          workspace.problem,
          {
            role: profile?.role,
            budget: profile?.budget,
            country: profile?.country,
            experienceLevel: profile?.experienceLevel,
            goals: profile?.goals,
          },
          mode,
          workspace.project
        );

        if (!cancelled) {
          setBundle(nextBundle);
        }
      } catch (error) {
        if (!cancelled) {
          setAiError(error instanceof Error ? error.message : "Unable to generate the AI startup plan.");
          setBundle(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode, params?.id, profile?.role, profile?.budget, profile?.country, profile?.experienceLevel, profile?.goals, retryKey, user?.uid]);

  if (loading && !bundle) {
    return (
      <div className="space-y-6">
        <BuildynexLoader
          title="Generating your startup plan"
          copy="We are turning the selected problem into a sharper AI strategy, wedge, growth loop, and commercial attack plan."
          compact
        />
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`premium-card panel-rise p-6 sm:p-8 stagger-${(index % 3) + 1}`}>
              <SkeletonBlock className="h-8 w-48" />
              <SkeletonBlock className="mt-5 h-36 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <EmptyState
        title="Solution not found"
        copy="Choose a valid problem or activate a saved project so Buildynex can generate the startup plan."
        actionHref="/dashboard/idea-lab"
        actionLabel="Open Idea Hub"
      />
    );
  }

  if (!bundle) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI startup plan" copy="Buildynex uses AI to turn the selected problem into a role-aware startup strategy." />
        <div className="premium-card p-8">
          <h2 className="text-2xl font-semibold text-white">AI generation paused</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {aiError || "The AI startup plan could not be generated right now."}
          </p>
          <div className="mt-6">
            <Button onClick={() => setRetryKey((value) => value + 1)} showArrow={false}>Retry AI generation</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={bundle.solutionData.headline}
        copy={bundle.solutionData.summary}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              href={`/dashboard/roadmap/${workspaceId || problem.id}`}
              variant="secondary"
              className="border-cyan-400/25 bg-cyan-500/12 text-cyan-100 hover:border-cyan-300/45 hover:bg-cyan-500/18"
            >
              View Roadmap
            </Button>
            <ProjectSaveButton problem={problem} bundle={bundle} existingProjectId={project?.id} />
          </div>
        }
      />
      <WorkflowSteps workspaceId={workspaceId || problem.id} currentStep="solution" />
      <div className="mb-8 flex flex-wrap gap-3">
        <Pill tone="info">{role} mode</Pill>
        <Pill tone="info">{label} AI mode</Pill>
        <Pill tone="success">AI-generated startup plan</Pill>
        <Pill tone="warning">{problem.sector}</Pill>
        {project?.projectName ? <Pill tone="info">Active: {project.projectName}</Pill> : null}
      </div>
      {aiError ? (
        <div className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
          {aiError}
        </div>
      ) : null}

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[28px] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-500/14 via-violet-500/12 to-cyan-400/10 p-6 sm:p-8 shadow-[0_0_48px_rgba(139,92,246,0.14)]">
          <div className="text-sm uppercase tracking-[0.24em] text-fuchsia-100/75">AI venture narrative</div>
          <h2 className="mt-4 text-3xl font-semibold text-white">{bundle.solutionData.headline}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-100/90">{bundle.solutionData.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {bundle.solutionData.sections.slice(0, 3).map((section) => (
              <div key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-100">
                {section.title}
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card p-6 sm:p-8">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">AI strategy board</div>
          <div className="mt-5 space-y-4">
            {bundle.solutionData.sections.slice(0, 3).map((section, index) => (
              <div key={section.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Signal 0{index + 1}</div>
                <div className="mt-2 text-lg font-semibold text-white">{section.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">{section.points[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {bundle.solutionData.sections.map((section) => (
          <div key={section.title} className="premium-card overflow-hidden p-6 sm:p-8">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">
              AI section
            </div>
            <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              {section.points.map((point) => (
                <div key={point} className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] p-4">
                  {point}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[28px] border border-sky-300/15 bg-gradient-to-r from-sky-400/12 to-fuchsia-400/10 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Next step</div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Generate the AI roadmap for this startup plan</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Buildynex will turn this strategy into a sharper execution timeline using the same active-project context.
            </p>
          </div>
          <Button href={`/dashboard/roadmap/${workspaceId || problem.id}`} className="shadow-[0_0_28px_rgba(34,211,238,0.26)]">
            View Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
}
