import { NextRequest, NextResponse } from "next/server";
import { getAiModeEnsembleConfig, normalizeAiMode } from "@/lib/ai/ai-mode";
import { extractJsonString } from "@/lib/ai/problem-generation";
import {
  buildRoadmapReviewPrompt,
  normalizeRoadmapReview,
  scoreRoadmapReview,
} from "@/lib/ai/roadmap-review";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";
import { ProblemRecord, RoadmapStep, UserRole } from "@/lib/types";

type ReviewRoadmapStepRequest = {
  problem?: ProblemRecord;
  step?: RoadmapStep;
  role?: UserRole;
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

    const payload = (await request.json()) as ReviewRoadmapStepRequest;
    if (!payload.problem?.id || !payload.step?.phase) {
      return NextResponse.json(
        { error: "Problem and roadmap phase are required for AI review." },
        { status: 400 }
      );
    }

    const aiMode = normalizeAiMode(payload.aiMode);
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "roadmapReview", preferredModel);

    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.45,
      ...ensembleConfig,
      messages: [
        {
          role: "system",
          content: "You are Buildynex AI. Review completed roadmap execution and return valid JSON only.",
        },
        {
          role: "user",
          content: buildRoadmapReviewPrompt({
            problem: payload.problem,
            step: payload.step,
            role: payload.role,
          }),
        },
      ],
    });

    const candidates = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        const review = normalizeRoadmapReview(parsed, payload.step!);
        return [{ review, model: result.model }];
      } catch {
        return [];
      }
    });

    const best = candidates.sort(
      (left, right) => scoreRoadmapReview(right.review) - scoreRoadmapReview(left.review)
    )[0];

    if (!best) {
      return NextResponse.json(
        { error: "The AI review did not return usable feedback for this roadmap phase." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      review: best.review,
      model: "Focused AI stack",
      bestModel: best.model,
      mode: aiMode,
      contributingModels: completion.successes.map((result) => result.model),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to review the roadmap phase.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
