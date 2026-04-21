import { NextRequest, NextResponse } from "next/server";
import { extractJsonString } from "@/lib/ai/problem-generation";
import {
  buildProjectAssetsPrompt,
  fuseGeneratedProjectBundles,
  GenerateProjectAssetsInput,
  normalizeGeneratedProjectBundle,
  scoreGeneratedProjectBundle,
} from "@/lib/ai/project-assets";
import { getAiModeEnsembleConfig, normalizeAiMode } from "@/lib/ai/ai-mode";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let input: (GenerateProjectAssetsInput & { aiMode?: string }) | null = null;

  try {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SAMBANOVA_API_KEY is missing. Add it to .env.local and restart the app." },
        { status: 500 }
      );
    }

    input = (await request.json()) as GenerateProjectAssetsInput & { aiMode?: string };
    if (!input?.problem?.id || !input?.problem?.title) {
      return NextResponse.json(
        { error: "Problem context is missing. Open a valid problem first." },
        { status: 400 }
      );
    }
    const generationInput: GenerateProjectAssetsInput & { aiMode?: string } = input;
    const aiMode = normalizeAiMode(input.aiMode);
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "projectAssets", preferredModel);

    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.7,
      ...ensembleConfig,
      messages: [
        {
          role: "system",
          content:
            "You are Buildynex AI. Generate commercially credible startup execution assets and return valid JSON only.",
        },
        {
          role: "user",
          content: buildProjectAssetsPrompt(generationInput),
        },
      ],
    });

    const candidateBundles = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        const bundle = normalizeGeneratedProjectBundle(parsed, generationInput);
        return [{ bundle, model: result.model }];
      } catch {
        return [];
      }
    });

    const fusedBundle = fuseGeneratedProjectBundles(
      candidateBundles.map((candidate) => candidate.bundle),
      generationInput
    );

    const best = candidateBundles.sort(
      (left, right) => scoreGeneratedProjectBundle(right.bundle) - scoreGeneratedProjectBundle(left.bundle)
    )[0];

    if (!candidateBundles.length) {
      return NextResponse.json({
        ...fusedBundle,
        model: "Buildynex fallback",
        mode: aiMode,
        contributingModels: [],
        attemptedModels: completion.attemptedModels,
        failures: completion.failures.map((failure) => `${failure.model}: ${failure.error}`),
        warning:
          "The focused AI stack did not return clean JSON this time, so Buildynex used its built-in fallback startup plan.",
      });
    }

    return NextResponse.json({
      ...fusedBundle,
      model: "Focused AI stack",
      mode: aiMode,
      contributingModels: completion.successes.map((result) => result.model),
      attemptedModels: completion.attemptedModels,
      bestModel: best?.model,
    });
  } catch (error) {
    if (input?.problem?.id && input?.problem?.title) {
      const aiMode = normalizeAiMode(input.aiMode);
      const fallbackBundle = fuseGeneratedProjectBundles([], input);

      return NextResponse.json({
        ...fallbackBundle,
        model: "Buildynex fallback",
        mode: aiMode,
        warning:
          error instanceof Error
            ? error.message
            : "Buildynex used its built-in fallback startup plan because the AI request failed.",
      });
    }

    const message = error instanceof Error ? error.message : "Failed to generate AI project assets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
