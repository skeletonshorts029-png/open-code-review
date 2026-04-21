import { NextRequest, NextResponse } from "next/server";
import { extractJsonString } from "@/lib/ai/problem-generation";
import {
  buildIdeaProjectPrompt,
  createFallbackIdeaProject,
  normalizeGeneratedIdeaProject,
  scoreGeneratedIdeaProject,
} from "@/lib/ai/idea-project";
import { getAiModeEnsembleConfig, normalizeAiMode } from "@/lib/ai/ai-mode";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";
import { UserProfile } from "@/lib/types";

type GenerateIdeaProjectRequest = {
  ideaPrompt?: string;
  profile?: Partial<UserProfile>;
  aiMode?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: GenerateIdeaProjectRequest | null = null;

  try {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SAMBANOVA_API_KEY is missing. Add it to .env.local and restart the app." },
        { status: 500 }
      );
    }

    payload = (await request.json()) as GenerateIdeaProjectRequest;
    if (!payload.ideaPrompt?.trim()) {
      return NextResponse.json(
        { error: "Add your startup idea prompt first so Buildynex can generate the full project." },
        { status: 400 }
      );
    }
    const requestPayload = payload;
    const ideaPrompt = requestPayload.ideaPrompt!.trim();
    const aiMode = normalizeAiMode(requestPayload.aiMode);
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "ideaProject", preferredModel);

    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.85,
      ...ensembleConfig,
      messages: [
        {
          role: "system",
          content:
            "You are Buildynex AI. Turn a raw startup idea into a structured problem-first project and return valid JSON only.",
        },
        {
          role: "user",
          content: buildIdeaProjectPrompt({
            ideaPrompt,
            profile: requestPayload.profile,
          }),
        },
      ],
    });

    const candidates = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        const normalized = normalizeGeneratedIdeaProject(parsed, {
          ideaPrompt,
          profile: requestPayload.profile,
        });
        return [{ result: normalized, model: result.model }];
      } catch {
        return [];
      }
    });

    const best = candidates.sort(
      (left, right) => scoreGeneratedIdeaProject(right.result) - scoreGeneratedIdeaProject(left.result)
    )[0];

    if (!best) {
      const fallback = createFallbackIdeaProject({
        ideaPrompt,
        profile: requestPayload.profile,
      });

      return NextResponse.json({
        problem: fallback.problem,
        bundle: fallback.bundle,
        goalsData: fallback.goalsData,
        model: "Buildynex fallback",
        mode: aiMode,
        attemptedModels: completion.attemptedModels,
        failures: completion.failures.map((failure) => `${failure.model}: ${failure.error}`),
        warning: "The focused AI stack did not return clean project JSON, so Buildynex built a local fallback project from your idea.",
      });
    }

    return NextResponse.json({
      problem: best.result.problem,
      bundle: best.result.bundle,
      goalsData: best.result.goalsData,
      model: "Focused AI stack",
      mode: aiMode,
      bestModel: best.model,
      contributingModels: completion.successes.map((result) => result.model),
      attemptedModels: completion.attemptedModels,
    });
  } catch (error) {
    if (payload?.ideaPrompt?.trim()) {
      const fallback = createFallbackIdeaProject({
        ideaPrompt: payload.ideaPrompt.trim(),
        profile: payload.profile,
      });

      return NextResponse.json({
        problem: fallback.problem,
        bundle: fallback.bundle,
        goalsData: fallback.goalsData,
        model: "Buildynex fallback",
        mode: normalizeAiMode(payload.aiMode),
        warning:
          error instanceof Error
            ? error.message
            : "Buildynex used a local fallback project because the live AI request failed.",
      });
    }

    const message = error instanceof Error ? error.message : "Failed to generate the AI idea project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
