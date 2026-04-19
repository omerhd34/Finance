import { prisma } from "@/lib/prisma";

export async function isUserPremiumInDb(userId: string): Promise<boolean> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true },
  });
  return row?.planTier === "premium";
}
