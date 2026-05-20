import { TurkeyCpiRecord } from "@/lib/data/cpi-turkey";

export type CpiEquivalentInput = {
  amount: number;
  startIndex: number;
  endIndex: number;
};

export type CpiEquivalentResult = {
  equivalentAmount: number;
  differenceAmount: number;
  inflationRatePercent: number;
  multiplier: number;
};

export function calculateCpiEquivalent({
  amount,
  startIndex,
  endIndex,
}: CpiEquivalentInput): CpiEquivalentResult {
  const safeAmount = Math.max(0, amount);

  if (startIndex <= 0 || endIndex <= 0) {
    return {
      equivalentAmount: 0,
      differenceAmount: 0,
      inflationRatePercent: 0,
      multiplier: 0,
    };
  }

  const multiplier = endIndex / startIndex;
  const equivalentAmount = safeAmount * multiplier;

  return {
    equivalentAmount,
    differenceAmount: equivalentAmount - safeAmount,
    inflationRatePercent: (multiplier - 1) * 100,
    multiplier,
  };
}

export function formatCpiPeriod(record: TurkeyCpiRecord) {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(new Date(record.year, record.month - 1, 1));
}
