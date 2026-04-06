"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoadmapExecutionTracker } from "@/components/dashboard/roadmap-execution-tracker";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { useAiMode } from "@/context/ai-mode-context";
import { useAuth } from "@/context/auth-context";
import { getActiveProjectId, mergeProjectWithStoredRoadmap, setActiveProjectId, setStoredRoadmap } from "@/lib/projects/project-session";
import { getProjects } from "@/lib/supabase/database";
import { GoalProgressData, GoalProgressPoint, ProjectRecord, WebsiteScoreData } from "@/lib/types";

interface WebsiteScoreResponse {
  error?: string;
  model?: string;
  analyzedUrl?: string;
  pageTitle?: string;
  score?: WebsiteScoreData;
}

function progressFromStatus(status: ProjectRecord["progressStatus"]) {
  switch (status) {
    case "Discovery":
      return 18;
    case "Planning":
      return 36;
    case "Validating":
      return 54;
    case "Building":
      return 76;
    case "Launch Ready":
      return 92;
    default:
      return 25;
  }
}

function deriveGoals(project: ProjectRecord): GoalProgressData {
  const hasUserTrackedProgress = project.roadmapData.some((step) => step.completedByUser || step.timeSpentHours);
  const completedPhases = project.roadmapData.filter((step) => step.completedByUser).length;
  const derivedCompletion = project.roadmapData.length
    ? Math.round((completedPhases / project.roadmapData.length) * 100)
    : progressFromStatus(project.progressStatus);
  const phaseProgress = project.roadmapData.length
    ? project.roadmapData.map((step, index) => {
        const progress = Math.round(((index + 1) / project.roadmapData.length) * 100);
        const done = hasUserTrackedProgress ? Boolean(step.completedByUser) : step.status === "Ready";
        return {
          label: step.phase,
          progress,
          done,
        } satisfies GoalProgressPoint;
      })
    : [
        { label: "Research", progress: 18, done: true },
        { label: "Validation", progress: 36, done: false },
        { label: "MVP", progress: 54, done: false },
      ];

  const completedItems = project.roadmapData
    .filter((step) => (hasUserTrackedProgress ? step.completedByUser : step.status === "Ready"))
    .flatMap((step) => step.proofPoints?.length ? step.proofPoints : step.outputs)
    .slice(0, 6);
  const inProgressItems =
    project.roadmapData.find((step) => (hasUserTrackedProgress ? !step.completedByUser : step.status === "In Progress"))?.outputs.slice(0, 6) || [];
  const upcomingItems = project.roadmapData
    .filter((step) => (hasUserTrackedProgress ? !step.completedByUser : step.status === "Up Next"))
    .flatMap((step) => step.outputs)
    .slice(0, 6);

  return {
    overallCompletion: hasUserTrackedProgress ? derivedCompletion : progressFromStatus(project.progressStatus),
    milestoneSummary: hasUserTrackedProgress
      ? `You are now logging real execution data for ${project.projectName}. The graph reflects completed phases, time spent, and the actual proof captured from your roadmap work.`
      : `You have moved ${project.projectName} into ${project.progressStatus.toLowerCase()} mode. The graph below shows how much of the execution path is shaped, what is already done, and what still needs attention.`,
    completedItems: completedItems.length ? completedItems : ["Problem framed", "Initial startup strategy drafted"],
    inProgressItems: inProgressItems.length ? inProgressItems : ["Validation work in progress", "Website and message refinement"],
    upcomingItems: upcomingItems.length ? upcomingItems : ["Launch planning", "Website scoring", "Growth experiments"],
    timeSeries: phaseProgress,
  };
}

