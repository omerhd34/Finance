import { NextResponse } from "next/server";
import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import {
  getAiChatDailyCount,
  incrementAiChatDailyCount,
} from "@/lib/db/ai-chat-daily-usage";
import { aiFinanceChatTurn, prisma } from "@/lib/db/prisma";
import { buildFinanceAnalyzePayload } from "@/lib/ai/build-finance-analyze-payload";
import { generateGeminiChatReply } from "@/lib/ai/gemini-completion";
import {
  AI_ASSISTANT_HISTORY_PAGE_SIZE,
  AI_ASSISTANT_MAX_CONVERSATIONS_PER_DAY,
  AI_ASSISTANT_MAX_STORED_TURNS,
  AI_ASSISTANT_MAX_USER_MESSAGES_PER_CONVERSATION,
  AI_ASSISTANT_MESSAGE_LIMIT_REACHED_USER_MESSAGE,
} from "@/lib/ai/ai-insights-limits";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1500),
      }),
    )
    .min(1)
    .max(AI_ASSISTANT_MAX_USER_MESSAGES_PER_CONVERSATION * 2),
  conversationId: z.string().min(8).max(128),
});

const CHAT_SYSTEM = `Kimliğin: IQfinansAI Asistanı — IQfinans uygulaması içinde çalışan genel amaçlı bir sohbet asistanısın. Kullanıcı finans kayıtları, uygulama hesabı veya tamamen alakasız konularda soru sorabilir; yanıtların Türkçe ve özlü olsun (varsayılan: birkaç kısa paragraf veya madde işaretleri; kullanıcı ayrıntı isterse biraz uzatabilirsin, yine de makul sınırlı kal).

Kendini anlatırken: “merhaba / nasılsın / kimsin” gibi durumlarda **IQfinansAI Asistanıyım** de; “ben bir yapay zeka asistanıyım” gibi genel ifadeleri kullanma.

Finans ve uygulama verisi (mesajla gelen JSON):
- İşlemler, harcama/gelir özetleri, profil, ödeme geçmişi gibi **veri tabanlı** sorularda yalnızca mesajda verilen JSON’a dayan: finans kayıtları, \`uygulamaHesabi\`, \`kullaniciProfili\` (oturum sahibi; şifre ve profil resmi yok), \`shopierOdemeKayitlari\`. Veride olmayan tutar, kategori veya tarih uydurma.
- Kullanıcı **kendi** profili, e-posta/telefon, plan, premium bitiş tarihi, e-postanın doğrulanıp doğrulanmadığı (\`ePostaDogrulandi\`), “ödeme ne zaman / son ödeme / premium ne zaman bitiyor” gibi sorular sorduğunda yanıtı \`kullaniciProfili\` ve \`shopierOdemeKayitlari\` üzerinden ver; tarih-saat anlatırken \`*YerelTr\` alanlarını kullan. \`kullaniciProfili\` ve \`shopierOdemeKayitlari.not\` içindeki açıklamaları dikkate al.
- \`uygulamaHesabi.hesapOlusturmaZamaniUtc\` kullanıcı kaydının oluşturulma zamanıdır (UTC); \`uygulamaHesabi.hesapOlusturmaYerelTr\` aynı anın Türkiye saatindeki tarih + saat-dakika metnidir. “Uygulamayı ne zamandır kullanıyorum”, “ne zaman kayıt oldum?” gibi sorularda süreyi UTC’den bugüne göre hesapla; kullanıcıya kayıt zamanını anlatırken **mutlaka** \`hesapOlusturmaYerelTr\` ile hem günü hem saati söyle (yalnızca tarih verme); \`uygulamaHesabi.not\` içindeki uyarıyı gerektiğinde tek cümleyle aktar.
- Finans işlem listeleri (harcama/gelir penceresi) kullanıcının son kayıtlarıyla sınırlı olabilir; profil/ödeme alanları ayrıdır. Eksik bilgi varsa bunu açıkça söyle.
- Yatırım al/sat veya getiri vaadi içeren tavsiye verme; yalnızca kayıtlı pozisyon ve tutarları açıkla.
- "En çok / en az harcama hangi kategori" gibi özet sorularda: ana kategori ve varsa \`altKategori\` ile tutarı ver; parantez içinde işlem açıklamasından türetilmiş ifadeler (ör. "optik dahil", "kurs harcaması dahil") yazma — JSON’da açıkça böyle bir etiket yoksa ekleme veya yorumlama.
- \`aciklama\` alanını yalnızca kullanıcı detay istediğinde veya tek bir belirgin işlem sonucunu netleştirmek gerektiğinde kısaca kullan; dekoratif parantezli açıklamalardan kaçın.

Genel konular (JSON ile doğrudan ilgisi olmayan sorular):
- Nazik ve yardımcı ol; genel bilgi, dil, günlük yaşam, öğrenme veya kısa sohbet konularında makul yanıt verebilirsin.
- Tıbbi teşhis/tedavi, hukuki sonuç veya kişisel güvenlik kritik kararları için profesyonel danışmana yönlendir; bu alanlarda kesin hüküm verme.
- Zararlı, yasadışı veya kişisel saldırganlık taleplerini yerine getirme.

Markdown kullanabilirsin; abartılı emoji kullanma.`;

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseHistoryPagination(req: Request): {
  offset: number;
  pageSize: number;
} {
  const url = new URL(req.url);
  const parsedOffset = Number.parseInt(
    url.searchParams.get("offset") ?? "0",
    10,
  );
  const offset = Number.isFinite(parsedOffset)
    ? Math.min(
        Math.max(0, parsedOffset),
        Math.max(0, AI_ASSISTANT_MAX_STORED_TURNS - 1),
      )
    : 0;

  const rawLimit = url.searchParams.get("limit");
  const parsedLimit =
    rawLimit === null || rawLimit === ""
      ? AI_ASSISTANT_HISTORY_PAGE_SIZE
      : Number.parseInt(rawLimit, 10);
  const maxByRemaining = Math.max(1, AI_ASSISTANT_MAX_STORED_TURNS - offset);
  const pageSize = Number.isFinite(parsedLimit)
    ? Math.min(
        Math.max(1, parsedLimit),
        AI_ASSISTANT_MAX_STORED_TURNS,
        maxByRemaining,
      )
    : Math.min(AI_ASSISTANT_HISTORY_PAGE_SIZE, maxByRemaining);

  return { offset, pageSize };
}

