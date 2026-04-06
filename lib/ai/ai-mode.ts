import { getSambaNovaModelOrder, isSambaNovaModelId, SambaNovaModelId } from "@/lib/ai/sambanova-models";

export type AiMode = "fast" | "balanced" | "max";
export type AiTask = "problems" | "projectAssets" | "logos" | "ideaProject" | "websiteScore" | "roadmapReview";

export const aiModeOptions: Array<{
  id: AiMode;
  label: string;
  helper: string;
}> = [
  {
    id: "fast",
    label: "Fast",
    helper: "Smaller model pool with tighter timeouts.",
  },
  {
    id: "balanced",
    label: "Balanced",
    helper: "Best default mix of speed and response quality.",
  },
  {
    id: "max",
    label: "Max Quality",
    helper: "Full ensemble for the strongest answer set.",
  },
];

const fastModelPool: SambaNovaModelId[] = [
  "E5-Mistral-7B-Instruct",
  "Meta-Llama-3.1-8B-Instruct",
  "gemma-3-12b-it",
  "Qwen3-32B",
  "MiniMax-M2.5",
  "Llama-4-Maverick-17B-128E-Instruct",
];

const balancedModelPool: SambaNovaModelId[] = [
  "DeepSeek-V3.1",
  "Meta-Llama-3.3-70B-Instruct",
  "Qwen3-235B",
  "DeepSeek-R1-0528",
  "Llama-3.3-Swallow-70B-Instruct-v0.4",
  "DeepSeek-V3.2",
  "E5-Mistral-7B-Instruct",
  "Meta-Llama-3.1-8B-Instruct",
  "gemma-3-12b-it",
];

const ensemblePresets: Record<AiTask, Record<AiMode, { timeoutMs: number; maxSuccesses: number }>> = {
  problems: {
    fast: { timeoutMs: 3000, maxSuccesses: 2 },
    balanced: { timeoutMs: 4800, maxSuccesses: 4 },
    max: { timeoutMs: 7600, maxSuccesses: 8 },
  },
  projectAssets: {
    fast: { timeoutMs: 3200, maxSuccesses: 2 },
    balanced: { timeoutMs: 5200, maxSuccesses: 4 },
    max: { timeoutMs: 8200, maxSuccesses: 8 },
  },
  logos: {
    fast: { timeoutMs: 2600, maxSuccesses: 2 },
    balanced: { timeoutMs: 4200, maxSuccesses: 4 },
    max: { timeoutMs: 6800, maxSuccesses: 8 },
  },
  ideaProject: {
    fast: { timeoutMs: 3400, maxSuccesses: 2 },
    balanced: { timeoutMs: 5600, maxSuccesses: 4 },
    max: { timeoutMs: 8600, maxSuccesses: 8 },
  },
  websiteScore: {
    fast: { timeoutMs: 2600, maxSuccesses: 2 },
    balanced: { timeoutMs: 4200, maxSuccesses: 4 },
    max: { timeoutMs: 6200, maxSuccesses: 6 },
  },
  roadmapReview: {
    fast: { timeoutMs: 2600, maxSuccesses: 2 },
    balanced: { timeoutMs: 4300, maxSuccesses: 4 },
    max: { timeoutMs: 6800, maxSuccesses: 6 },
  },
};

export function normalizeAiMode(value: unknown): AiMode {
  if (value === "fast" || value === "balanced" || value === "max") return value;
  return "balanced";
}

export function getAiModeMeta(mode: AiMode) {
  return aiModeOptions.find((option) => option.id === mode) || aiModeOptions[1];
}

function withOptionalPreferred(pool: SambaNovaModelId[], preferredModel?: string, includePreferred = true) {
  const preferred = includePreferred && isSambaNovaModelId(preferredModel) ? preferredModel : undefined;
  return Array.from(new Set([preferred, ...pool].filter(Boolean))) as string[];
}

export function getAiModeModels(mode: AiMode, preferredModel?: string) {
  switch (mode) {
    case "fast":
      return withOptionalPreferred(fastModelPool, preferredModel, false);
    case "balanced":
      return withOptionalPreferred(balancedModelPool, preferredModel, true);
    case "max":
      return getSambaNovaModelOrder(preferredModel);
    default:
      return withOptionalPreferred(balancedModelPool, preferredModel, true);
  }
}

export function getAiModeEnsembleConfig(mode: AiMode, task: AiTask, preferredModel?: string) {
  const preset = ensemblePresets[task][mode];
  return {
    ...preset,
    models: getAiModeModels(mode, preferredModel),
  };
}
