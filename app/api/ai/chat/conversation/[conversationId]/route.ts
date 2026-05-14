import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { AI_ASSISTANT_MAX_STORED_TURNS } from "@/lib/ai/ai-insights-limits";
import { aiFinanceChatTurn, prisma } from "@/lib/db/prisma";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

type RouteContext = { params: Promise<{ conversationId: string }> };

async function requirePremiumChatSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Yetkisiz" }, { status: 401 }),
    } as const;
  }
  const emailBlock = blockIfEmailNotVerified(session);
  if (emailBlock) return { error: emailBlock } as const;
  await ensurePremiumNotExpired(session.user.id);

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planTier: true },
  });
  if (!dbUser || dbUser.planTier !== "premium") {
    return {
      error: NextResponse.json(
        {
          error:
            "IQfinansAI Asistanı yalnızca aktif Premium abonelikte kullanılabilir.",
        },
        { status: 403 },
      ),
    } as const;
  }
  return { session } as const;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const gate = await requirePremiumChatSession();
    if ("error" in gate) return gate.error;

    const { conversationId } = await context.params;
    if (!conversationId || conversationId.length > 128) {
      return NextResponse.json({ error: "Geçersiz konuşma" }, { status: 400 });
    }

    const rows = (await aiFinanceChatTurn.findMany({
      where: {
        userId: gate.session.user.id,
        conversationId,
      },
      orderBy: { createdAt: "asc" },
      take: AI_ASSISTANT_MAX_STORED_TURNS,
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

    const turns = rows.map((t) => ({
      id: t.id,
      conversationId: t.conversationId ?? t.id,
      userMessage: t.userMessage,
      assistantReply: t.assistantReply,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ turns });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Sohbet yüklenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const gate = await requirePremiumChatSession();
    if ("error" in gate) return gate.error;

    const { conversationId } = await context.params;
    if (!conversationId || conversationId.length > 128) {
      return NextResponse.json({ error: "Geçersiz konuşma" }, { status: 400 });
    }

    const removed = await aiFinanceChatTurn.deleteMany({
      where: { userId: gate.session.user.id, conversationId },
    });
    if (removed.count === 0) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deleted: removed.count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