function deriveTrackerStats(roadmapData: ProjectRecord["roadmapData"]) {
  const completedCount = roadmapData.filter((step) => step.completedByUser).length;
  const totalHours = roadmapData.reduce((sum, step) => sum + (step.timeSpentHours || 0), 0);
  const averageHours = completedCount ? Math.round((totalHours / completedCount) * 10) / 10 : 0;
  const maxHours = Math.max(1, ...roadmapData.map((step) => step.timeSpentHours || 0));
  return { completedCount, totalHours: Math.round(totalHours * 10) / 10, averageHours, maxHours };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-400 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { user, backendReady } = useAuth();
  const { mode, label } = useAiMode();
  const searchParams = useSearchParams();
  const requestedProject = searchParams.get("project");
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [websiteMessage, setWebsiteMessage] = useState<string | null>(null);
  const [websiteScore, setWebsiteScore] = useState<WebsiteScoreData | null>(null);
  const [trackedRoadmap, setTrackedRoadmap] = useState<ProjectRecord["roadmapData"]>([]);

  useEffect(() => {
    async function loadProjects() {
      if (!user || !backendReady) {
        setLoadingProjects(false);
        return;
      }

      try {
        const rows = await getProjects(user.uid);
        setProjects(rows);
        const activeId = getActiveProjectId();
        const requested = rows.find(
          (project) => project.id === requestedProject || project.selectedProblemId === requestedProject
        );
        const active = rows.find((project) => project.id === activeId);
        const nextProjectId = requested?.id || active?.id || rows[0]?.id || "";
        setSelectedProjectId(nextProjectId);
        if (nextProjectId) {
          setActiveProjectId(nextProjectId);
        }
      } catch {
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    loadProjects();
  }, [backendReady, requestedProject, user]);

  const selectedProject = useMemo(() => {
    const match = projects.find((project) => project.id === selectedProjectId) || null;
    return match ? mergeProjectWithStoredRoadmap(match) : null;
  }, [projects, selectedProjectId]);

  useEffect(() => {
    setTrackedRoadmap(selectedProject?.roadmapData || []);
  }, [selectedProject]);

  const displayProject = useMemo(() => {
    if (!selectedProject) return null;
    return {
      ...selectedProject,
      roadmapData: trackedRoadmap.length ? trackedRoadmap : selectedProject.roadmapData,
    };
  }, [selectedProject, trackedRoadmap]);

  const goalData = displayProject ? deriveGoals(displayProject) : null;

  function patchTrackedStep(phase: string, patch: Partial<ProjectRecord["roadmapData"][number]>) {
    setTrackedRoadmap((current) => {
      const next = current.map((step) => (step.phase === phase ? { ...step, ...patch } : step));
      if (displayProject?.selectedProblemId) {
        setStoredRoadmap(displayProject.selectedProblemId, next);
      }
      return next;
    });
  }

  async function scoreWebsite() {
    if (!websiteUrl.trim()) {
      setWebsiteError("Add the website link first so Buildynex can score it.");
      return;
    }

    setWebsiteLoading(true);
    setWebsiteError(null);
    setWebsiteMessage(null);

    try {
      const response = await fetch("/api/website-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: websiteUrl.trim(),
          projectName: displayProject?.projectName,
          projectSector: displayProject?.sector,
          projectGoal: displayProject?.selectedProblemTitle,
          aiMode: mode,
        }),
      });

      const data = (await response.json()) as WebsiteScoreResponse;
      if (!response.ok || data.error || !data.score) {
        throw new Error(data.error || "Buildynex could not score that website.");
      }

      setWebsiteScore(data.score);
      setWebsiteMessage(
        `Website reviewed in ${label} mode${data.model ? ` with ${data.model}` : ""}${data.pageTitle ? `: ${data.pageTitle}` : ""}.`
      );
    } catch (error) {
      setWebsiteScore(null);
      setWebsiteError(
        error instanceof Error ? error.message : "Buildynex could not score the website."
      );
    } finally {
      setWebsiteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Goals"
        copy="See how much work is done, what is currently in progress, what comes next, and score the website you build with AI."
      />

      {loadingProjects ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="premium-card p-6">
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="mt-5 h-48 w-full" />
          </div>
          <div className="premium-card p-6">
            <SkeletonBlock className="h-8 w-32" />
            <SkeletonBlock className="mt-5 h-48 w-full" />
          </div>
        </div>
      ) : displayProject && goalData ? (
        <div className="space-y-8">
          <div className="premium-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Active project</div>
                <h2 className="mt-3 text-3xl font-semibold text-white">{displayProject.projectName}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{goalData.milestoneSummary}</p>
              </div>
              <Button href="/dashboard/projects" variant="secondary" showArrow={false}>
                Switch active project
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill tone="info">{displayProject.sector}</Pill>
              <Pill tone="info">{label} AI mode</Pill>
              <Pill tone="warning">{displayProject.progressStatus}</Pill>
            </div>
          </div>

          <div className="premium-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Phase review workspace</div>
                <h2 className="mt-3 text-3xl font-semibold text-white">Roadmap phases now live inside Goals</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Mark each phase as done here, answer how you executed it, and let Buildynex judge the quality of the work before it counts toward your completion graph.
                </p>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100">
                Reviews run in <span className="font-semibold text-white">Max Quality</span> mode here
              </div>
            </div>
          </div>

          <RoadmapExecutionTracker
            steps={displayProject.roadmapData}
            problem={{
              id: displayProject.selectedProblemId,
              title: displayProject.selectedProblemTitle,
              description: `Execution tracker for ${displayProject.projectName}.`,
              affectedUsers: displayProject.projectName,
              sector: displayProject.sector,
              realWorldContext: "",
              severity: "High",
              demandScore: 80,
              monetizationScore: 80,
              difficultyScore: 60,
              competitionScore: 55,
              buildynexScore: 86,
              aiExplanation: `Goals execution review for ${displayProject.projectName}.`,
              existingSolutions: "",
              gapOpportunity: "",
              aiSolutionPotential: "",
              opportunityTag: "Infrastructure Gap",
              whyItExists: `This project needs a tracked execution review flow for ${displayProject.projectName}.`,
              painPoints: [],
              marketNeedSummary: displayProject.selectedProblemTitle,
              targetUsers: [],
              serviceBusinessIdeas: [],
              physicalProductIdeas: [],
              recommendationFor: [displayProject.role],
            }}
            role={displayProject.role}
            onStepPatch={patchTrackedStep}
            reviewMode="max"
            reviewModeLabel="Max Quality"
            autoOpenFirstPending
          />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="premium-card p-6">
              <h3 className="text-2xl font-semibold text-white">Done</h3>
              <div className="mt-4 space-y-3">
                {goalData.completedItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card p-6">
              <h3 className="text-2xl font-semibold text-white">In progress</h3>
              <div className="mt-4 space-y-3">
                {goalData.inProgressItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-7 text-amber-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card p-6">
              <h3 className="text-2xl font-semibold text-white">Up next</h3>
              <div className="mt-4 space-y-3">
                {goalData.upcomingItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-4 text-sm leading-7 text-sky-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(() => {
            const { completedCount, totalHours, averageHours, maxHours } = deriveTrackerStats(displayProject.roadmapData);
            return (
              <div className="premium-card p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Goals completion graph</div>
                    <h2 className="mt-3 text-3xl font-semibold text-white">Phase-by-phase execution progress</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                      Each bar reflects time logged per phase. Completed phases glow — pending ones wait. The currently active project drives this tracker, and each reviewed phase updates your goals progress.
                    </p>
                  </div>
                  <div className="grid min-w-[280px] grid-cols-3 gap-3 shrink-0">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Done</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{completedCount}/{displayProject.roadmapData.length}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Hours</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{totalHours}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg / phase</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{averageHours}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
                  <div className="mt-2 flex items-end gap-3 overflow-x-auto pb-2">
                    {displayProject.roadmapData.map((step) => {
                      const hours = step.timeSpentHours || 0;
                      const barHeight = 64 + Math.max(0, Math.min((hours / maxHours) * 160, 160));
                      const active = Boolean(step.completedByUser);
                      return (
                        <div key={step.phase} className="flex min-w-[110px] flex-col items-center gap-3">
                          <div className="text-sm font-semibold text-white">{hours ? `${hours}h` : "--"}</div>
                          <div className="flex h-56 w-full items-end rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
                            <div
                              className={`w-full rounded-[16px] transition-all duration-700 ${
                                active
                                  ? "bg-gradient-to-t from-emerald-400 via-sky-400 to-fuchsia-400 shadow-[0_0_30px_rgba(56,189,248,0.18)]"
                                  : "bg-gradient-to-t from-slate-700 to-slate-500/70"
                              }`}
                              style={{ height: `${barHeight}px` }}
                            />
                          </div>
                          <div className="text-center text-xs leading-5 text-slate-300">{step.phase}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 text-xs leading-6 text-slate-500">
                  The currently active project drives this tracker, and each reviewed phase updates your goals progress.
                </div>
              </div>
            );
          })()}

          <div className="premium-card p-6 sm:p-8">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Roadmap review feedback</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">Goals stay connected to your roadmap work</h2>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {displayProject.roadmapData.map((step) => (
                <div key={step.phase} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xl font-semibold text-white">{step.phase}</div>
                    {step.completedByUser ? <Pill tone="success">Done</Pill> : <Pill tone="warning">Pending</Pill>}
                    {step.reviewVerdict ? <Pill tone="info">{step.reviewVerdict}</Pill> : null}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {step.reviewSummary || `Complete the ${step.phase.toLowerCase()} phase from the roadmap page and Buildynex will review how well you did it.`}
                  </p>
                  {(step.reviewNextActions?.length || 0) > 0 ? (
                    <div className="mt-4 space-y-2">
                      {step.reviewNextActions?.map((item) => (
                        <div key={item} className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm leading-6 text-sky-100">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Website scoring</div>
                <h2 className="mt-3 text-3xl font-semibold text-white">Built the website? Drop the link and let AI score it.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Buildynex will open the site, read the landing page, and score the messaging, trust, UX, and conversion quality using AI.
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  className="input-surface min-w-[320px]"
                  placeholder="https://your-startup-site.com"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                />
                <Button onClick={scoreWebsite} disabled={websiteLoading} showArrow={false}>
                  {websiteLoading ? "Scoring..." : "Score Website"}
                </Button>
              </div>
            </div>

            {websiteMessage ? (
              <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-200">
                {websiteMessage}
              </div>
            ) : null}

            {websiteError ? (
              <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm leading-7 text-rose-200">
                {websiteError}
              </div>
            ) : null}

            {websiteScore ? (
              <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
                <div className="rounded-[28px] border border-sky-300/15 bg-gradient-to-br from-sky-400/14 via-fuchsia-400/10 to-white/[0.06] p-6 shadow-[0_0_40px_rgba(56,189,248,0.12)]">
                  <div className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Overall AI score</div>
                  <div className="mt-4 text-6xl font-semibold text-white">{websiteScore.overallScore}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-200">{websiteScore.summary}</p>
                </div>
                <div className="premium-card border-white/10 bg-white/[0.03] p-6">
                  <div className="space-y-4">
                    <ScoreBar label="Messaging" value={websiteScore.messagingScore} />
                    <ScoreBar label="Trust" value={websiteScore.trustScore} />
                    <ScoreBar label="Conversion" value={websiteScore.conversionScore} />
                    <ScoreBar label="UX" value={websiteScore.uxScore} />
                  </div>
                </div>
              </div>
            ) : null}

            {websiteScore ? (
              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="premium-card border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-xl font-semibold text-white">Strengths</h3>
                  <div className="mt-4 space-y-3">
                    {websiteScore.strengths.map((item) => (
                      <div key={item} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-100">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="premium-card border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-xl font-semibold text-white">Weaknesses</h3>
                  <div className="mt-4 space-y-3">
                    {websiteScore.weaknesses.map((item) => (
                      <div key={item} className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm leading-7 text-rose-100">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="premium-card border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-xl font-semibold text-white">Next actions</h3>
                  <div className="mt-4 space-y-3">
                    {websiteScore.nextActions.map((item) => (
                      <div key={item} className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-4 text-sm leading-7 text-sky-100">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <EmptyState
            title="No saved project yet"
            copy="Generate and save one project first, set it as your active workspace, and then this page will follow that roadmap with progress, reviews, and website scoring."
            actionHref="/dashboard/idea-lab"
            actionLabel="Open Idea Lab"
          />

          <div className="premium-card p-6 sm:p-8">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Website scoring</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">You can still score a website right now.</h2>
            <div className="mt-5 flex gap-3">
              <input
                className="input-surface min-w-[320px]"
                placeholder="https://your-startup-site.com"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
              />
              <Button onClick={scoreWebsite} disabled={websiteLoading} showArrow={false}>
                {websiteLoading ? "Scoring..." : "Score Website"}
              </Button>
            </div>
            {websiteMessage ? (
              <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-200">
                {websiteMessage}
              </div>
            ) : null}
            {websiteError ? (
              <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm leading-7 text-rose-200">
                {websiteError}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
