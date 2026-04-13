import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { debt, prisma } from "@/lib/prisma";
import type { Transaction } from "@prisma/client";
import type { Debt } from "@/types/debt";

const SYSTEM_PROMPT = `Sen deneyimli bir kişisel finans ve bütçe uzmanısın. Yanıtın Türkçe olacak; dil profesyonel, net ve ölçülü olsun. Aşırı samimiyet, klişe AI ifadeleri ve gereksiz ünlem kullanma (ör. "Hadi birlikte", "size tam destek", "Başarılar dilerim!" gibi boş kapanışlar yerine kısa ve somut bir cümle tercih et).

Veri: Son 30 gün giderleri JSON'da; borç/alacak RECEIVABLE=alacak, PAYABLE=borç; kalanTutar = toplam − ödenen. Rakamları ve kategorileri metinde tutarlı kullan.

Yapı (her biri için ayrı ## başlık):
1) ## Karşılama — En fazla 1-2 cümle: verileri incelediğini profesyonelce belirt; gereksiz uzatma.
2) ## Genel değerlendirme — Net pozisyon, harcama dağılımı ve dikkat çeken bir nokta (3-5 cümle).
3) ## En yüksek 3 harcama kategorisi ve yorumu — Önce tek cümlelik özet; ardından her kategori için **Kategori adı (tutar TL):** ile başlayan kısa paragraflar; veriye dayalı, yargıdan çok gözlem ve yorum.
4) ## Somut tasarruf önerileri — Tam 3 madde; her biri başlık + 2-4 cümle, uygulanabilir ve ölçülebilir.
5) ## Gelecek ay için bütçe çerçevesi — Sabit/değişken/tasarruf gibi başlıkları net ayır; gerektiğinde alt satırlarda **kalın** etiketler kullan.
6) ## Borç ve alacaklar — Toplamlar, öne çıkan kalemler (tutar, vade varsa), tahsilat veya ödeme önceliği önerisi. Borç/alacak yoksa veya veri yetersizse kısaca belirt.

Biçim: Yalnızca Markdown; her ana bölüm ## ile başlasın; paragraflar arasında boş satır; listeler için - veya numaralı madde kullan. Abartılı emoji kullanma.`;

type TxPayload = {
  tarih: string;
  kategori: string;
  tutar: unknown;
  aciklama: string | null;
}[];

type DebtLine = {
  yon: "RECEIVABLE" | "PAYABLE";
  karsiTaraf: string;
  toplamTutar: number;
  odenen: number;
  kalanTutar: number;
  vade: string | null;
  not: string | null;
};

type AnalyzePayload = {
  son30GunHarcamalar: TxPayload;
  borcVeAlacaklar: {
    kayitlar: DebtLine[];
    ozet: {
      toplamAlacakKalan: number;
      toplamBorcKalan: number;
      netPozisyon: number;
    };
  };
};

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

async function analyzeWithGemini(
  apiKey: string,
  payload: AnalyzePayload,
): Promise<string> {
  const userContent = `Finans analizi için veri (JSON):\n${JSON.stringify(payload, null, 2)}`;
  const models = resolveModelChain();
  const maxAttemptsPerModel = 3;
  const baseDelayMs = 1200;
  let lastError: unknown;

  for (const modelName of models) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    for (let attempt = 0; attempt < maxAttemptsPerModel; attempt++) {
      try {
        const result = await model.generateContent(userContent);
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

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        {
          error:
            "AI yapılandırması eksik. .env dosyasına GEMINI_API_KEY ekleyin (https://aistudio.google.com/apikey)",
        },
        { status: 503 },
      );
    }
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const [transactions, debts] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          date: { gte: since },
          type: "expense",
        },
        orderBy: { date: "desc" },
      }),
      debt.findMany({
        where: { userId: session.user.id },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    const son30GunHarcamalar: TxPayload = transactions.map(
      (t: Transaction) => ({
        tarih: t.date.toISOString(),
        kategori: t.category,
        tutar: t.amount,
        aciklama: t.description,
      }),
    );

    let toplamAlacakKalan = 0;
    let toplamBorcKalan = 0;
    const kayitlar: DebtLine[] = debts.map((d: Debt) => {
      const kalan = Math.max(0, d.totalAmount - d.paidAmount);
      if (d.direction === "RECEIVABLE") toplamAlacakKalan += kalan;
      else toplamBorcKalan += kalan;
      const vadeRaw = d.dueDate;
      return {
        yon: d.direction,
        karsiTaraf: d.counterparty,
        toplamTutar: d.totalAmount,
        odenen: d.paidAmount,
        kalanTutar: kalan,
        vade:
          vadeRaw != null
            ? new Date(vadeRaw as string | Date).toISOString()
            : null,
        not: d.note,
      };
    });

    const payload: AnalyzePayload = {
      son30GunHarcamalar,
      borcVeAlacaklar: {
        kayitlar,
        ozet: {
          toplamAlacakKalan,
          toplamBorcKalan,
          netPozisyon: toplamAlacakKalan - toplamBorcKalan,
        },
      },
    };

    const markdown = await analyzeWithGemini(geminiKey, payload);

    return NextResponse.json({ markdown });
  } catch (e) {
    console.error(e);
    const errMsg = e instanceof Error ? e.message : String(e);
    const fetchErr = e instanceof GoogleGenerativeAIFetchError ? e : null;
    const looksLikeQuota =
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.toLowerCase().includes("quota") ||
      errMsg.includes("429");
    if (looksLikeQuota || fetchErr?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini kotası veya istek limiti aşıldı. Birkaç dakika sonra tekrar deneyin. Kotayı AI Studio’dan kontrol edin; daha yüksek limit için faturalandırma gerekebilir.",
        },
        { status: 429 },
      );
    }
    if (fetchErr?.status === 503 || errMsg.includes("503")) {
      return NextResponse.json(
        {
          error:
            "Gemini şu an yoğunluk nedeniyle yanıt veremedi. Bir süre sonra tekrar deneyin; sorun sürerse .env içinde GEMINI_MODEL veya GEMINI_MODEL_FALLBACKS ile başka bir model deneyebilirsiniz.",
        },
        { status: 503 },
      );
    }
    if (e instanceof GoogleGenerativeAIFetchError) {
      if (e.status === 404) {
        return NextResponse.json(
          {
            error:
              "Bu Gemini model adı artık bu API’de yok veya bölgenizde kapalı. .env içinde GEMINI_MODEL=gemini-2.5-flash veya gemini-2.0-flash deneyin; güncel listeyi ai.google.dev/gemini-api/docs/models adresinden kontrol edin.",
          },
          { status: 400 },
        );
      }
      if (e.status === 400 && e.message.includes("API key")) {
        return NextResponse.json(
          {
            error:
              "GEMINI_API_KEY geçersiz veya eksik. aistudio.google.com üzerinden yeni bir anahtar oluşturun.",
          },
          { status: 401 },
        );
      }
    }
    return NextResponse.json(
      { error: "Analiz sırasında bir hata oluştu" },
      { status: 500 },
    );
  }
}
