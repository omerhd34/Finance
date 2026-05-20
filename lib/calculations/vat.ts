export type VatMode = "exclusive" | "inclusive";

export type VatInput = {
  amount: number;
  vatRatePercent: number;
  mode: VatMode;
};

export type VatResult = {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
};

export function calculateVat({
  amount,
  vatRatePercent,
  mode,
}: VatInput): VatResult {
  const safeAmount = Math.max(0, amount);
  const safeRate = Math.max(0, vatRatePercent) / 100;

  if (mode === "exclusive") {
    const netAmount = safeAmount;
    const vatAmount = netAmount * safeRate;
    return {
      netAmount,
      vatAmount,
      grossAmount: netAmount + vatAmount,
    };
  }

  const divisor = 1 + safeRate;
  const netAmount = divisor === 0 ? 0 : safeAmount / divisor;
  const vatAmount = safeAmount - netAmount;
  return {
    netAmount,
    vatAmount,
    grossAmount: safeAmount,
  };
}

export const COMMON_VAT_RATES = [1, 8, 10, 18, 20] as const;
