import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type AiChatDailyUsageDelegate = {
  findUnique(args: {
    where: { userId_dayKey: { userId: string; dayKey: string } };
  }): Promise<{ count: number } | null>;
  upsert(args: {
    where: { userId_dayKey: { userId: string; dayKey: string } };
    create: { userId: string; dayKey: string; count: number };
    update: { count: { increment: number } };
  }): Promise<unknown>;
};

function delegate(): AiChatDailyUsageDelegate {
  return (prisma as unknown as { aiChatDailyUsage: AiChatDailyUsageDelegate })
    .aiChatDailyUsage;
}

function isMissingAiChatTable(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021"
  );
}

export async function getAiChatDailyCount(
  userId: string,
  dayKey: string,
): Promise<{ count: number; trackingEnabled: boolean }> {
  try {
    const row = await delegate().findUnique({
      where: { userId_dayKey: { userId, dayKey } },
    });
    return { count: row?.count ?? 0, trackingEnabled: true };
  } catch (e) {
    if (isMissingAiChatTable(e)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[ai-chat] AiChatDailyUsage tablosu yok; günlük kota atlanıyor. Veritabanında migration uygulayın: npx prisma migrate deploy",
        );
      }
      return { count: 0, trackingEnabled: false };
    }
    throw e;
  }
}

export async function incrementAiChatDailyCount(
  userId: string,
  dayKey: string,
): Promise<void> {
  try {
    await delegate().upsert({
      where: { userId_dayKey: { userId, dayKey } },
      create: { userId, dayKey, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch (e) {
    if (isMissingAiChatTable(e)) return;
    throw e;
  }
}
