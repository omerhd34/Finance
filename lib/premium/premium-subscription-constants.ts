export const PREMIUM_SUBSCRIPTION_DAYS = 30;
export const PREMIUM_TRIAL_DAYS = 10;

const MS_PER_DAY = 86_400_000;

export function addPremiumPeriod(from: Date): Date {
  return new Date(from.getTime() + PREMIUM_SUBSCRIPTION_DAYS * MS_PER_DAY);
}

export function addPremiumTrialPeriod(from: Date): Date {
  return new Date(from.getTime() + PREMIUM_TRIAL_DAYS * MS_PER_DAY);
}
