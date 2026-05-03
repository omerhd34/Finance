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

export function resolveModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const fromEnv = process.env.GEMINI_MODEL_FALLBACKS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ["gemini-2.0-flash", "gemini-1.5-flash"];
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
