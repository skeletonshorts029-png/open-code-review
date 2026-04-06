"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BuildynexScoreCard } from "@/components/shared/buildynex-score-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressAnalysisChart } from "@/components/shared/progress-analysis-chart";
import { ScoreBadge } from "@/components/shared/score-badge";
import { SaveProblemButton } from "@/components/dashboard/save-problem-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { getProblemById } from "@/lib/supabase/database";
import { ProblemRecord } from "@/lib/types";

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    getProblemById(params.id)
      .then(setProblem)
      .finally(() => setLoading(false));
  }, [params?.id]);

  const chartItems = useMemo(() => {
    if (!problem) return [];
    return [
      { label: "Demand", value: problem.demandScore, tone: "success" as const },
      { label: "Monetization", value: problem.monetizationScore, tone: "primary" as const },
      { label: "Difficulty", value: problem.difficultyScore, tone: "warning" as const },
      { label: "Competition", value: problem.competitionScore, tone: "danger" as const },
    ];
  }, [problem]);

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="premium-card p-6 sm:p-8">
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="mt-5 h-16 w-full" />
            <SkeletonBlock className="mt-6 h-40 w-full" />
          </div>
          <div className="premium-card p-6 sm:p-8">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="mt-6 h-40 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="premium-card p-6">
            <SkeletonBlock className="h-40 w-full" />
          </div>
          <div className="premium-card p-6">
            <SkeletonBlock className="h-56 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return <EmptyState title="Problem not found" copy="The requested opportunity could not be loaded. Explore another problem from the discovery grid." actionHref="/dashboard/discover" actionLabel="Back to discover" />;
  }

  return (
    <div>
      <PageHeader
        title={problem.title}
        copy={problem.description}
        action={<Button href={`/dashboard/solution/${problem.id}`}>Build Startup From This Problem</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="premium-card p-6 sm:p-8">
            <div className="flex flex-wrap gap-3">
              <Pill tone="info">{problem.sector}</Pill>
              <Pill tone={problem.severity === "High" ? "danger" : problem.severity === "Medium" ? "warning" : "info"}>{problem.severity} Severity</Pill>
              <Pill tone="success">{problem.opportunityTag}</Pill>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Who faces it</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{problem.affectedUsers}</p>
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Why it exists</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{problem.whyItExists}</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Real-world context</div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{problem.realWorldContext}</p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Pain points</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {problem.painPoints.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Target users</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {problem.targetUsers.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Market need summary</div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{problem.marketNeedSummary}</p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Pain level</div>
                <div className="mt-3 text-3xl font-semibold text-white">
                  {problem.painLevel ? `${problem.painLevel}/10` : "High"}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Frequency</div>
                <div className="mt-3 text-sm leading-7 text-slate-300">
                  {problem.frequency || "Recurring in day-to-day operations"}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Willingness to pay</div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  {problem.willingnessToPay || "Medium"}
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-fuchsia-300/15 bg-fuchsia-400/10 p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-fuchsia-100/80">Service-sector startup angles</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-100">
                  {problem.serviceBusinessIdeas.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-sky-300/15 bg-sky-400/10 p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-sky-100/80">Physical product angles</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-100">
                  {problem.physicalProductIdeas.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Existing solutions are weak because</div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {problem.existingSolutions || "Existing tools are fragmented, manual, or too generic for this specific pain."}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Gap / opportunity</div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {problem.gapOpportunity || "There is room for a more focused product that solves the painful step instead of just tracking it."}
                </p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-emerald-300/15 bg-emerald-400/10 p-5">
              <div className="text-sm uppercase tracking-[0.24em] text-emerald-100/80">AI solution potential</div>
              <p className="mt-4 text-sm leading-7 text-slate-100">
                {problem.aiSolutionPotential || "AI can help classify, predict, recommend, and automate the highest-friction parts of this workflow."}
              </p>
            </div>
          </div>

          <div className="premium-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">AI Problem Score</h2>
                <p className="mt-2 text-sm text-slate-400">Explainable signals behind the opportunity.</p>
              </div>
              <SaveProblemButton problemId={problem.id} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ScoreBadge score={problem.demandScore} label="Demand Score" />
              <ScoreBadge score={problem.monetizationScore} label="Monetization Potential" />
              <ScoreBadge score={problem.difficultyScore} label="Difficulty Level" />
              <ScoreBadge score={problem.competitionScore} label="Competition Level" />
            </div>
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
              <BuildynexScoreCard score={problem.buildynexScore} explanation={problem.aiExplanation} />
              <div className="premium-card p-6">
                <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Visual analysis</div>
                <div className="mt-5">
                  <ProgressAnalysisChart items={chartItems} />
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5 text-sm leading-7 text-sky-100">
              {problem.aiExplanation}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-card p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-sky-200/70 light-label">What to do next</div>
            <h2 className="mt-4 text-2xl font-semibold text-white">Move this opportunity into execution</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Build a startup concept, role-aware roadmap, and premium brand direction based on this exact problem source.
            </p>
            <div className="mt-6 grid gap-4">
              <Link 
                href={`/dashboard/solution/${problem.id}`} 
                className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-sky-400 hover:shadow-indigo-500/40"
              >
                Build Startup From This Problem
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href={`/dashboard/roadmap/${problem.id}`} 
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-200 transition-all hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-white"
                >
                  Open Roadmap
                </Link>
                <Link 
                  href={`/dashboard/branding/${problem.id}`} 
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-200 transition-all hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-white"
                >
                  Brand Studio
                </Link>
              </div>
            </div>
          </div>
          <div className="premium-card p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Signal summary</div>
            <div className="mt-5 grid gap-4">
              {[
                ["Demand", "Users feel this pain frequently and want a faster path out."],
                ["Monetization", "Budgets exist when the workflow loss is visible enough."],
                ["Difficulty", "Execution is manageable if the scope stays narrow at first."],
                ["Competition", "Differentiation will matter, but there is still room to win."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                  <div className="font-semibold text-white">{title}</div>
                  <div className="mt-1">{copy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
