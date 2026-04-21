"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiMode } from "@/lib/ai/ai-mode";
import { ProblemRecord, RoadmapStep, UserRole } from "@/lib/types";

interface ReviewStepResponse {
  error?: string;
  review?: Partial<RoadmapStep>;
  model?: string;
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function parseProofPoints(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getGuidanceCopy(step: RoadmapStep) {
  if (step.phase.toLowerCase() === "research") {
    return "Tell Buildynex how you researched, who you spoke to, what signals you trusted, and what you discovered so AI can judge whether the research was actually strong.";
  }

  return "Tell Buildynex what you did in this phase, what evidence you collected, and what changed in your thinking so AI can tell you whether you are on the right track.";
}

export function RoadmapExecutionTracker({
  steps,
  problem,
  role,
  onStepPatch,
  reviewMode,
  autoOpenFirstPending,
}: {
  steps: RoadmapStep[];
  problem: ProblemRecord;
  role: UserRole;
  onStepPatch: (phase: string, patch: Partial<RoadmapStep>) => void;
  reviewMode?: AiMode;
  autoOpenFirstPending?: boolean;
}) {
  const effectiveMode = reviewMode || "balanced";
  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [submittingPhase, setSubmittingPhase] = useState<string | null>(null);
  const [phaseErrors, setPhaseErrors] = useState<Record<string, string>>({});
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    if (!autoOpenFirstPending || openPhase || hasAutoOpened) return;
    const firstPending = steps.find((step) => !step.completedByUser);
    if (firstPending) {
      setOpenPhase(firstPending.phase);
      setHasAutoOpened(true);
    }
  }, [autoOpenFirstPending, hasAutoOpened, openPhase, steps]);


