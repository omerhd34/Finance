import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { z } from "zod";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(e: unknown): boolean {
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

function resolveModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const fromEnv = process.env.GEMINI_MODEL_FALLBACKS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ["gemini-2.0-flash", "gemini-1.5-flash"];
  const fallbacks = fromEnv?.length ? fromEnv : defaults;
  const chain = [primary, ...fallbacks.filter((m) => m !== primary)];
  return [...new Set(chain)];
}

const rawOcrSchema = z.object({
  type: z.enum(["income", "expense"]),
  amountTry: z.number().positive(),
  category: z.string().min(1),
  description: z.string().max(2000).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ReceiptOcrResult = z.infer<typeof rawOcrSchema>;

const RECEIPT_SYSTEM = `Sen fiş ve fatura okuyan bir asistansın. Görüntüdeki belgeden tek bir ana işlem çıkar: toplam ödenen veya işlem tutarı, tarih, gelir mi gider mi, ve uygun kategori.

Kurallar:
- amountTry: Belgedeki ana toplam tutarı Türk Lirası (TRY) cinsinden sayı olarak ver. Para birimi farklıysa makul kur ile TL'ye çevir veya belgede TL/₺ yoksa tutarı olduğu gibi sayı olarak yorumla.
- type: Fiş/fatura genelde giderdir; maaş bordrosu veya gelir belgesi ise "income" seç.
- category: Aşağıdaki izin verilen listelerden TAM olarak bir değer seç; emin değilsen "Diğer" kullan.
- description: Kısa mağaza veya belge özeti (opsiyonel, Türkçe).
- date: Belge tarihi YYYY-MM-DD; okunamıyorsa bugünün tarihini tahmin etme, mümkün olan en iyi tarihi çıkar.

Gider kategorileri (yalnızca bunlardan biri, type expense ise): ${EXPENSE_CATEGORIES.join(", ")}
Gelir kategorileri (yalnızca bunlardan biri, type income ise): ${INCOME_CATEGORIES.join(", ")}

Yanıtın YALNIZCA tek bir JSON nesnesi olsun; markdown kod çiti veya açıklama metni ekleme.`;

function normalizeCategory(
  type: "income" | "expense",
  category: string,
): string {
  const trimmed = category.trim();
  const allowed = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  if ((allowed as readonly string[]).includes(trimmed)) return trimmed;
  return "Diğer";
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("JSON ayrıştırılamadı");
  }
}

export async function scanReceiptImageWithGemini(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<ReceiptOcrResult> {
  const userLine =
    "Bu görüntüdeki fiş veya faturayı oku ve kurallara uygun tek JSON nesnesi üret.";
  const models = resolveModelChain();
  const maxAttemptsPerModel = 3;
  const baseDelayMs = 1200;
  let lastError: unknown;

  for (const modelName of models) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: RECEIPT_SYSTEM,
    });

    for (let attempt = 0; attempt < maxAttemptsPerModel; attempt++) {
      try {
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: userLine },
        ]);
        const text = result.response.text();
        const parsed = rawOcrSchema.safeParse(extractJsonObject(text));
        if (!parsed.success) {
          throw new Error("Model yanıtı beklenen alanlara uymuyor");
        }
        const d = parsed.data;
        return {
          ...d,
          category: normalizeCategory(d.type, d.category),
          description: d.description?.trim() || undefined,
        };
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
