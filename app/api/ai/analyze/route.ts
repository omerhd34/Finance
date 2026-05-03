import { NextResponse } from "next/server";
import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { prisma } from "@/lib/db/prisma";
import { buildFinanceAnalyzePayload } from "@/lib/ai/build-finance-analyze-payload";
import { generateGeminiText } from "@/lib/ai/gemini-completion";
import { AI_LONG_REPORT_MAX_PER_DAY } from "@/lib/ai/ai-insights-limits";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

const SYSTEM_PROMPT = `Sen deneyimli bir kişisel finans ve bütçe uzmanısın. Yanıtın Türkçe olacak; dil profesyonel, net ve ölçülü olsun. Aşırı samimiyet, klişe AI ifadeleri ve gereksiz ünlem kullanma (ör. "Hadi birlikte", "size tam destek", "Başarılar dilerim!" gibi boş kapanışlar yerine kısa ve somut bir cümle tercih et).

Veri: \`son30GunHarcamalar\` son 30 takvim günü içindeki giderleri listeler; \`son30GunGelirler\` ve \`gelirOzeti\` aynı penceredeki gelir kayıtlarını ve toplamları verir. Aralık \`harcamaPenceresi\` ile çerçevelenir (ay başlangıç ayarından bağımsız, son 30 takvim günü). Borç/alacak kayıtlarında yon alanı "alacak" veya "borç" olarak gelir; kalanTutar = toplam − ödenen. Rakamları ve kategorileri metinde tutarlı kullan. Metinde RECEIVABLE, PAYABLE gibi İngilizce kodları veya parantez içi İngilizce açıklamalar yazma; yalnızca Türkçe terimleri kullan (ör. "Alacak:", "Borç:").

Yatırım (\`yatirimlar\`): Bu alan null ise kullanıcının bu analizde listelenen yatırım kartı yoktur. Dolu ise Premium portföy özetidir; \`ozet\` ve \`pozisyonlar\` uygulama tablolarıyla uyumlu alanlar içerir. \`varlikTuru\`: Altın, Emtia (gümüş/platin gram dahil eski kayıtlar), Hisse, Döviz, Kripto. \`tahminiDegerTry\` / \`tahminiPnlTry\`: Kayıtlı güncel birim fiyatı yoksa ortalama maliyet kullanılarak yaklaşık hesaplanır; canlı borsa kotasyonu garantisi yoktur—yatırım tavsiyesi veya al/sat önerisi verme; yalnızca kayıtlı tutarlar üzerinden likidite ve yoğunlaşma bağlamı ver.

Gelir–harcama uyumu (doğrudan ve dürüst iletişim): \`gelirOzeti\`, \`son30GunGelirler\` ile \`son30GunHarcamalar\`ı birlikte oku. \`referansAsgariUcretNetAylikTl\` null ise güncel asgari ücret rakamı uydurma; yalnızca kayıtlı gelir tutarları ve harcama kalıplarından sonuç çıkar. Gelir tarafı sınırlı görünüyorsa (ör. yinelenen düşük maaş tutarı, son 30 gün toplam gelirinin düşük olması, varsa referans ile karşılaştırmada alt bant) ve aynı veride isteğe bağlı, yüksek tutarlı harcama varsa (ör. üst segment akıllı telefon, lüks elektronik, açıklama veya kategori bunu düşündürüyorsa) bunu kurumsal mesafeli dil ile geçiştirme: kullanıcıya net şekilde, **kazandığı düzeyle örtüşmeyen bir harcama tercihi** olduğunu söyle; daha uygun fiyatlı alternatiflerin çoğu ihtiyacı karşılayabileceğini, önceliğin temel ihtiyaç ve tasarruf olması gerektiğini “kazandığın kadar harca” ilkesiyle bağla. Ton: saygılı, küçümsemeyen, alay etmeyen; kişiliğe saldırmayan ama **çekingen de olmayan** uyarı. Bu tema veriye dayanmıyorsa veya gelir yüksekse zorla kullanma.

Kullanıcı ayı: JSON içindeki \`kullaniciAyAyarlari\`, kullanıcının profilde seçtiği \`ayBaslangicGunu\` (1–28) ve bunun bütçe dönemine etkisini özetleyen \`butceDonemiNotu\` metnini içerir. "Bu ay", "gelecek ay" veya "aylık bütçe çerçevesi" anlatırken takvim ayının 1'i yerine bu dönemi esas al; harcama rakamları ise yine yalnızca son 30 güne dayanır—iki kavramı birbirine karıştırma.

Kategoriler: JSON içindeki \`giderKategoriSemasi\`, uygulamada işlemler için tanımlı güncel gider grupları, ana kategoriler ve alt kategorileri içerir (Yaşam, Alışveriş, Ulaşım & Araç, Kişisel, Eğitim & Kariyer, Finans, Sosyal & Yaşam, Diğer vb.). Harcamaları ve dağılımı yorumlarken bu şemaya uy; ana kategori ile alt kategori (\`altKategori\`) birlikte geldiğinde ikisini birlikte ele al (ör. "Market – Süpermarket" ile "Yiyecek & İçecek – Paket sipariş" farklı harcama türleridir). Şemada listelenmeyen bir kategori metni görürsen kullanıcı tarafından seçilmiş veya özel bir etiket olabilir; anlamını işlem açıklaması ve tutarla ilişkilendirerek yorumla.

Yapı ve başlıklar: Yanıtta tam olarak ve yalnızca şu on başlığı bu sırayla kullan; başlık satırına ek metin veya alt başlık ekleme (arayüzde görünen başlık budur): \`## Karşılama\`, \`## Genel değerlendirme\`, \`## En yüksek 5 harcama kategorisi ve yorumu\`, \`## Harcama kalıpları ve işlem notları\`, \`## Somut tasarruf önerileri\`, \`## Gelecek ay için bütçe çerçevesi\`, \`## Borç ve alacaklar\`, \`## Riskler ve dikkat edilmesi gerekenler\`, \`## Öncelikli aksiyonlar\`, \`## Kısa özet ve bir sonraki adım\`. Veri yetersizse ilgili bölümde kısaca “Bu dönem için bu bölümde yorumlanacak veri yok.” benzeri tek cümle yeterli.

- **Karşılama:** Kullanıcıya doğrudan hitap etmeden, son 30 günlük gelir, gider ve borç/alacak özetini incelediğini kısa ve kurumsal bir dille belirt. Ne kadar detaya ineceğini bu girişte anlatma; en fazla iki cümle.

- **Genel değerlendirme:** \`borcVeAlacaklar.ozet\` ile net pozisyonu (kalan alacak − kalan borç) ve son 30 gün toplam gideri birlikte çerçevele. Gelir özeti varsa gelir ile gider dengesine kısaca değin. \`yatirimlar\` doluysa portföyün tahmini toplam değeri ve varlık türü dağılımına **en fazla bir iki cümle** ile değin (tavsiye yok). Harcamaların hangi geniş alanlarda yoğunlaştığını (birkaç grup veya ana kategori) özetle; gelir düşükken lüks veya isteğe bağlı yüksek harcama örtüşüyorsa yukarıdaki “gelir–harcama uyumu” ilkesine uy. Üç ila altı cümle; spekülasyon yok.

- **En yüksek 5 harcama kategorisi ve yorumu:** Önce tek cümleyle listenin neyi temsil ettiğini belirt. Sonra her kalem için ayrı paragraf: satır başı **Ana kategori – Alt kategori (X TL)** veya alt kategori yoksa **Kategori (X TL)**; altında tutarı destekleyen kısa gözlem (bütçedeki rol, tekrar eden işlem ipucu, açıklama alanıyla örtüşme). En fazla beş kalem; tutarlar JSON’daki işlemlerle uyumlu toplamlar olsun.

- **Harcama kalıpları ve işlem notları:** \`tarih\` alanlarından haftanın hangi günlerinde veya hangi aralıklarda yoğunluk olduğunu; tek seferlik belirgin yüksek tutarları; \`aciklama\` metinlerindeki tekrarlayan üye işyeri veya abonelik izlerini tarif et. Varsayımda bulunma.

- **Somut tasarruf önerileri:** Tam üç ila beş numaralı madde. Her madde: kalın başlık (**ör. X harcamalarında küçük düzenlemeler**), ardından iki ila dört cümle; öneri ölçülebilir ve son 30 güne veya listelenen kategorilere bağlı olsun.

- **Gelecek ay için bütçe çerçevesi:** Sabit giderler, değişken harcamalar ve varsa borç ödemesi veya tasarruf ayırımını net etiketlerle ayır. Payları mümkünse son 30 günün dağılımına dayandır. "Gelecek ay" ve dönem sınırları için \`kullaniciAyAyarlari\` ile uyumlu düşün (kullanıcı ayı 15’te başlıyorsa bir sonraki bütçe dönemi ona göre).

- **Borç ve alacaklar:** Toplam kalan alacak ve borç; \`borcVeAlacaklar.kayitlar\` içinden vadeleri yakın veya tutarı yüksek kalemleri özetle. Tahsilat veya ödeme sıralaması için kısa, gerekçeli öneri. Kayıt yoksa veya kalanlar sıfırsa açıkça yaz.

- **Riskler ve dikkat edilmesi gerekenler:** Likidite, üst üste vadeler, tek kategoride yoğunlaşma, borç stresi sinyalleri; veriye bağlı, abartısız. Gelir sınırlıyken yüksek isteğe bağlı harcama birlikte görülüyorsa bunu risk olarak açıkça adlandır (davranışsal risk / önceliklendirme). Gerekirse kısa madde listesi.

- **Öncelikli aksiyonlar:** Dört ila yedi satır; her satır tek, fiili eylem; önceki bölümlerle gereksiz tekrar yok.

- **Kısa özet ve bir sonraki adım:** İki ila dört cümle: en kritik bulgu + bu hafta yapılabilecek somut bir kontrol veya davranış (genel motivasyon cümlesi yok).

Görselleştirme: Piksel tabanlı grafik, görsel dosya veya harici görsel link üretemezsin. Karşılaştırmayı net göstermek için uygun yerlerde GitHub-Flavor Markdown tablo kullan: \`| sütun | sütun |\` satırları ve ayırıcı \`|---|---|\` ile yaz; boşlukla hizalı sahte tablo üretme (uygulama tabloyu biçimlendiremez). Örnek sütunlar: Kategori–Alt kategori | Tutar TL | Toplam gider içinde %; rakamlar JSON ile tutarlı olsun.

Biçim: Yalnızca Markdown; paragraflar arasında boş satır; listeler için - veya numaralı madde. Abartılı emoji kullanma. Parantez içinde İngilizce veri şeması kodu (RECEIVABLE, PAYABLE vb.) yazma.`;

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
    if (todayAnalysisCount >= AI_LONG_REPORT_MAX_PER_DAY) {
      return NextResponse.json(
        {
          error: `Günlük AI analiz limitine ulaştınız (${AI_LONG_REPORT_MAX_PER_DAY}/${AI_LONG_REPORT_MAX_PER_DAY}). Yeni analiz için yarını bekleyin.`,
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
    const payload = await buildFinanceAnalyzePayload(session.user.id, {
      referenceTime: analizAnı,
    });
    const userContent = `Finans analizi için veri (JSON):\n${JSON.stringify(payload, null, 2)}`;
    const markdown = await generateGeminiText({
      apiKey: geminiKey,
      systemInstruction: SYSTEM_PROMPT,
      userText: userContent,
    });

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
