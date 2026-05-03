import { NextResponse } from "next/server";
import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
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
  AI_ASSISTANT_MAX_MESSAGES_PER_DAY,
  AI_ASSISTANT_STORED_QA_COUNT,
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
    .max(20),
});

const CHAT_SYSTEM = `Kimliğin: IQfinansAI Asistanı — IQfinansAI içinde, kullanıcının kayıtlı finans verisine dayalı soru–cevap özelliğisin. Yanıtların Türkçe, özlü ve veriye dayalı olsun (varsayılan: birkaç kısa paragraf veya madde işaretleri; kullanıcı ayrıntı isterse biraz uzatabilirsin, yine de makul sınırlı kal).

Kurallar:
- Yalnızca mesajla birlikte verilen JSON finans verisine dayanarak yanıt ver. Veride olmayan tutar, kategori veya tarih uydurma.
- Veri kullanıcının son kayıtlarıyla sınırlıdır; eksik bilgi varsa bunu açıkça söyle.
- Yatırım al/sat veya getiri vaadi içeren tavsiye verme; yalnızca kayıtlı pozisyon ve tutarları açıkla.
- Genel sohbet, şaka, siyaset, hukuk, tıbbi veya JSON dışı konularda kısaca IQfinansAI Asistanı olarak yalnızca kayıtlı finans verisiyle yardımcı olabildiğini belirt.
- Markdown kullanabilirsin; abartılı emoji kullanma.
- "En çok / en az harcama hangi kategori" gibi özet sorularda: ana kategori ve varsa \`altKategori\` ile tutarı ver; parantez içinde işlem açıklamasından türetilmiş ifadeler (ör. "optik dahil", "kurs harcaması dahil") yazma — JSON’da açıkça böyle bir etiket yoksa ekleme veya yorumlama.
- \`aciklama\` alanını yalnızca kullanıcı detay istediğinde veya tek bir belirgin işlem sonucunu netleştirmek gerektiğinde kısaca kullan; dekoratif parantezli açıklamalardan kaçın.`;

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
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
            "IQfinansAI Asistanı yalnızca aktif Premium abonelikte kullanılabilir.",
        },
        { status: 403 },
      );
    }

    const turns = (await aiFinanceChatTurn.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: AI_ASSISTANT_STORED_QA_COUNT,
      select: {
        id: true,
        userMessage: true,
        assistantReply: true,
        createdAt: true,
      },
    })) as {
      id: string;
      userMessage: string;
      assistantReply: string;
      createdAt: Date;
    }[];

    return NextResponse.json({
      turns: turns.map((t) => ({
        id: t.id,
        userMessage: t.userMessage,
        assistantReply: t.assistantReply,
        createdAt: t.createdAt.toISOString(),
      })),
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
          text: `Güncel finans verisi (JSON). Soruları yalnızca bu veriyle tutarlı yanıtla:\n${jsonContext}`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "Veriyi inceledim. Sorularınızı bu kayıtlara dayanarak Türkçe yanıtlayacağım.",
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
    const { count: dayCount, trackingEnabled } = await getAiChatDailyCount(
      session.user.id,
      dayKey,
    );
    if (trackingEnabled && dayCount >= AI_ASSISTANT_MAX_MESSAGES_PER_DAY) {
      return NextResponse.json(
        {
          error: `Günlük sohbet mesajı limitine ulaştınız (${dayCount}/${AI_ASSISTANT_MAX_MESSAGES_PER_DAY}). Yarın tekrar deneyebilirsiniz.`,
        },
        { status: 429 },
      );
    }

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
      return NextResponse.json(
        { error: "Mesaj listesi geçersiz veya çok uzun." },
        { status: 400 },
      );
    }
    const { messages } = parsed.data;
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

    await incrementAiChatDailyCount(session.user.id, dayKey);

    try {
      await aiFinanceChatTurn.create({
        data: {
          userId: session.user.id,
          userMessage: lastUser,
          assistantReply: reply,
        },
      });
      const idsNewestFirst = (await aiFinanceChatTurn.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })) as { id: string }[];
      const staleIds = idsNewestFirst
        .slice(AI_ASSISTANT_STORED_QA_COUNT)
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
