export const PREMIUM_SUBSCRIPTION_DAYS = 30;

const MS_PER_DAY = 86_400_000;

export function addPremiumPeriod(from: Date): Date {
  return new Date(from.getTime() + PREMIUM_SUBSCRIPTION_DAYS * MS_PER_DAY);
}
