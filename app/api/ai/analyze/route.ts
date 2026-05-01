import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { debt, prisma } from "@/lib/prisma";
import { ensurePremiumNotExpired } from "@/lib/premium-subscription";
import { EXPENSE_CATEGORY_TREE } from "@/lib/categories";
import type { Transaction } from "@prisma/client";
import type { Debt } from "@/types/debt";

const SYSTEM_PROMPT = `Sen deneyimli bir kişisel finans ve bütçe uzmanısın. Yanıtın Türkçe olacak; dil profesyonel, net ve ölçülü olsun. Aşırı samimiyet, klişe AI ifadeleri ve gereksiz ünlem kullanma (ör. "Hadi birlikte", "size tam destek", "Başarılar dilerim!" gibi boş kapanışlar yerine kısa ve somut bir cümle tercih et).

Veri: \`son30GunHarcamalar\` son 30 takvim günü içindeki giderleri listeler; aralık \`harcamaPenceresi\` içindeki tarihlerle çerçevelenir (kullanıcının ay başlangıç ayarından bağımsız, gün sayısı sabittir). Borç/alacak kayıtlarında yon alanı "alacak" veya "borç" olarak gelir; kalanTutar = toplam − ödenen. Rakamları ve kategorileri metinde tutarlı kullan. Metinde RECEIVABLE, PAYABLE gibi İngilizce kodları veya parantez içi İngilizce açıklamalar yazma; yalnızca Türkçe terimleri kullan (ör. "Alacak:", "Borç:").

Kullanıcı ayı: JSON içindeki \`kullaniciAyAyarlari\`, kullanıcının profilde seçtiği \`ayBaslangicGunu\` (1–28) ve bunun bütçe dönemine etkisini özetleyen \`butceDonemiNotu\` metnini içerir. "Bu ay", "gelecek ay" veya "aylık bütçe çerçevesi" anlatırken takvim ayının 1'i yerine bu dönemi esas al; harcama rakamları ise yine yalnızca son 30 güne dayanır—iki kavramı birbirine karıştırma.

Kategoriler: JSON içindeki \`giderKategoriSemasi\`, uygulamada işlemler için tanımlı güncel gider grupları, ana kategoriler ve alt kategorileri içerir (Yaşam, Alışveriş, Ulaşım & Araç, Kişisel, Eğitim & Kariyer, Finans, Sosyal & Yaşam, Diğer vb.). Harcamaları ve dağılımı yorumlarken bu şemaya uy; ana kategori ile alt kategori (\`altKategori\`) birlikte geldiğinde ikisini birlikte ele al (ör. "Market – Süpermarket" ile "Yiyecek & İçecek – Paket sipariş" farklı harcama türleridir). Şemada listelenmeyen bir kategori metni görürsen kullanıcı tarafından seçilmiş veya özel bir etiket olabilir; anlamını işlem açıklaması ve tutarla ilişkilendirerek yorumla.

Yapı ve başlıklar: Yanıtta tam olarak ve yalnızca şu on başlığı bu sırayla kullan; başlık satırına ek metin veya alt başlık ekleme (arayüzde görünen başlık budur): \`## Karşılama\`, \`## Genel değerlendirme\`, \`## En yüksek 5 harcama kategorisi ve yorumu\`, \`## Harcama kalıpları ve işlem notları\`, \`## Somut tasarruf önerileri\`, \`## Gelecek ay için bütçe çerçevesi\`, \`## Borç ve alacaklar\`, \`## Riskler ve dikkat edilmesi gerekenler\`, \`## Öncelikli aksiyonlar\`, \`## Kısa özet ve bir sonraki adım\`. Veri yetersizse ilgili bölümde kısaca “Bu dönem için bu bölümde yorumlanacak veri yok.” benzeri tek cümle yeterli.

- **Karşılama:** Kullanıcıya doğrudan hitap etmeden, son 30 günlük gider ve borç/alacak özetini incelediğini kısa ve kurumsal bir dille belirt. Ne kadar detaya ineceğini bu girişte anlatma; en fazla iki cümle.

- **Genel değerlendirme:** \`borcVeAlacaklar.ozet\` ile net pozisyonu (kalan alacak − kalan borç) ve son 30 gün toplam gideri birlikte çerçevele. Harcamaların hangi geniş alanlarda yoğunlaştığını (birkaç grup veya ana kategori) özetle; dikkat çeken tek örüntü veya tutarsızlık varsa somut rakamla bağla. Üç ila altı cümle; spekülasyon yok.

- **En yüksek 5 harcama kategorisi ve yorumu:** Önce tek cümleyle listenin neyi temsil ettiğini belirt. Sonra her kalem için ayrı paragraf: satır başı **Ana kategori – Alt kategori (X TL)** veya alt kategori yoksa **Kategori (X TL)**; altında tutarı destekleyen kısa gözlem (bütçedeki rol, tekrar eden işlem ipucu, açıklama alanıyla örtüşme). En fazla beş kalem; tutarlar JSON’daki işlemlerle uyumlu toplamlar olsun.

- **Harcama kalıpları ve işlem notları:** \`tarih\` alanlarından haftanın hangi günlerinde veya hangi aralıklarda yoğunluk olduğunu; tek seferlik belirgin yüksek tutarları; \`aciklama\` metinlerindeki tekrarlayan üye işyeri veya abonelik izlerini tarif et. Varsayımda bulunma.

- **Somut tasarruf önerileri:** Tam üç ila beş numaralı madde. Her madde: kalın başlık (**ör. X harcamalarında küçük düzenlemeler**), ardından iki ila dört cümle; öneri ölçülebilir ve son 30 güne veya listelenen kategorilere bağlı olsun.

- **Gelecek ay için bütçe çerçevesi:** Sabit giderler, değişken harcamalar ve varsa borç ödemesi veya tasarruf ayırımını net etiketlerle ayır. Payları mümkünse son 30 günün dağılımına dayandır. "Gelecek ay" ve dönem sınırları için \`kullaniciAyAyarlari\` ile uyumlu düşün (kullanıcı ayı 15’te başlıyorsa bir sonraki bütçe dönemi ona göre).

- **Borç ve alacaklar:** Toplam kalan alacak ve borç; \`borcVeAlacaklar.kayitlar\` içinden vadeleri yakın veya tutarı yüksek kalemleri özetle. Tahsilat veya ödeme sıralaması için kısa, gerekçeli öneri. Kayıt yoksa veya kalanlar sıfırsa açıkça yaz.

- **Riskler ve dikkat edilmesi gerekenler:** Likidite, üst üste vadeler, tek kategoride yoğunlaşma, borç stresi sinyalleri; veriye bağlı, abartısız. Gerekirse kısa madde listesi.

- **Öncelikli aksiyonlar:** Dört ila yedi satır; her satır tek, fiili eylem; önceki bölümlerle gereksiz tekrar yok.

- **Kısa özet ve bir sonraki adım:** İki ila dört cümle: en kritik bulgu + bu hafta yapılabilecek somut bir kontrol veya davranış (genel motivasyon cümlesi yok).

Görselleştirme: Piksel tabanlı grafik, görsel dosya veya harici görsel link üretemezsin. Karşılaştırmayı net göstermek için uygun yerlerde GitHub tarzı Markdown tablo kullan (ör. Kategori veya Kategori–Alt kategori | Tutar TL | Toplam gider içinde %); rakamlar JSON ile tutarlı olsun.

Biçim: Yalnızca Markdown; paragraflar arasında boş satır; listeler için - veya numaralı madde. Abartılı emoji kullanma. Parantez içinde İngilizce veri şeması kodu (RECEIVABLE, PAYABLE vb.) yazma.`;