  async function reviewAndComplete(step: RoadmapStep) {
    if (!step.experienceSummary?.trim() || !step.keyFindings?.trim()) {
      setPhaseErrors((current) => ({
        ...current,
        [step.phase]: "Add how the phase went and what you found before Buildynex marks it done.",
      }));
      return;
    }

    setSubmittingPhase(step.phase);
    setPhaseErrors((current) => ({ ...current, [step.phase]: "" }));

    const reviewedStep: RoadmapStep = {
      ...step,
      startedAt: step.startedAt || new Date().toISOString(),
      completedAt: step.completedAt || new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/roadmap/review-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem,
          step: reviewedStep,
          role,
          aiMode: effectiveMode,
        }),
      });

      const data = (await response.json()) as ReviewStepResponse;
      if (!response.ok || data.error || !data.review) {
        throw new Error(data.error || "Buildynex could not review this roadmap phase yet.");
      }

      onStepPatch(step.phase, {
        ...reviewedStep,
        ...data.review,
        completedByUser: true,
      });

      setPhaseErrors((current) => ({
        ...current,
        [step.phase]: data.model
          ? `Reviewed with ${data.model}. The graph and goals are now updated.`
          : `Reviewed successfully. The graph and goals are now updated.`,
      }));
      setOpenPhase(null);
    } catch (error) {
      setPhaseErrors((current) => ({
        ...current,
        [step.phase]:
          error instanceof Error ? error.message : "Buildynex could not review this roadmap phase.",
      }));
    } finally {
      setSubmittingPhase(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 sm:p-8">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Execution tracker</div>
          <h2 className="mt-3 text-3xl font-semibold text-white">Complete each roadmap phase with AI review</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Before a phase is marked done, Buildynex asks how you actually executed it, what you found, and how long it took. Then AI tells you whether you are doing well and updates the goals graph.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {steps.map((step, index) => {
          const isExpanded = openPhase === step.phase;
          const reviewMessage = phaseErrors[step.phase];

          return (
            <div key={step.phase} className="premium-card p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Phase {index + 1}</div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{step.phase}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    {step.focus || "Use this space to capture how the work actually went once you execute the phase."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {step.completedByUser ? (
                    <>
                      <Button variant="secondary" onClick={() => setOpenPhase(isExpanded ? null : step.phase)} showArrow={false}>
                        {isExpanded ? "Hide review" : "Edit review"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          onStepPatch(step.phase, {
                            completedByUser: false,
                            reviewScore: undefined,
                            reviewVerdict: undefined,
                            reviewSummary: undefined,
                            reviewStrengths: [],
                            reviewConcerns: [],
                            reviewNextActions: [],
                          })
                        }
                        showArrow={false}
                      >
                        Mark as not done
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setOpenPhase(isExpanded ? null : step.phase)} showArrow={false}>
                      {isExpanded ? "Close questions" : `Review ${step.phase} and mark done`}
                    </Button>
                  )}
                </div>
              </div>

              {step.completedByUser ? (
                <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      Completed
                    </div>
                    {step.reviewVerdict ? (
                      <div className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                        {step.reviewVerdict}
                      </div>
                    ) : null}
                    {step.reviewScore !== undefined ? (
                      <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-100">
                        Score {step.reviewScore}/100
                      </div>
                    ) : null}
                    {step.timeSpentHours ? (
                      <div className="text-sm text-slate-300">{step.timeSpentHours}h logged</div>
                    ) : null}
                  </div>
                  {step.reviewSummary ? (
                    <p className="mt-4 text-sm leading-7 text-slate-100">{step.reviewSummary}</p>
                  ) : null}
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {(step.reviewStrengths?.length || 0) > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">What you did well</div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {step.reviewStrengths?.map((item) => <div key={item}>{item}</div>)}
                        </div>
                      </div>
                    ) : null}
                    {(step.reviewConcerns?.length || 0) > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Watchouts</div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {step.reviewConcerns?.map((item) => <div key={item}>{item}</div>)}
                        </div>
                      </div>
                    ) : null}
                    {(step.reviewNextActions?.length || 0) > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Next actions</div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {step.reviewNextActions?.map((item) => <div key={item}>{item}</div>)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {isExpanded ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300 lg:col-span-2">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">What Buildynex will check</div>
                    <div className="mt-3">{getGuidanceCopy(step)}</div>
                  </div>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>When did you start this phase?</span>
                    <input
                      type="date"
                      className="input-surface"
                      value={toDateInputValue(step.startedAt)}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          startedAt: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>When did you finish it?</span>
                    <input
                      type="date"
                      className="input-surface"
                      value={toDateInputValue(step.completedAt)}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          completedAt: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>How much time did it take in total?</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="input-surface"
                      placeholder="Example: 12"
                      value={step.timeSpentHours ?? ""}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          timeSpentHours: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                    />
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">AI review</div>
                    <div className="mt-3">
                      Buildynex will review this with its focused AI stack before it is counted as completed.
                    </div>
                  </div>
                  <label className="space-y-2 text-sm text-slate-300 lg:col-span-2">
                    <span>How was the {step.phase.toLowerCase()}? How did you do it?</span>
                    <textarea
                      className="input-surface min-h-[120px] resize-y"
                      placeholder={
                        step.phase.toLowerCase() === "research"
                          ? "Example: I interviewed 8 vendors, reviewed 3 competing tools, and spent time observing how orders and payments are tracked during the lunch rush."
                          : `Explain how you executed ${step.phase.toLowerCase()} and how the experience felt.`
                      }
                      value={step.experienceSummary || ""}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          experienceSummary: event.target.value || undefined,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300 lg:col-span-2">
                    <span>What all things did you find?</span>
                    <textarea
                      className="input-surface min-h-[120px] resize-y"
                      placeholder={`List the strongest findings, patterns, surprises, and proof from ${step.phase.toLowerCase()}.`}
                      value={step.keyFindings || ""}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          keyFindings: event.target.value || undefined,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>What slowed you down or needs to change next?</span>
                    <textarea
                      className="input-surface min-h-[110px] resize-y"
                      placeholder="Note blockers, delays, unclear assumptions, or next changes."
                      value={step.blockersNotes || ""}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          blockersNotes: event.target.value || undefined,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>What proof points or deliverables did you complete?</span>
                    <textarea
                      className="input-surface min-h-[110px] resize-y"
                      placeholder="Use commas or new lines. Example: Interview summary, landing page test, competitor notes"
                      value={(step.proofPoints || []).join("\n")}
                      onChange={(event) =>
                        onStepPatch(step.phase, {
                          proofPoints: parseProofPoints(event.target.value),
                        })
                      }
                    />
                  </label>
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => void reviewAndComplete(step)}
                        disabled={submittingPhase === step.phase}
                        showArrow={false}
                      >
                        {submittingPhase === step.phase ? "Reviewing with AI..." : "Ask AI and mark done"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setOpenPhase(null)}
                        disabled={submittingPhase === step.phase}
                        showArrow={false}
                      >
                        Cancel
                      </Button>
                    </div>
                    {reviewMessage ? (
                      <div
                        className={`mt-4 rounded-2xl border p-4 text-sm leading-7 ${
                          step.completedByUser
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                            : "border-amber-300/20 bg-amber-400/10 text-amber-100"
                        }`}
                      >
                        {reviewMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
