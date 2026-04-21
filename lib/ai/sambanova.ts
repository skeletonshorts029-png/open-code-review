import { getSambaNovaModelOrder } from "@/lib/ai/sambanova-models";

type SambaNovaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  error?: {
    message?: string;
  };
};

function extractErrorMessage(payload: ChatCompletionsResponse | null, fallback: string) {
  return payload?.error?.message || fallback;
}

function isRetryableSambaNovaFailure(status: number, message: string) {
  const normalized = message.toLowerCase();
  return (
    status === 429 ||
    status >= 500 ||
    normalized.includes("high demand") ||
    normalized.includes("try again later") ||
    normalized.includes("overloaded") ||
    normalized.includes("rate limit") ||
    normalized.includes("unavailable")
  );
}

async function requestSambaNovaModel({
  apiKey,
  model,
  messages,
  temperature,
  timeoutMs,
}: {
  apiKey: string;
  model: string;
  messages: SambaNovaMessage[];
  temperature: number;
  timeoutMs?: number;
}) {
  const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
    method: "POST",
    signal: typeof AbortSignal !== "undefined" && timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      temperature,
      messages,
    }),
  });

  const payload = (await response.json().catch(() => null)) as ChatCompletionsResponse | null;
  return { response, payload };
}

export async function createSambaNovaChatCompletion({
  apiKey,
  messages,
  temperature,
  preferredModel,
  models,
  timeoutMs = 9000,
}: {
  apiKey: string;
  messages: SambaNovaMessage[];
  temperature: number;
  preferredModel?: string;
  models?: string[];
  timeoutMs?: number;
}) {
  const attemptedModels: string[] = [];
  const failures: string[] = [];
  const orderedModels = models?.length ? Array.from(new Set(models)) : getSambaNovaModelOrder(preferredModel);

  for (const model of orderedModels) {
    attemptedModels.push(model);
    const { response, payload } = await requestSambaNovaModel({
      apiKey,
      model,
      messages,
      temperature,
      timeoutMs,
    });

    if (response.ok) {
      return {
        model,
        attemptedModels,
        payload: payload || {},
      };
    }

    const message = extractErrorMessage(payload, `SambaNova request failed with status ${response.status}.`);
    failures.push(`${model}: ${message}`);

    if (!isRetryableSambaNovaFailure(response.status, message)) {
      throw new Error(message);
    }
  }

  throw new Error(
    failures.length
      ? `All SambaNova models failed. ${failures.join(" | ")}`
      : "All SambaNova models failed."
  );
}

export async function createSambaNovaEnsembleChatCompletions({
  apiKey,
  messages,
  temperature,
  preferredModel,
  models,
  timeoutMs = 6500,
  maxSuccesses = 6,
}: {
  apiKey: string;
  messages: SambaNovaMessage[];
  temperature: number;
  preferredModel?: string;
  models?: string[];
  timeoutMs?: number;
  maxSuccesses?: number;
}) {
  const orderedModels = models?.length ? Array.from(new Set(models)) : getSambaNovaModelOrder(preferredModel);
  const targetSuccesses = Math.min(Math.max(1, maxSuccesses), orderedModels.length);
  const successes: Array<{ model: string; ok: true; payload: ChatCompletionsResponse }> = [];
  const failures: Array<{ model: string; ok: false; error: string; retryable: boolean }> = [];

  for (const model of orderedModels) {
    try {
      const { response, payload } = await requestSambaNovaModel({
        apiKey,
        model,
        messages,
        temperature,
        timeoutMs,
      });

      if (response.ok) {
        successes.push({
          model,
          ok: true,
          payload: payload || {},
        });

        if (successes.length >= targetSuccesses) {
          break;
        }

        continue;
      }

      const message = extractErrorMessage(payload, `SambaNova request failed with status ${response.status}.`);
      failures.push({
        model,
        ok: false,
        error: message,
        retryable: isRetryableSambaNovaFailure(response.status, message),
      });

      if (!isRetryableSambaNovaFailure(response.status, message)) {
        break;
      }
    } catch (error) {
      failures.push({
        model,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown SambaNova request failure.",
        retryable: true,
      });
    }
  }

  return {
    attemptedModels: orderedModels,
    successes,
    failures,
  };
}
