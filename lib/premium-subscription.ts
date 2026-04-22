import { prisma } from "@/lib/prisma";

export {
  PREMIUM_SUBSCRIPTION_DAYS,
  addPremiumPeriod,
} from "@/lib/premium-subscription-constants";

export async function ensurePremiumNotExpired(userId: string): Promise<void> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true, premiumUntil: true },
  });
  if (!u) return;
  if (
    u.planTier === "premium" &&
    u.premiumUntil != null &&
    u.premiumUntil.getTime() <= Date.now()
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: { planTier: "free", premiumUntil: null },
    });
  }
}