type TxPayload = {
  tarih: string;
  kategori: string;
  altKategori: string | null;
  tutar: unknown;
  aciklama: string | null;
}[];

type DebtLine = {
  yon: "alacak" | "borç";
  karsiTaraf: string;
  toplamTutar: number;
  odenen: number;
  kalanTutar: number;
  vade: string | null;
  not: string | null;
};

function kullaniciAyAyarlariForPayload(ayBaslangicGunu: number): {
  ayBaslangicGunu: number;
  butceDonemiNotu: string;
} {
  const d = Math.min(28, Math.max(1, Math.trunc(ayBaslangicGunu)));
  if (d === 1) {
    return {
      ayBaslangicGunu: d,
      butceDonemiNotu:
        "Kullanıcı standart takvim ayını kullanıyor: bir bütçe dönemi, her takvim ayının 1'i ile son günü arasıdır.",
    };
  }
  const sonGun = d - 1;
  return {
    ayBaslangicGunu: d,
    butceDonemiNotu: `Kullanıcı uygulama ayarlarında her ayın ${d}. gününü ay başlangıcı olarak seçmiş. Bir bütçe dönemi, bir ayın ${d}. günü başlayıp bir sonraki ayın ${sonGun}. gününün sonuna kadar sürer (ör.: başlangıç 15 ise 15 Ocak–14 Şubat tek dönem). “Bu ay” ve “gelecek ay” önerilerinde takvim ayının 1'ini değil bu kesiti esas al.`,
  };
}

