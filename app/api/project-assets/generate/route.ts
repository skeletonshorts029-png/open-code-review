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
import { getSambaNovaModelOrder } from "@/lib/ai/sambanova-models";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SAMBANOVA_API_KEY is missing. Add it to .env.local and restart the app." },
        { status: 500 }
      );
    }

    const input = (await request.json()) as GenerateProjectAssetsInput & { aiMode?: string };
    if (!input?.problem?.id || !input?.problem?.title) {
      return NextResponse.json(
        { error: "Problem context is missing. Open a valid problem first." },
        { status: 400 }
      );
    }
    const aiMode = normalizeAiMode(input.aiMode);
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "projectAssets", preferredModel);

    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.7,
      ...ensembleConfig,
      models: getSambaNovaModelOrder(preferredModel),
      messages: [
        {
          role: "system",
          content:
            "You are Buildynex AI. Generate commercially credible startup execution assets and return valid JSON only.",
        },
        {
          role: "user",
          content: buildProjectAssetsPrompt(input),
        },
      ],
    });

    const candidateBundles = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        const bundle = normalizeGeneratedProjectBundle(parsed, input);
        return [{ bundle, model: result.model }];
      } catch {
        return [];
      }
    });

    const fusedBundle = fuseGeneratedProjectBundles(
      candidateBundles.map((candidate) => candidate.bundle),
      input
    );

    const best = candidateBundles.sort(
      (left, right) => scoreGeneratedProjectBundle(right.bundle) - scoreGeneratedProjectBundle(left.bundle)
    )[0];

    if (!best && !candidateBundles.length) {
      return NextResponse.json(
        { error: "The AI ensemble could not produce a usable startup plan right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...(candidateBundles.length ? fusedBundle : best.bundle),
      model: "AI Ensemble",
      mode: aiMode,
      contributingModels: completion.successes.map((result) => result.model),
      attemptedModels: completion.attemptedModels,
      bestModel: best?.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate AI project assets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
