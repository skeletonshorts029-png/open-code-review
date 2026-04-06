import { NextRequest, NextResponse } from "next/server";
import {
  buildProblemGenerationPrompt,
  extractJsonString,
  GenerateProblemsInput,
  mergeAndRankProblems,
  normalizeGeneratedProblems,
} from "@/lib/ai/problem-generation";
import { getAiModeEnsembleConfig, normalizeAiMode } from "@/lib/ai/ai-mode";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCount(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 10;
  return Math.max(10, Math.min(12, Math.round(numeric)));
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SAMBANOVA_API_KEY is missing. Add it to .env.local and restart the app." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as GenerateProblemsInput & { aiMode?: string };
    const aiMode = normalizeAiMode(payload.aiMode);
    const input: GenerateProblemsInput = {
      role: payload.role,
      sector: payload.sector,
      budget: payload.budget,
      country: payload.country,
      experienceLevel: payload.experienceLevel,
      goals: payload.goals,
      query: payload.query,
      count: toCount(payload.count),
    };
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "problems", preferredModel);

    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.9,
      ...ensembleConfig,
      messages: [
        {
          role: "system",
          content:
            "You are Buildynex AI. You generate structured, startup-worthy market problems and return valid JSON only.",
        },
        {
          role: "user",
          content: buildProblemGenerationPrompt(input),
        },
      ],
    });

    const candidateProblems = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        return normalizeGeneratedProblems(parsed, {
          roleHint: input.role,
          fallbackSector: input.sector,
        });
      } catch {
        return [];
      }
    });

    const problems = mergeAndRankProblems(candidateProblems, input.count || 10);

    if (!problems.length) {
      return NextResponse.json(
        { error: "The AI response did not contain valid problems. Try again with a clearer sector or search hint." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      problems,
      model: "AI Ensemble",
      mode: aiMode,
      contributingModels: completion.successes.map((result) => result.model),
      attemptedModels: completion.attemptedModels,
      failures: completion.failures.map((failure) => `${failure.model}: ${failure.error}`),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate AI problems.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
