export const sambanovaModels = [
  {
    id: "gpt-oss-120b",
    label: "GPT OSS 120B",
    helper: "Strong general reasoning",
  },
  {
    id: "DeepSeek-V3.1",
    label: "DeepSeek V3.1",
    helper: "High-capacity reasoning and drafting",
  },
  {
    id: "DeepSeek-V3.1-Terminus",
    label: "DeepSeek V3.1 Terminus",
    helper: "Alternative high-depth reasoning path",
  },
  {
    id: "DeepSeek-V3-0324",
    label: "DeepSeek V3 0324",
    helper: "Alternative DeepSeek reasoning snapshot",
  },
  {
    id: "DeepSeek-V3.1-cb",
    label: "DeepSeek V3.1 CB",
    helper: "Creative branch for diverse output candidates",
  },
  {
    id: "DeepSeek-V3.2",
    label: "DeepSeek V3.2",
    helper: "Latest broader DeepSeek candidate",
  },
  {
    id: "DeepSeek-R1-0528",
    label: "DeepSeek R1",
    helper: "Reasoning fallback for high demand",
  },
  {
    id: "E5-Mistral-7B-Instruct",
    label: "E5 Mistral 7B",
    helper: "Fast lightweight generation",
  },
  {
    id: "Meta-Llama-3.1-8B-Instruct",
    label: "Meta Llama 3.1 8B",
    helper: "Fast instruction following",
  },
  {
    id: "Meta-Llama-3.3-70B-Instruct",
    label: "Meta Llama 3.3 70B",
    helper: "Large-model instruction reasoning",
  },
  {
    id: "Llama-4-Maverick-17B-128E-Instruct",
    label: "Llama 4 Maverick 17B 128E",
    helper: "Broader synthesis with modern instruction tuning",
  },
  {
    id: "Llama-3.3-Swallow-70B-Instruct-v0.4",
    label: "Llama 3.3 Swallow 70B",
    helper: "Strong instruction-following fallback",
  },
  {
    id: "Qwen3-235B",
    label: "Qwen3 235B",
    helper: "Very large-model synthesis",
  },
  {
    id: "Qwen3-32B",
    label: "Qwen3 32B",
    helper: "Smaller Qwen perspective for faster contrast",
  },
  {
    id: "MiniMax-M2.5",
    label: "MiniMax M2.5",
    helper: "Alternative reasoning and phrasing candidate",
  },
  {
    id: "gemma-3-12b-it",
    label: "Gemma 3 12B IT",
    helper: "Smaller contrastive perspective",
  },
] as const;

export type SambaNovaModelId = (typeof sambanovaModels)[number]["id"];

export function isSambaNovaModelId(value: string | undefined | null): value is SambaNovaModelId {
  return sambanovaModels.some((model) => model.id === value);
}

export function getSambaNovaModelOrder(preferredModel?: string) {
  const preferred = isSambaNovaModelId(preferredModel) ? preferredModel : undefined;
  const ordered = [preferred, ...sambanovaModels.map((model) => model.id)].filter(Boolean) as string[];
  return Array.from(new Set(ordered));
}
