"use client";

import { useState } from "react";
import { BrandingCard } from "@/components/branding/branding-card";
import { ProjectSaveButton } from "@/components/dashboard/project-save-button";
import { TimelineRoadmap } from "@/components/dashboard/timeline-roadmap";
import { BuildynexLoader } from "@/components/shared/buildynex-loader";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { useAiMode } from "@/context/ai-mode-context";
import { useAuth } from "@/context/auth-context";
import { upsertProblems } from "@/lib/supabase/database";
import { GeneratedProjectBundle, GoalProgressData, ProblemRecord } from "@/lib/types";

interface IdeaProjectResponse {
  error?: string;
  model?: string;
  attemptedModels?: string[];
  problem?: ProblemRecord;
  bundle?: GeneratedProjectBundle;
  goalsData?: GoalProgressData;
}

export default function IdeaLabPage() {
  const { profile } = useAuth();
  const { mode } = useAiMode();
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<ProblemRecord | null>(null);
  const [bundle, setBundle] = useState<GeneratedProjectBundle | null>(null);
  const [goalsData, setGoalsData] = useState<GoalProgressData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  async function generateFromIdea() {
    if (!ideaPrompt.trim()) {
      setError("Add your idea prompt first so Buildynex can turn it into a full project.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/idea-project/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaPrompt: ideaPrompt.trim(),
          profile: {
            role: profile?.role,
            sector: profile?.sector,
            budget: profile?.budget,
            country: profile?.country,
            experienceLevel: profile?.experienceLevel,
            goals: profile?.goals,
          },
          aiMode: mode,
        }),
      });

      const data = (await response.json()) as IdeaProjectResponse;
      if (!response.ok || data.error || !data.problem || !data.bundle || !data.goalsData) {
        throw new Error(data.error || "Buildynex could not generate a full project from that idea.");
      }

      setProblem(data.problem);
      setBundle(data.bundle);
      setGoalsData(data.goalsData);

      try {
        await upsertProblems([data.problem]);
        setSynced(true);
        setMessage(
          `Generated a full AI project${data.model ? ` with ${data.model}` : ""} and synced the problem so you can keep working through Startup Plan, Roadmap, and Brand Studio.`
        );
      } catch {
        setSynced(false);
        setMessage(
          `Generated a full AI project${data.model ? ` with ${data.model}` : ""}. The project is ready here, but syncing the problem to Supabase needs another try before the workflow pages can open.`
        );
      }
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Buildynex could not generate your AI project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Idea Hub"
        copy="Already have a startup idea? Drop the raw prompt here and Buildynex will turn it into a problem-first project with full startup plan, roadmap, branding, and execution goals."
      />

      <div className="premium-card mb-8 p-6 sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[1.15fr,auto]">
          <label className="space-y-3 text-sm text-slate-300">
            <span>Your idea prompt</span>
            <textarea
              className="input-surface min-h-[180px] resize-y"
              placeholder="Example: I want to build something that helps Indian food vendors reduce daily inventory waste and track their top-selling items without learning complex software."
              value={ideaPrompt}
              onChange={(event) => setIdeaPrompt(event.target.value)}
            />
          </label>
          <div className="flex items-end">
            <Button onClick={generateFromIdea} disabled={loading} showArrow={false} className="w-full xl:w-auto">
              {loading ? "Generating project..." : "Generate Full Project"}
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Pill tone="info">{profile?.role || "Founder"} lens</Pill>
          <Pill tone="warning">{profile?.sector || "Cross-sector"} context</Pill>
          <Pill tone="success">{"Problem -> Startup Plan -> Roadmap -> Brand -> Goals"}</Pill>
        </div>

        {message ? (
          <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm leading-7 text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {loading ? (
        <BuildynexLoader
          title="Turning your idea into a full project"
          copy="Buildynex is reframing your idea into a painful problem, a startup wedge, an execution roadmap, a brand, and a set of working goals."
        />
      ) : problem && bundle && goalsData ? (
        <div className="space-y-8">
          <div className="rounded-[28px] border border-sky-300/20 bg-gradient-to-br from-sky-400/14 via-fuchsia-400/10 to-white/[0.06] p-6 sm:p-8 shadow-[0_0_48px_rgba(56,189,248,0.12)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Generated problem</div>
                <h2 className="mt-4 text-3xl font-semibold text-white">{problem.title}</h2>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200">{problem.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill tone="info">{problem.sector}</Pill>
                  <Pill tone="success">Buildynex score {problem.buildynexScore}</Pill>
                  <Pill tone="warning">{problem.opportunityTag}</Pill>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ProjectSaveButton problem={problem} bundle={bundle} />
                <Button href={synced ? `/dashboard/solution/${problem.id}` : undefined} variant="secondary" className="min-w-[200px]" disabled={!synced}>
                  Open Startup Plan
                </Button>
                <Button href={synced ? `/dashboard/goals?project=${problem.id}` : "/dashboard/goals"} variant="secondary" className="min-w-[180px]">
                  View Goals
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {bundle.solutionData.sections.map((section) => (
              <div key={section.title} className="premium-card p-6">
                <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
                <div className="mt-4 space-y-3">
                  {section.points.map((point) => (
                    <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <TimelineRoadmap steps={bundle.roadmapData} />

          <div className="grid gap-6 xl:grid-cols-2">
            <BrandingCard title="Generated company names" items={bundle.brandingData.nameIdeas} />
            <BrandingCard title="Generated taglines" items={bundle.brandingData.taglineIdeas} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="premium-card p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Goal summary</div>
              <h3 className="mt-3 text-2xl font-semibold text-white">{goalsData.overallCompletion}% complete</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{goalsData.milestoneSummary}</p>
            </div>
            <div className="premium-card p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">What to do next</div>
              <div className="mt-4 space-y-3">
                {goalsData.upcomingItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Turn an idea into a full AI project"
          copy="Describe the startup idea you already have, and Buildynex will convert it into a stronger problem statement, startup plan, roadmap, brand, and goals."
        />
      )}
    </div>
  );
}
