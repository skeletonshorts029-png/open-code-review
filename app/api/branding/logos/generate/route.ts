import { NextRequest, NextResponse } from "next/server";
import { extractJsonString } from "@/lib/ai/problem-generation";
import {
  buildLogoGenerationPrompt,
  createFallbackLogoConcepts,
  mergeAndRankLogoConcepts,
  normalizeGeneratedLogoConcepts,
} from "@/lib/ai/logo-generation";
import { getAiModeEnsembleConfig, normalizeAiMode } from "@/lib/ai/ai-mode";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";
import { BrandingData, ProblemRecord } from "@/lib/types";

type GenerateLogosRequest = {
  problem?: ProblemRecord;
  branding?: BrandingData;
  selectedName?: string;
  generationNonce?: string;
  aiMode?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let input: GenerateLogosRequest | null = null;

  try {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SAMBANOVA_API_KEY is missing. Add it to .env.local and restart the app." },
        { status: 500 }
      );
    }

    input = (await request.json()) as GenerateLogosRequest;
    if (!input.problem?.id || !input.branding?.nameIdeas?.length || !input.selectedName) {
      return NextResponse.json(
        { error: "Problem, branding, and selected name are required for logo generation." },
        { status: 400 }
      );
    }

    const aiMode = normalizeAiMode(input.aiMode);
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "logos", preferredModel);
    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.95,
      ...ensembleConfig,
      messages: [
        {
          role: "system",
          content:
            "You are Buildynex AI. Generate fresh premium logo concepts and return valid JSON only.",
        },
        {
          role: "user",
          content: buildLogoGenerationPrompt({
            problem: input.problem,
            branding: input.branding,
            selectedName: input.selectedName,
            generationNonce: input.generationNonce,
          }),
        },
      ],
    });

    const generationInput = {
      problem: input.problem,
      branding: input.branding,
      selectedName: input.selectedName,
      generationNonce: input.generationNonce,
    };

    const candidateConcepts = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        return normalizeGeneratedLogoConcepts(parsed, generationInput, result.model);
      } catch {
        return [];
      }
    });

    const concepts = mergeAndRankLogoConcepts(
      candidateConcepts.length ? candidateConcepts : createFallbackLogoConcepts(generationInput),
      input.selectedName
    );

    return NextResponse.json({
      concepts,
      model: "AI Ensemble",
      mode: aiMode,
      contributingModels: completion.successes.map((result) => result.model),
      attemptedModels: completion.attemptedModels,
      failures: completion.failures.map((failure) => `${failure.model}: ${failure.error}`),
    });
  } catch (error) {
    if (input?.problem?.id && input.branding?.nameIdeas?.length && input.selectedName) {
      const concepts = createFallbackLogoConcepts({
        problem: input.problem,
        branding: input.branding,
        selectedName: input.selectedName,
        generationNonce: input.generationNonce,
      });

      return NextResponse.json({
        concepts,
        model: "Buildynex fallback",
        warning:
          error instanceof Error
            ? error.message
            : "Buildynex used a local premium fallback because the AI logo response was not usable.",
      });
    }

    const message = error instanceof Error ? error.message : "Failed to generate AI logo concepts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
