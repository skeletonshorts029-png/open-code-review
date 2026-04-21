import { SambaNovaModelId } from "@/lib/ai/sambanova-models";

export type AiMode = "fast" | "balanced" | "max";
export type AiTask = "problems" | "projectAssets" | "logos" | "ideaProject" | "websiteScore" | "roadmapReview";

const focusedModelPool: SambaNovaModelId[] = [
  "DeepSeek-V3.1",
  "Meta-Llama-3.1-8B-Instruct",
];

const optimizedMeta = {
  id: "balanced" as const,
  label: "Optimized",
  helper: "Buildynex now uses one primary model and one fast fallback automatically.",
};

export const aiModeOptions = [optimizedMeta];

const ensemblePresets: Record<AiTask, Record<AiMode, { timeoutMs: number; maxSuccesses: number }>> = {
  problems: {
    fast: { timeoutMs: 3200, maxSuccesses: 1 },
    balanced: { timeoutMs: 3600, maxSuccesses: 1 },
    max: { timeoutMs: 4200, maxSuccesses: 1 },
  },
  projectAssets: {
    fast: { timeoutMs: 3600, maxSuccesses: 1 },
    balanced: { timeoutMs: 4200, maxSuccesses: 1 },
    max: { timeoutMs: 4800, maxSuccesses: 1 },
  },
  logos: {
    fast: { timeoutMs: 2400, maxSuccesses: 1 },
    balanced: { timeoutMs: 2800, maxSuccesses: 1 },
    max: { timeoutMs: 3200, maxSuccesses: 1 },
  },
  ideaProject: {
    fast: { timeoutMs: 3600, maxSuccesses: 1 },
    balanced: { timeoutMs: 4200, maxSuccesses: 1 },
    max: { timeoutMs: 4800, maxSuccesses: 1 },
  },
  websiteScore: {
    fast: { timeoutMs: 2200, maxSuccesses: 1 },
    balanced: { timeoutMs: 2600, maxSuccesses: 1 },
    max: { timeoutMs: 3000, maxSuccesses: 1 },
  },
  roadmapReview: {
    fast: { timeoutMs: 2600, maxSuccesses: 1 },
    balanced: { timeoutMs: 3000, maxSuccesses: 1 },
    max: { timeoutMs: 3400, maxSuccesses: 1 },
  },
};

export function normalizeAiMode(_value: unknown): AiMode {
  return "balanced";
}

export function getAiModeMeta(_mode: AiMode) {
  return optimizedMeta;
}

export function getAiModeModels(_mode: AiMode, _preferredModel?: string) {
  return focusedModelPool;
}

export function getAiModeEnsembleConfig(mode: AiMode, task: AiTask, preferredModel?: string) {
  const preset = ensemblePresets[task][mode];
  return {
    ...preset,
    models: getAiModeModels(mode, preferredModel),
  };
}
