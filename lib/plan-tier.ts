export const PLAN_TIERS = ["free", "premium"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export function normalizePlanTier(value: unknown): PlanTier {
  return value === "premium" ? "premium" : "free";
}