type AnalyzePayload = {
  kullaniciAyAyarlari: ReturnType<typeof kullaniciAyAyarlariForPayload>;
  harcamaPenceresi: { baslangic: string; bitis: string; not: string };
  giderKategoriSemasi: typeof EXPENSE_CATEGORY_TREE;
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    await ensurePremiumNotExpired(session.user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planTier: true },
    });
    if (!dbUser || dbUser.planTier !== "premium") {
      return NextResponse.json(
        {
          error:
            "AI Analiz yalnızca aktif Premium abonelikte kullanılabilir. Süreniz dolduysa yeniden ödeme yapın.",
        },
        { status: 403 },
      );
    }

    const analyses = await prisma.aiFinanceAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, markdown: true, createdAt: true },
    });

    return NextResponse.json({
      analyses: analyses.map((a) => ({
        id: a.id,
        markdown: a.markdown,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Geçmiş analizler yüklenirken bir hata oluştu" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    await ensurePremiumNotExpired(session.user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planTier: true, monthStartDay: true },
    });
    if (!dbUser || dbUser.planTier !== "premium") {
      return NextResponse.json(
        {
          error:
            "AI Analiz yalnızca aktif Premium abonelikte kullanılabilir. Süreniz dolduysa yeniden ödeme yapın.",
        },
        { status: 403 },
      );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const todayAnalysisCount = await prisma.aiFinanceAnalysis.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });
    if (todayAnalysisCount >= 3) {
      return NextResponse.json(
        {
          error:
            "Günlük AI analiz limitine ulaştınız (3/3). Yeni analiz için yarını bekleyin.",
        },
        { status: 429 },
      );
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
    const analizAnı = new Date();
    const since = new Date(analizAnı);
    since.setDate(since.getDate() - 30);
    const kullaniciAyAyarlari = kullaniciAyAyarlariForPayload(
      dbUser.monthStartDay ?? 1,
    );
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
        altKategori: t.subcategory ?? null,
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
        yon: d.direction === "RECEIVABLE" ? "alacak" : "borç",
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
      kullaniciAyAyarlari,
      harcamaPenceresi: {
        baslangic: since.toISOString(),
        bitis: analizAnı.toISOString(),
        not: "İşlem tarihine göre son 30 takvim günü (ay başlangıç ayarından bağımsız pencere).",
      },
      giderKategoriSemasi: EXPENSE_CATEGORY_TREE,
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

    await prisma.aiFinanceAnalysis.create({
      data: { userId: session.user.id, markdown },
    });
    const idsNewestFirst = await prisma.aiFinanceAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    const staleIds = idsNewestFirst.slice(5).map((r) => r.id);
    if (staleIds.length > 0) {
      await prisma.aiFinanceAnalysis.deleteMany({
        where: { id: { in: staleIds } },
      });
    }

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