export async function GET(req: Request) {
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
            "IQfinansAI Asistanı yalnızca aktif Premium abonelikte kullanılabilir.",
        },
        { status: 403 },
      );
    }

    const { offset, pageSize } = parseHistoryPagination(req);
    const take = pageSize + 1;

    const countRows = await prisma.$queryRaw<Array<{ c: bigint }>>(
      Prisma.sql`
        SELECT COUNT(DISTINCT CASE
          WHEN \`conversationId\` IS NOT NULL
            AND CHAR_LENGTH(TRIM(\`conversationId\`)) > 0
          THEN TRIM(\`conversationId\`)
          ELSE \`id\`
        END) AS c
        FROM \`AiFinanceChatTurn\`
        WHERE \`userId\` = ${session.user.id}
      `,
    );
    const distinctConversationCount = Number(countRows[0]?.c ?? 0);

    const rows = (await aiFinanceChatTurn.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take,
      select: {
        id: true,
        conversationId: true,
        userMessage: true,
        assistantReply: true,
        createdAt: true,
      },
    })) as {
      id: string;
      conversationId: string | null;
      userMessage: string;
      assistantReply: string;
      createdAt: Date;
    }[];

    const hasMore = rows.length > pageSize;
    const turns = (hasMore ? rows.slice(0, pageSize) : rows).map((t) => ({
      id: t.id,
      conversationId: t.conversationId ?? t.id,
      userMessage: t.userMessage,
      assistantReply: t.assistantReply,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({
      turns,
      hasMore,
      distinctConversationCount,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Sohbet geçmişi yüklenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

function toGeminiHistory(
  jsonContext: string,
  clientMessages: { role: "user" | "assistant"; content: string }[],
): {
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  lastUser: string;
} {
  const head: { role: "user" | "model"; parts: { text: string }[] }[] = [
    {
      role: "user",
      parts: [
        {
          text: `Aşağıda kullanıcının güncel finans verisi ve hesap özeti (JSON) var. Finans, işlem, profil veya uygulama kayıtlarıyla ilgili sorularda yalnızca bu JSON’a dayan; veride olmayan bilgi uydurma. Finans dışı sorularda bu veriyi yalnızca soru ilgiliyse kullan:\n${jsonContext}`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "Anladım. Finans ve kayıtlarla ilgili soruları verilen veriyle; diğer konularda genel yardımı Türkçe sunacağım.",
        },
      ],
    },
  ];
  const withoutLast = clientMessages.slice(0, -1);
  for (const m of withoutLast) {
    head.push({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    });
  }
  const last = clientMessages[clientMessages.length - 1];
  return { history: head, lastUser: last.content };
}

export async function POST(req: Request) {
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
            "IQfinansAI Asistanı yalnızca aktif Premium abonelikte kullanılabilir.",
        },
        { status: 403 },
      );
    }

    const dayKey = utcDayKey(new Date());

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Geçersiz istek gövdesi" },
        { status: 400 },
      );
    }
    const parsed = bodySchema.safeParse(bodyJson);
    if (!parsed.success) {
      const messagesTooLong = parsed.error.issues.some(
        (issue) => issue.path[0] === "messages" && issue.code === "too_big",
      );
      return NextResponse.json(
        {
          error: messagesTooLong
            ? AI_ASSISTANT_MESSAGE_LIMIT_REACHED_USER_MESSAGE
            : "Mesaj listesi geçersiz veya çok uzun.",
        },
        { status: 400 },
      );
    }
    const { messages, conversationId: threadId } = parsed.data;

    const priorTurnCount = await aiFinanceChatTurn.count({
      where: {
        userId: session.user.id,
        conversationId: threadId,
      },
    });
    const isNewConversation = priorTurnCount === 0;

    if (priorTurnCount >= AI_ASSISTANT_MAX_USER_MESSAGES_PER_CONVERSATION) {
      return NextResponse.json(
        {
          error: `Bu mesajlaşmada en fazla ${String(AI_ASSISTANT_MAX_USER_MESSAGES_PER_CONVERSATION)} mesaj gönderebilirsiniz. Yeni bir mesajlaşma başlatın.`,
        },
        { status: 429 },
      );
    }

    const { count: dayConversationCount, trackingEnabled } =
      await getAiChatDailyCount(session.user.id, dayKey);
    if (
      isNewConversation &&
      trackingEnabled &&
      dayConversationCount >= AI_ASSISTANT_MAX_CONVERSATIONS_PER_DAY
    ) {
      return NextResponse.json(
        {
          error: `Günlük yeni mesajlaşma limitine ulaştınız. Aynı sohbete devam edebilir veya yarın yeni bir mesajlaşma başlatabilirsiniz.`,
        },
        { status: 429 },
      );
    }

    const last = messages[messages.length - 1];
    if (last.role !== "user") {
      return NextResponse.json(
        { error: "Son mesaj kullanıcıdan olmalıdır." },
        { status: 400 },
      );
    }
    for (let i = 0; i < messages.length; i++) {
      const expected: "user" | "assistant" = i % 2 === 0 ? "user" : "assistant";
      if (messages[i].role !== expected) {
        return NextResponse.json(
          { error: "Mesaj sırası user / assistant şeklinde olmalıdır." },
          { status: 400 },
        );
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        {
          error:
            "AI yapılandırması eksik. .env dosyasına GEMINI_API_KEY ekleyin.",
        },
        { status: 503 },
      );
    }

    const payload = await buildFinanceAnalyzePayload(session.user.id, {
      truncate: { maxExpenses: 120, maxIncomes: 60 },
    });
    const jsonContext = JSON.stringify(payload, null, 2);
    const { history, lastUser } = toGeminiHistory(jsonContext, messages);

    const reply = await generateGeminiChatReply({
      apiKey: geminiKey,
      systemInstruction: CHAT_SYSTEM,
      history,
      message: lastUser,
    });

    try {
      await aiFinanceChatTurn.create({
        data: {
          userId: session.user.id,
          conversationId: threadId,
          userMessage: lastUser,
          assistantReply: reply,
        },
      });
      if (isNewConversation) {
        await incrementAiChatDailyCount(session.user.id, dayKey);
      }
      const idsNewestFirst = (await aiFinanceChatTurn.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })) as { id: string }[];
      const staleIds = idsNewestFirst
        .slice(AI_ASSISTANT_MAX_STORED_TURNS)
        .map((r) => r.id);
      if (staleIds.length > 0) {
        await aiFinanceChatTurn.deleteMany({
          where: { id: { in: staleIds } },
        });
      }
    } catch (persistErr) {
      console.error("aiFinanceChatTurn persist failed", persistErr);
    }

    return NextResponse.json({ reply });
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
            "Gemini kotası veya istek limiti aşıldı. Birkaç dakika sonra tekrar deneyin.",
        },
        { status: 429 },
      );
    }
    if (fetchErr?.status === 503 || errMsg.includes("503")) {
      return NextResponse.json(
        {
          error:
            "Model şu an yanıt veremedi. Lütfen kısa süre sonra tekrar deneyin.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Sohbet yanıtı alınırken bir hata oluştu." },
      { status: 500 },
    );
  }
}
