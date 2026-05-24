import { prisma } from "@/lib/db/prisma";
import { addPremiumTrialPeriod } from "@/lib/premium/premium-subscription-constants";

export {
  PREMIUM_SUBSCRIPTION_DAYS,
  PREMIUM_TRIAL_DAYS,
  addPremiumPeriod,
  addPremiumTrialPeriod,
} from "@/lib/premium/premium-subscription-constants";

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

export async function grantPremiumTrialIfEligible(
  userId: string,
): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      planTier: true,
      premiumTrialUsedAt: true,
    },
  });
  if (!u) return false;
  if (!u.emailVerified) return false;
  if (u.premiumTrialUsedAt != null) return false;
  if (u.planTier === "premium") return false;

  const now = new Date();
  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      premiumTrialUsedAt: null,
      planTier: "free",
      emailVerified: { not: null },
    },
    data: {
      planTier: "premium",
      premiumUntil: addPremiumTrialPeriod(now),
      premiumTrialUsedAt: now,
    },
  });
  return result.count > 0;
}
