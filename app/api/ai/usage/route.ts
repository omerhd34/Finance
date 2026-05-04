import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { prisma } from "@/lib/db/prisma";
import { getAiChatDailyCount } from "@/lib/db/ai-chat-daily-usage";
import {
  AI_ASSISTANT_MAX_MESSAGES_PER_DAY,
  AI_LONG_REPORT_MAX_PER_DAY,
} from "@/lib/ai/ai-insights-limits";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

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
            "AI kullanım hakları yalnızca aktif Premium abonelikte görüntülenebilir.",
        },
        { status: 403 },
      );
    }

    const dayKey = utcDayKey(new Date());
    const { count: questionCount } = await getAiChatDailyCount(
      session.user.id,
      dayKey,
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const analysisCount = await prisma.aiFinanceAnalysis.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });

    const remainingQuestions = Math.max(
      0,
      AI_ASSISTANT_MAX_MESSAGES_PER_DAY - questionCount,
    );
    const remainingAnalyses = Math.max(0, AI_LONG_REPORT_MAX_PER_DAY - analysisCount);

    return NextResponse.json({
      remainingQuestions,
      remainingAnalyses,
      questionLimit: AI_ASSISTANT_MAX_MESSAGES_PER_DAY,
      analysisLimit: AI_LONG_REPORT_MAX_PER_DAY,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kalan AI hakları yüklenemedi." },
      { status: 500 },
    );
  }
}
