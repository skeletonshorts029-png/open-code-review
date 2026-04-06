"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandingData, LogoConceptRecord, ProblemRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { createFallbackLogoConcepts } from "@/lib/ai/logo-generation";
import { useAiMode } from "@/context/ai-mode-context";

interface LogoConceptsResponse {
  concepts?: LogoConceptRecord[];
  model?: string;
  contributingModels?: string[];
  attemptedModels?: string[];
  failures?: string[];
  warning?: string;
  error?: string;
}

function nextGenerationNonce() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function logoCacheKey(problemId: string, selectedName: string, aiMode: string, projectId?: string) {
  return `buildynex:logos:${projectId || problemId}:${problemId}:${selectedName.toLowerCase()}:${aiMode}`;
}

function getCachedLogoConcepts(problemId: string, selectedName: string, aiMode: string, projectId?: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(logoCacheKey(problemId, selectedName, aiMode, projectId));
    if (!raw) return null;
    return JSON.parse(raw) as LogoConceptRecord[];
  } catch {
    return null;
  }
}

function setCachedLogoConcepts(problemId: string, selectedName: string, aiMode: string, concepts: LogoConceptRecord[], projectId?: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(logoCacheKey(problemId, selectedName, aiMode, projectId), JSON.stringify(concepts));
  } catch {
    // Ignore sessionStorage failures.
  }
}

function LogoPreview({ concept }: { concept: LogoConceptRecord }) {
  return (
    <div
      className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: concept.svgMarkup }}
    />
  );
}

