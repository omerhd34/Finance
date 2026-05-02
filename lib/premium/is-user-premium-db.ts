import { prisma } from "@/lib/db/prisma";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

export async function isUserPremiumInDb(userId: string): Promise<boolean> {
  await ensurePremiumNotExpired(userId);
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true },
  });
  return row?.planTier === "premium";
}
