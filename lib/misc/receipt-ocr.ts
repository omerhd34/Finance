import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  isGeminiQuotaExhausted,
  isRetryableGeminiError,
  resolveModelChain,
  shouldTryNextGeminiModel,
} from "@/lib/ai/gemini-completion";
import {
  MANUAL_EXPENSE_CATEGORIES,
  MANUAL_INCOME_CATEGORIES,
  isValidExpenseSubcategory,
} from "@/lib/domain/categories";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const rawOcrSchema = z.object({
  type: z.enum(["income", "expense"]),
  amountTry: z.number().positive(),
  category: z.string().min(1),
  subcategory: z.string().max(200).nullable().optional(),
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
- subcategory: Yalnızca type expense ise, seçilen gider kategorisine uygun TEK alt kategori (aşağıdaki haritadan); emin değil veya yoksa bu alanı atla veya null bırak.
- date: Belge tarihi YYYY-MM-DD; okunamıyorsa bugünün tarihini tahmin etme, mümkün olan en iyi tarihi çıkar.

Gider kategorileri (yalnızca bunlardan biri, type expense ise): ${MANUAL_EXPENSE_CATEGORIES.join(", ")}
Alt kategori: Faturada açıkça belli oluyorsa, fiş türüne göre en uygun alt kategoriyi seç; değer, o ana kategori için geçerli alt kategorilerden biriyle TAM eşleşmeli. Geçerli eşleşmeler örnek: "Fatura" + "Elektrik", "Market Alışverişi" + "Süpermarket", "Yemek Alışverişi" + "Restoran / kafe". Emin değilsen subcategory alanını verme.
Gelir kategorileri (yalnızca bunlardan biri, type income ise): ${MANUAL_INCOME_CATEGORIES.join(", ")}

Yanıtın YALNIZCA tek bir JSON nesnesi olsun; markdown kod çiti veya açıklama metni ekleme.`;

function normalizeCategory(
  type: "income" | "expense",
  category: string,
): string {
  const trimmed = category.trim();
  const allowed =
    type === "expense" ? MANUAL_EXPENSE_CATEGORIES : MANUAL_INCOME_CATEGORIES;
  if ((allowed as readonly string[]).includes(trimmed)) return trimmed;
  return "Diğer";
}

function normalizeOcrSubcategory(
  type: "income" | "expense",
  category: string,
  sub: string | null | undefined,
): string | null {
  if (type !== "expense") return null;
  const t = sub?.trim();
  if (!t) return null;
  if (!isValidExpenseSubcategory(category, t)) return null;
  return t;
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
        const category = normalizeCategory(d.type, d.category);
        return {
          ...d,
          category,
          subcategory: normalizeOcrSubcategory(d.type, category, d.subcategory),
          description: d.description?.trim() || undefined,
        };
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