export function LogoConceptGallery({
  branding,
  problem,
  projectId,
}: {
  branding: BrandingData;
  problem: ProblemRecord;
  projectId?: string;
}) {
  const { mode, label } = useAiMode();
  const [selectedName, setSelectedName] = useState(branding.nameIdeas[0] || problem.sector);
  const [concepts, setConcepts] = useState<LogoConceptRecord[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationKey, setGenerationKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modelInfo, setModelInfo] = useState<{
    model?: string;
    contributingModels?: string[];
    attemptedModels?: string[];
    failures?: string[];
  }>({});

  useEffect(() => {
    if (!branding.nameIdeas.includes(selectedName)) {
      setSelectedName(branding.nameIdeas[0] || problem.sector);
    }
  }, [branding.nameIdeas, problem.sector, selectedName]);

  useEffect(() => {
    const cached = getCachedLogoConcepts(problem.id, selectedName, mode, projectId);
    const instant = cached || createFallbackLogoConcepts({
      problem,
      branding,
      selectedName,
      generationNonce: `instant-${selectedName}`,
    });

    setConcepts(instant);
    setSelectedConceptId((current) => current || instant[0]?.id || null);
    setLoading(false);
  }, [branding, mode, problem, projectId, selectedName]);

  useEffect(() => {
    let cancelled = false;

    async function loadConcepts() {
      setIsRefreshing(true);
      setError(null);

      try {
        const response = await fetch("/api/branding/logos/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            problem,
            branding,
            selectedName,
            generationNonce: nextGenerationNonce(),
            aiMode: mode,
          }),
        });

        const data = (await response.json()) as LogoConceptsResponse;
        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to generate AI logos.");
        }

        if (!cancelled) {
          const nextConcepts = data.concepts || [];
          setCachedLogoConcepts(problem.id, selectedName, mode, nextConcepts, projectId);
          setConcepts(nextConcepts);
          setSelectedConceptId(nextConcepts[0]?.id || null);
          setModelInfo({
            model: data.model,
            contributingModels: data.contributingModels,
            attemptedModels: data.attemptedModels,
            failures: data.failures,
          });
          if (data.warning) {
            setError(data.warning);
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Buildynex could not generate fresh AI logos right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadConcepts();
    return () => {
      cancelled = true;
    };
  }, [branding, generationKey, mode, problem, projectId, selectedName]);

  const selectedConcept = useMemo(
    () => concepts.find((concept) => concept.id === selectedConceptId) || concepts[0] || null,
    [concepts, selectedConceptId]
  );

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Live AI logo generation</div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Fresh logo concepts for every brand name you choose</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              You now get instant logo concepts immediately, then Buildynex refines them with the AI model ensemble in the background.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {modelInfo.model ? (
              <div className="rounded-2xl border border-sky-300/15 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
                {label} mode: <span className="font-semibold text-white">{modelInfo.model}</span>
              </div>
            ) : null}
            <Button onClick={() => setGenerationKey((value) => value + 1)} showArrow={false}>
              Generate a new AI set
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <div className={cn(
            "rounded-full border px-3 py-1",
            isRefreshing
              ? "border-sky-300/25 bg-sky-400/10 text-sky-100"
              : "border-white/10 bg-white/[0.03] text-slate-400"
          )}>
            {isRefreshing ? `Refining with ${label} AI ensemble...` : `${label} mode ready`}
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {branding.nameIdeas.map((name) => {
            const active = name === selectedName;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedName(name)}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left transition",
                  active
                    ? "border-sky-300/35 bg-gradient-to-r from-sky-400/14 to-fuchsia-400/14 text-white shadow-[0_0_28px_rgba(56,189,248,0.16)]"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
                )}
              >
                <div className="text-lg font-semibold">{name}</div>
                <div className="mt-2 text-sm text-slate-400">
                  {branding.taglineIdeas[branding.nameIdeas.indexOf(name)] || branding.taglineIdeas[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-[28px] border border-rose-300/20 bg-rose-400/10 p-5 text-sm leading-7 text-rose-100">
          {error}
        </div>
      ) : null}

      {loading && !concepts.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="premium-card p-6">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="mt-4 h-48 w-full rounded-[24px]" />
              <SkeletonBlock className="mt-5 h-4 w-32" />
              <SkeletonBlock className="mt-3 h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {concepts.map((concept, index) => {
            const active = concept.id === selectedConcept?.id;
            return (
              <button
                key={concept.id}
                type="button"
                onClick={() => setSelectedConceptId(concept.id)}
                className={cn(
                  "premium-card p-6 text-left transition duration-300 hover:-translate-y-1",
                  active && "border-sky-300/30 shadow-[0_0_40px_rgba(56,189,248,0.18)]"
                )}
              >
                <div className={`rounded-[24px] border border-white/10 bg-white/[0.03] p-4 ${index % 2 === 0 ? "panel-rise" : "reveal-up"}`}>
                  <div className="aspect-[3/2] overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/70">
                    <LogoPreview concept={concept} />
                  </div>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold text-white">{concept.title}</div>
                    <div className="mt-1 text-sm text-sky-200/80">{concept.subtitle}</div>
                    {concept.sourceModel ? (
                      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Source model: {concept.sourceModel}
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em]",
                      active
                        ? "border-sky-300/35 bg-sky-400/12 text-sky-100"
                        : "border-white/10 bg-white/[0.03] text-slate-400"
                    )}
                  >
                    {active ? "Active" : "Preview"}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{concept.rationale}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="premium-card p-6">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Selected AI logo direction</div>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {selectedConcept?.title || "Waiting for fresh concepts"} for {selectedName}
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {selectedConcept?.rationale ||
              `Buildynex is generating logo concepts that match the ${problem.sector.toLowerCase()} problem, the chosen brand name, and the identity system from Brand Studio.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {branding.colorPalette.map((color) => (
              <div
                key={color}
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-100"
                style={{ backgroundColor: `${color}22` }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card p-6">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">AI art direction prompt</div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {selectedConcept?.generationPrompt || branding.logoPrompt}
          </p>
          {modelInfo.attemptedModels?.length ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              <strong className="text-white">Model ensemble:</strong>{" "}
              {(modelInfo.contributingModels?.length ? modelInfo.contributingModels : modelInfo.attemptedModels).join(" + ")}
            </div>
          ) : null}
          {modelInfo.failures?.length ? (
            <div className="mt-4 rounded-3xl border border-amber-300/15 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
              Some models were unavailable, so Buildynex used the strongest successful outputs.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
