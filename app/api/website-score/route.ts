import { NextRequest, NextResponse } from "next/server";
import { extractJsonString } from "@/lib/ai/problem-generation";
import {
  buildWebsiteScorePrompt,
  htmlToScoringText,
  normalizeWebsiteScore,
  scoreGeneratedWebsiteReview,
} from "@/lib/ai/website-score";
import { getAiModeEnsembleConfig, normalizeAiMode } from "@/lib/ai/ai-mode";
import { createSambaNovaEnsembleChatCompletions } from "@/lib/ai/sambanova";

type WebsiteScoreRequest = {
  url?: string;
  projectName?: string;
  projectSector?: string;
  projectGoal?: string;
  aiMode?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
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

    const payload = (await request.json()) as WebsiteScoreRequest;
    if (!payload.url?.trim()) {
      return NextResponse.json(
        { error: "Add the website URL first so Buildynex can review it." },
        { status: 400 }
      );
    }

    const url = normalizeUrl(payload.url.trim());
    const aiMode = normalizeAiMode(payload.aiMode);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BuildynexAI/1.0 (+website-score)",
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not open that website. It returned status ${response.status}.` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const pageTitle = extractTitle(html);
    const pageText = htmlToScoringText(html);
    const preferredModel = process.env.SAMBANOVA_MODEL || "gpt-oss-120b";
    const ensembleConfig = getAiModeEnsembleConfig(aiMode, "websiteScore", preferredModel);

    const completion = await createSambaNovaEnsembleChatCompletions({
      apiKey,
      preferredModel,
      temperature: 0.4,
      ...ensembleConfig,
      messages: [
        {
          role: "system",
          content:
            "You are Buildynex AI. Review startup websites and return valid JSON only.",
        },
        {
          role: "user",
          content: buildWebsiteScorePrompt({
            url,
            pageTitle,
            pageText,
            projectName: payload.projectName,
            projectSector: payload.projectSector,
            projectGoal: payload.projectGoal,
          }),
        },
      ],
    });

    const candidates = completion.successes.flatMap((result) => {
      try {
        const rawContent = result.payload.choices?.[0]?.message?.content;
        const jsonString = extractJsonString(rawContent);
        const parsed = JSON.parse(jsonString);
        return [{ score: normalizeWebsiteScore(parsed), model: result.model }];
      } catch {
        return [];
      }
    });

    if (!candidates.length) {
      return NextResponse.json(
        { error: "The focused AI stack could not produce a usable website review right now." },
        { status: 500 }
      );
    }

    const best = candidates.sort(
      (left, right) => scoreGeneratedWebsiteReview(right.score) - scoreGeneratedWebsiteReview(left.score)
    )[0];

    return NextResponse.json({
      score: best.score,
      model: "Focused AI stack",
      mode: aiMode,
      bestModel: best.model,
      pageTitle,
      analyzedUrl: url,
      contributingModels: completion.successes.map((result) => result.model),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to score the website.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
