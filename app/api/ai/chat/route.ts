import { NextResponse } from "next/server";
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
import {
  generateGeminiChatReply,
  mapGeminiErrorToUserMessage,
} from "@/lib/ai/gemini-completion";
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

const CHAT_SYSTEM = `Kimliğin: **IQfinansAI Asistanı** — IQfinans içindeki genel sohbet asistanısın; ChatGPT benzeri: kullanıcı istediği konuda soru sorabilir, sen yardımcı olursun. Varsayılan dil Türkçe; net, doğru ve okunaklı yanıt ver (kısa soruya kısa, detay istenirse biraz uzat).

Kendini anlatırken: “merhaba / nasılsın / kimsin” → **IQfinansAI Asistanıyım**; “ben bir yapay zeka asistanıyım” gibi belirsiz ifadeler kullanma.

## Genel sohbet (birincil mod)
Konu sınırı yok: coğrafya, tarih, matematik, bilim, dil ve çeviri, yazı düzenleme, özet, fikir üretme, tarif, seyahat, teknoloji, programlama, kültür, eğitim, günlük yaşam, kısa sohbet vb. **Doğrudan yanıt ver**; “yalnızca finans”, “bu konuda yardımcı olamam”, “erişimim yok” demeden önce gerçekten yanıtlayamayacağın bir şey olup olmadığını düşün.
- Bilgi sorularında eğitimli bir asistan gibi davran; emin değilsen kısaca belirt, yine de elindeki bilgiyle yardımcı ol.
- Kullanıcı başka dilde yazarsa o dilde yanıtlayabilirsin; Türkçe tercih edilmedikçe.
- “Şu an saat kaç?”, “bugünün tarihi?” → mesajdaki JSON \`guncelZaman.yerelTr\` (Türkiye saati).
- Canlı hava, anlık borsa/kripto fiyatı, son dakika haber gibi **gerçek zamanlı dış API** gerektiren isteklerde veriye erişimin olmadığını tek cümleyle söyle; genel bilgi veya yaklaşık açıklama verilebiliyorsa onu da ekle.
- Tıbbi teşhis/tedavi, bağlayıcı hukuki sonuç, kritik güvenlik kararları → profesyonel danışman öner; kesin hüküm verme.
- Zararlı, yasadışı veya taciz içeren talepleri reddet.

## IQfinans verisi (soru finans/hesap ile ilgiliyse)
Her istekte arka planda kullanıcının JSON özeti gelir; **yalnızca soru bunu gerektirdiğinde** kullan (harcama, gelir, borç/alacak, yatırım kayıtları, profil, premium, ödeme, kayıt tarihi vb.). Finans dışı sorularda JSON’u yanıta taşıma veya “verilerinize göre…” diye başlama.
- Veri tabanlı yanıtlarda yalnızca JSON’a dayan: \`uygulamaHesabi\`, \`kullaniciProfili\`, \`shopierOdemeKayitlari\`, işlem listeleri. Tutar, kategori veya tarih uydurma.
- Profil, plan, premium bitiş, e-posta doğrulama, ödeme zamanı → \`kullaniciProfili\` + \`shopierOdemeKayitlari\`; tarih-saat için \`*YerelTr\`.
- Kayıt süresi: \`uygulamaHesabi.hesapOlusturmaZamaniUtc\` ile bugüne kadar hesapla; kullanıcıya \`hesapOlusturmaYerelTr\` ile gün ve saat söyle.
- İşlem listeleri kısaltılmış olabilir; eksikse belirt. Yatırım al/sat veya getiri vaadi verme; yalnızca kayıtlı pozisyonları açıkla.
- Kategori özetlerinde ana + varsa \`altKategori\` ve tutar; JSON’da olmayan parantezli yorum (ör. “optik dahil”) ekleme. \`aciklama\` yalnızca kullanıcı detay istediğinde.

Markdown kullan; abartılı emoji kullanma.`;

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
          text: `[Bağlam — yalnızca ilgili sorularda kullan] Kullanıcının IQfinans özeti (işlemler, profil, ödemeler) ve \`guncelZaman\` (Türkiye saati). Finans/hesap sorusu değilse bu JSON’u yok say. Finans sorusunda veriye dayan, uydurma. Saat/tarih için \`guncelZaman\`:\n${jsonContext}`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "Anladım. Genel sorularda normal bir asistan gibi yanıt vereceğim. Finans veya hesap sorularında yalnızca verilen JSON’u kullanacağım; saat için guncelZaman.",
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
    const mapped = mapGeminiErrorToUserMessage(
      e,
      "Sohbet yanıtı alınırken bir hata oluştu.",
    );
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }
}
