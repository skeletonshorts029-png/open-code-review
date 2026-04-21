"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BrandingCard } from "@/components/branding/branding-card";
import { LogoConceptGallery } from "@/components/branding/logo-concept-gallery";
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
import { fuseGeneratedProjectBundles } from "@/lib/ai/project-assets";
import { fetchProjectBundle, getCachedProjectBundleError } from "@/lib/ai/project-assets-client";
import { resolveWorkspaceFromRoute } from "@/lib/projects/resolve-workspace";
import { GeneratedProjectBundle, ProblemRecord, ProjectRecord } from "@/lib/types";

export default function BrandingPage() {
  const params = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const { mode } = useAiMode();
  const [problem, setProblem] = useState<ProblemRecord | null>(null);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [bundle, setBundle] = useState<GeneratedProjectBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [workspaceId, setWorkspaceId] = useState("");

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
          if (workspace.problem) {
            setAiError(
              getCachedProjectBundleError(
                workspace.problem.id,
                profile?.role,
                mode,
                workspace.project?.id
              )
            );
          }
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
          setAiError(
            getCachedProjectBundleError(
              workspace.problem.id,
              profile?.role,
              mode,
              workspace.project?.id
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAiError(error instanceof Error ? error.message : "Unable to generate the AI brand studio assets.");
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
          title="Generating your brand studio"
          copy="We are shaping company names, positioning, logo systems, and identity cues around the same active project."
          compact
        />
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`premium-card panel-rise p-6 stagger-${(index % 3) + 1}`}>
              <SkeletonBlock className="h-8 w-48" />
              <SkeletonBlock className="mt-5 h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <EmptyState
        title="Brand studio not found"
        copy="Activate a saved project or choose a valid problem to generate the brand direction."
        actionHref="/dashboard/projects"
        actionLabel="Open projects"
      />
    );
  }

  if (!bundle) {
    const fallbackBundle = problem
      ? fuseGeneratedProjectBundles([], {
          problem,
          profile: {
            role: profile?.role,
            budget: profile?.budget,
            country: profile?.country,
            experienceLevel: profile?.experienceLevel,
            goals: profile?.goals,
          },
          activeProject: project,
        })
      : null;

    if (fallbackBundle && problem) {
      const branding = fallbackBundle.brandingData;

      return (
        <div>
          <PageHeader
            title="AI Brand Studio"
            copy="Buildynex is showing a local fallback brand direction while the live AI bundle catches up."
            action={<ProjectSaveButton problem={problem} bundle={fallbackBundle} status="Building" existingProjectId={project?.id} />}
          />
          <WorkflowSteps workspaceId={workspaceId || problem.id} currentStep="branding" />
          <div className="mb-8 flex flex-wrap gap-3">
            <Pill tone="info">{problem.sector}</Pill>
            <Pill tone="warning">Fallback brand direction</Pill>
            {project?.projectName ? <Pill tone="info">Active: {project.projectName}</Pill> : null}
          </div>
          <div className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
            <div className="font-semibold text-white">Fallback reason</div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs leading-6 text-amber-100">
              {aiError || "The live AI brand studio hit an error, so Buildynex is using a fallback brand direction instead."}
            </pre>
          </div>
          <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[28px] border border-sky-300/20 bg-gradient-to-br from-sky-400/14 via-fuchsia-400/10 to-white/[0.06] p-6 sm:p-8 shadow-[0_0_48px_rgba(56,189,248,0.12)]">
              <div className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Featured AI concept</div>
              <h2 className="mt-4 text-3xl font-semibold text-white">{branding.nameIdeas[0]}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-200">{branding.positioning}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {branding.colorPalette.map((color) => (
                  <div key={color} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100">
                    {color}
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card p-6 sm:p-8">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Logo direction</div>
              <h2 className="mt-4 text-2xl font-semibold text-white">Logo design concept</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{branding.logoPrompt}</p>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                <strong className="text-white">Typography suggestion:</strong> {branding.typography}
              </div>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <BrandingCard title="Company name ideas" items={branding.nameIdeas} />
            <BrandingCard title="Tagline ideas" items={branding.taglineIdeas} />
            <BrandingCard title="Color palette suggestion" items={branding.colorPalette} />
            <BrandingCard title="Brand personality traits" items={branding.personality} />
          </div>
          <div className="mt-6">
            <LogoConceptGallery branding={branding} problem={problem} projectId={project?.id} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PageHeader title="AI Brand Studio" copy="Buildynex uses AI to turn the selected problem into brand positioning and identity direction." />
        <div className="premium-card p-8">
          <h2 className="text-2xl font-semibold text-white">AI generation paused</h2>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs leading-6 text-slate-300">
            {aiError || "The AI brand studio could not be generated right now."}
          </pre>
          <div className="mt-6">
            <Button onClick={() => setRetryKey((value) => value + 1)} showArrow={false}>Retry AI generation</Button>
          </div>
        </div>
      </div>
    );
  }

  const branding = bundle.brandingData;

  return (
    <div>
      <PageHeader
        title="AI Brand Studio"
        copy="Generate a premium identity direction that fits the active problem, market, and startup narrative."
        action={<ProjectSaveButton problem={problem} bundle={bundle} status="Building" existingProjectId={project?.id} />}
      />
      <WorkflowSteps workspaceId={workspaceId || problem.id} currentStep="branding" />
      <div className="mb-8 flex flex-wrap gap-3">
        <Pill tone="info">{problem.sector}</Pill>
        <Pill tone="success">AI-generated brand direction</Pill>
        {project?.projectName ? <Pill tone="info">Active: {project.projectName}</Pill> : null}
      </div>
      {aiError ? (
        <div className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
          <div className="font-semibold text-white">Last AI issue</div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs leading-6 text-amber-100">
            {aiError}
          </pre>
        </div>
      ) : null}
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[28px] border border-sky-300/20 bg-gradient-to-br from-sky-400/14 via-fuchsia-400/10 to-white/[0.06] p-6 sm:p-8 shadow-[0_0_48px_rgba(56,189,248,0.12)]">
          <div className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Featured AI concept</div>
          <h2 className="mt-4 text-3xl font-semibold text-white">{branding.nameIdeas[0]}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">{branding.positioning}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {branding.colorPalette.map((color) => (
              <div key={color} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100">
                {color}
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card p-6 sm:p-8">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Logo direction</div>
          <h2 className="mt-4 text-2xl font-semibold text-white">Logo design concept</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{branding.logoPrompt}</p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
            <strong className="text-white">Typography suggestion:</strong> {branding.typography}
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <BrandingCard title="Company name ideas" items={branding.nameIdeas} />
        <BrandingCard title="Tagline ideas" items={branding.taglineIdeas} />
        <BrandingCard title="Color palette suggestion" items={branding.colorPalette} />
        <BrandingCard title="Brand personality traits" items={branding.personality} />
      </div>
      <div className="mt-6">
        <LogoConceptGallery branding={branding} problem={problem} projectId={project?.id} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="premium-card p-6">
          <h2 className="text-2xl font-semibold text-white">Brand positioning line</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{branding.positioning}</p>
        </div>
        <div className="premium-card p-6">
          <h2 className="text-2xl font-semibold text-white">Launch-ready identity note</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Use <span className="font-semibold text-white">{branding.nameIdeas[0]}</span> as the lead concept, pair it with the strongest tagline, and keep the visual system close to the logo prompt so the product, pitch deck, and landing page feel like one story.
          </p>
        </div>
      </div>
    </div>
  );
}
