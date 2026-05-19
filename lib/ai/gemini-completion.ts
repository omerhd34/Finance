import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableGeminiError(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError) {
    const s = e.status;
    return s != null && RETRYABLE_STATUSES.has(s);
  }
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("429") ||
    msg.includes("500") ||
    msg.includes("Service Unavailable") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

function geminiErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function geminiHttpStatus(e: unknown): number | undefined {
  if (e instanceof GoogleGenerativeAIFetchError && e.status != null) {
    return e.status;
  }
  const msg = geminiErrorMessage(e);
  const bracket = msg.match(/\[(\d{3})\s/);
  if (bracket) return Number.parseInt(bracket[1], 10);
  return undefined;
}

export function shouldTryNextGeminiModel(e: unknown): boolean {
  const status = geminiHttpStatus(e);
  if (status === 404) return true;
  const msg = geminiErrorMessage(e);
  return msg.includes("is not found") || msg.includes("not supported for generateContent");
}

export function isGeminiQuotaExhausted(e: unknown): boolean {
  const lower = geminiErrorMessage(e).toLowerCase();
  return (
    lower.includes("prepayment credits") ||
    lower.includes("credits are depleted") ||
    lower.includes("exceeded your current quota") ||
    (lower.includes("billing") && lower.includes("depleted"))
  );
}

export function isGeminiQuotaError(e: unknown): boolean {
  const msg = geminiErrorMessage(e);
  const lower = msg.toLowerCase();
  const status = geminiHttpStatus(e);
  return (
    status === 429 ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    lower.includes("quota") ||
    msg.includes("429") ||
    isGeminiQuotaExhausted(e)
  );
}

export function mapGeminiErrorToUserMessage(
  e: unknown,
  fallbackMessage: string,
): { status: number; error: string } {
  const errMsg = geminiErrorMessage(e);
  const httpStatus = geminiHttpStatus(e);

  if (isGeminiQuotaError(e)) {
    return {
      status: 429,
      error:
        "Gemini API kotası veya ön ödemeli krediniz tükenmiş. Google AI Studio (aistudio.google.com) üzerinden projenize faturalandırma veya kredi ekleyin; birkaç dakika sonra tekrar deneyin.",
    };
  }
  if (httpStatus === 503 || errMsg.includes("503")) {
    return {
      status: 503,
      error:
        "Gemini şu an yoğunluk nedeniyle yanıt veremedi. Bir süre sonra tekrar deneyin; sorun sürerse .env içinde GEMINI_MODEL veya GEMINI_MODEL_FALLBACKS ile başka bir model deneyebilirsiniz.",
    };
  }
  if (httpStatus === 404 || errMsg.includes("is not found")) {
    return {
      status: 400,
      error:
        "Yapılandırılmış Gemini modeli bu API’de bulunamadı. .env içinde GEMINI_MODEL=gemini-2.5-flash ve GEMINI_MODEL_FALLBACKS=gemini-2.5-flash-lite,gemini-3.1-flash-lite deneyin; güncel listeyi ai.google.dev/gemini-api/docs/models adresinden kontrol edin.",
    };
  }
  if ((httpStatus === 400 || httpStatus === 401) && errMsg.includes("API key")) {
    return {
      status: 401,
      error:
        "GEMINI_API_KEY geçersiz veya eksik. aistudio.google.com üzerinden yeni bir anahtar oluşturun.",
    };
  }
  return { status: 500, error: fallbackMessage };
}

export function resolveModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const fromEnv = process.env.GEMINI_MODEL_FALLBACKS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ["gemini-2.5-flash-lite", "gemini-3.1-flash-lite"];
  const fallbacks = fromEnv?.length ? fromEnv : defaults;
  const chain = [primary, ...fallbacks.filter((m) => m !== primary)];
  return [...new Set(chain)];
}

export async function generateGeminiText(args: {
  apiKey: string;
  systemInstruction: string;
  userText: string;
}): Promise<string> {
  const models = resolveModelChain();
  const maxAttemptsPerModel = 3;
  const baseDelayMs = 1200;
  let lastError: unknown;

  for (const modelName of models) {
    const genAI = new GoogleGenerativeAI(args.apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: args.systemInstruction,
    });

    for (let attempt = 0; attempt < maxAttemptsPerModel; attempt++) {
      try {
        const result = await model.generateContent(args.userText);
        const text = result.response.text();
        return text.trim() || "Yanıt oluşturulamadı.";
      } catch (e) {
        lastError = e;
        if (isGeminiQuotaExhausted(e)) {
          throw e;
        }
        if (shouldTryNextGeminiModel(e)) {
          break;
        }
        if (!isRetryableGeminiError(e)) {
          throw e;
        }
        if (attempt < maxAttemptsPerModel - 1) {
          await sleep(baseDelayMs * 2 ** attempt);
          continue;
        }
        break;
      }
    }
  }

  throw lastError ?? new Error("Gemini yanıt veremedi.");
}

type GeminiHistoryTurn = { role: "user" | "model"; parts: { text: string }[] };

export async function generateGeminiChatReply(args: {
  apiKey: string;
  systemInstruction: string;
  history: GeminiHistoryTurn[];
  message: string;
}): Promise<string> {
  const models = resolveModelChain();
  const maxAttemptsPerModel = 3;
  const baseDelayMs = 1200;
  let lastError: unknown;

  for (const modelName of models) {
    const genAI = new GoogleGenerativeAI(args.apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: args.systemInstruction,
    });

    for (let attempt = 0; attempt < maxAttemptsPerModel; attempt++) {
      try {
        const chat = model.startChat({ history: args.history });
        const result = await chat.sendMessage(args.message);
        const text = result.response.text();
        return text.trim() || "Yanıt oluşturulamadı.";
      } catch (e) {
        lastError = e;
        if (isGeminiQuotaExhausted(e)) {
          throw e;
        }
        if (shouldTryNextGeminiModel(e)) {
          break;
        }
        if (!isRetryableGeminiError(e)) {
          throw e;
        }
        if (attempt < maxAttemptsPerModel - 1) {
          await sleep(baseDelayMs * 2 ** attempt);
          continue;
        }
        break;
      }
    }
  }

  throw lastError ?? new Error("Gemini yanıt veremedi.");
}
