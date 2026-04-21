import { NextRequest, NextResponse } from "next/server";
import { extractJsonString } from "@/lib/ai/problem-generation";
import {
  buildIdeaProjectPrompt,
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
  try {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SAMBANOVA_API_KEY is missing. Add it to .env.local and restart the app." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as GenerateIdeaProjectRequest;
    if (!payload.ideaPrompt?.trim()) {
      return NextResponse.json(
        { error: "Add your startup idea prompt first so Buildynex can generate the full project." },
        { status: 400 }
      );
    }
    const ideaPrompt = payload.ideaPrompt.trim();
    const aiMode = normalizeAiMode(payload.aiMode);
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
            profile: payload.profile,
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
          profile: payload.profile,
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
      return NextResponse.json(
        { error: "The focused AI stack could not produce a usable full project from that idea." },
        { status: 500 }
      );
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
    const message = error instanceof Error ? error.message : "Failed to generate the AI idea project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
