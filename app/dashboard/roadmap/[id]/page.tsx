"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectSaveButton } from "@/components/dashboard/project-save-button";
import { WorkflowSteps } from "@/components/dashboard/workflow-steps";
import { PageHeader } from "@/components/shared/page-header";
import { TimelineRoadmap } from "@/components/dashboard/timeline-roadmap";
import { BuildynexLoader } from "@/components/shared/buildynex-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { Button } from "@/components/ui/button";
import { useAiMode } from "@/context/ai-mode-context";
import { useAuth } from "@/context/auth-context";
import { fetchProjectBundle } from "@/lib/ai/project-assets-client";
import { resolveWorkspaceFromRoute } from "@/lib/projects/resolve-workspace";
import { getStoredRoadmap, mergeTrackedRoadmap, setStoredRoadmap } from "@/lib/projects/project-session";
import { GeneratedProjectBundle, ProblemRecord, ProjectRecord } from "@/lib/types";

export default function RoadmapPage() {
  const params = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const { label, mode } = useAiMode();
  const [problem, setProblem] = useState<ProblemRecord | null>(null);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [bundle, setBundle] = useState<GeneratedProjectBundle | null>(null);
  const [trackedRoadmap, setTrackedRoadmap] = useState<GeneratedProjectBundle["roadmapData"]>([]);
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
          const seededRoadmap = workspace.problem
            ? getStoredRoadmap(workspace.problem.id)
            : null;
          setBundle(workspace.seedBundle);
          setTrackedRoadmap(
            seededRoadmap
              ? mergeTrackedRoadmap(workspace.seedBundle.roadmapData, seededRoadmap)
              : workspace.seedBundle.roadmapData
          );
          setLoading(false);
        }

        if (!workspace.problem) {
          setBundle(null);
          setTrackedRoadmap([]);
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
          const stored = getStoredRoadmap(workspace.problem.id);
          setBundle(nextBundle);
          setTrackedRoadmap(stored ? mergeTrackedRoadmap(nextBundle.roadmapData, stored) : nextBundle.roadmapData);
        }
      } catch (error) {
        if (!cancelled) {
          setAiError(error instanceof Error ? error.message : "Unable to generate the AI roadmap.");
          setBundle(null);
          setTrackedRoadmap([]);
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

  useEffect(() => {
    if (!problem?.id || !trackedRoadmap.length) return;
    setStoredRoadmap(problem.id, trackedRoadmap);
  }, [problem?.id, trackedRoadmap]);

  if (loading && !bundle) {
    return (
      <div className="space-y-6">
        <BuildynexLoader
          title="Building your AI roadmap"
          copy="We are turning the selected problem into a sharper execution plan with milestones, proof points, AI leverage, and realistic risk checks."
          compact
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {["Research", "Validation", "MVP"].map((phase, index) => (
            <div key={phase} className={`premium-card panel-rise p-6 stagger-${index + 1}`}>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/70">
                {phase}
              </div>
              <SkeletonBlock className="mt-4 h-6 w-32" />
              <SkeletonBlock className="mt-5 h-20 w-full" />
              <SkeletonBlock className="mt-4 h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <EmptyState
        title="Roadmap unavailable"
        copy="Activate a saved project or select a valid problem to see the AI execution roadmap."
        actionHref="/dashboard/projects"
        actionLabel="Open projects"
      />
    );
  }

  if (!bundle) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI roadmap" copy="Buildynex uses AI to turn the selected problem into a phased execution roadmap." />
        <div className="premium-card p-8">
          <h2 className="text-2xl font-semibold text-white">AI generation paused</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{aiError || "The AI roadmap could not be generated right now."}</p>
          <div className="mt-6">
            <Button onClick={() => setRetryKey((value) => value + 1)} showArrow={false}>Retry AI generation</Button>
          </div>
        </div>
      </div>
    );
  }

  const displayRoadmap = trackedRoadmap.length ? trackedRoadmap : bundle.roadmapData;

  return (
    <div>
      <PageHeader
        title="AI roadmap"
        copy={`A phased AI-generated plan for turning ${problem.title.toLowerCase()} into a startup execution path.`}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              href={`/dashboard/branding/${workspaceId || problem.id}`}
              variant="secondary"
              className="border-fuchsia-400/20 bg-fuchsia-500/12 text-fuchsia-100 hover:border-fuchsia-300/45 hover:bg-fuchsia-500/18"
            >
              Open Brand Studio
            </Button>
            <ProjectSaveButton
              problem={problem}
              status="Building"
              existingProjectId={project?.id}
              bundle={{ ...bundle, roadmapData: displayRoadmap }}
            />
          </div>
        }
      />
      <WorkflowSteps workspaceId={workspaceId || problem.id} currentStep="roadmap" />
      <div className="mb-8 flex flex-wrap gap-3">
        <Pill tone="info">{role}</Pill>
        <Pill tone="info">{label} AI mode</Pill>
        <Pill tone="success">AI-generated roadmap</Pill>
        <Pill tone="warning">Timeline from research to growth</Pill>
        <Pill tone="info">Focus, proof points, and risk watch included</Pill>
        {project?.projectName ? <Pill tone="info">Active: {project.projectName}</Pill> : null}
      </div>
      {aiError ? (
        <div className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
          {aiError}
        </div>
      ) : null}

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        {displayRoadmap.slice(0, 3).map((step) => (
          <div key={step.phase} className="rounded-[28px] border border-sky-300/18 bg-gradient-to-br from-sky-400/10 via-indigo-500/8 to-white/[0.04] p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-100/70">{step.phase}</div>
            <div className="mt-3 text-xl font-semibold text-white">{step.focus || step.ownerLens}</div>
            <div className="mt-4 text-sm leading-6 text-slate-300">{step.successMetric}</div>
          </div>
        ))}
      </div>

      <TimelineRoadmap steps={displayRoadmap} />

      <div className="mt-8 rounded-[28px] border border-fuchsia-300/15 bg-gradient-to-r from-fuchsia-400/12 to-sky-400/10 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-fuchsia-200/70">Next step</div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Turn the roadmap into an AI brand identity</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Brand Studio uses the same active project and roadmap context to generate names, logo direction, positioning, and tone.
            </p>
          </div>
          <Button href={`/dashboard/branding/${workspaceId || problem.id}`} className="shadow-[0_0_28px_rgba(139,92,246,0.24)]">
            Open Brand Studio
          </Button>
        </div>
      </div>
    </div>
  );
}
