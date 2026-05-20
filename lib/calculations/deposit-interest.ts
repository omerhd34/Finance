export type SimpleInterestInput = {
  principal: number;
  annualRatePercent: number;
  termDays: number;
};

export type SimpleInterestResult = {
  interest: number;
  maturityAmount: number;
  termReturnPercent: number;
};

export function calculateSimpleInterest({
  principal,
  annualRatePercent,
  termDays,
}: SimpleInterestInput): SimpleInterestResult {
  const safePrincipal = Math.max(0, principal);
  const safeAnnualRate = Math.max(0, annualRatePercent);
  const safeTermDays = Math.max(0, Math.floor(termDays));

  const interest =
    safePrincipal * (safeAnnualRate / 100) * (safeTermDays / 365);
  const maturityAmount = safePrincipal + interest;
  const termReturnPercent =
    safePrincipal > 0 ? (interest / safePrincipal) * 100 : 0;

  return { interest, maturityAmount, termReturnPercent };
}

export type CompoundInterestInput = {
  principal: number;
  annualRatePercent: number;
  termDays: number;
  compoundingPerYear: number;
};

export type CompoundInterestResult = {
  interest: number;
  maturityAmount: number;
  termReturnPercent: number;
};

export function calculateCompoundInterest({
  principal,
  annualRatePercent,
  termDays,
  compoundingPerYear,
}: CompoundInterestInput): CompoundInterestResult {
  const safePrincipal = Math.max(0, principal);
  const safeAnnualRate = Math.max(0, annualRatePercent);
  const safeTermDays = Math.max(0, Math.floor(termDays));
  const safeFrequency = Math.max(1, Math.floor(compoundingPerYear));

  const years = safeTermDays / 365;
  const periodicRate = safeAnnualRate / 100 / safeFrequency;
  const maturityAmount =
    safePrincipal * Math.pow(1 + periodicRate, safeFrequency * years);
  const interest = maturityAmount - safePrincipal;
  const termReturnPercent =
    safePrincipal > 0 ? (interest / safePrincipal) * 100 : 0;

  return { interest, maturityAmount, termReturnPercent };
}

export type DepositInterestInput = {
  principal: number;
  annualRatePercent: number;
  termDays: number;
  withholdingRatePercent: number;
};

export type DepositInterestResult = {
  grossInterest: number;
  withholdingAmount: number;
  netInterest: number;
  maturityAmount: number;
  effectiveNetRatePercent: number;
};

export function suggestedDepositWithholdingRate(termDays: number): number {
  if (termDays <= 0) return 15;
  if (termDays < 180) return 15;
  if (termDays < 365) return 12;
  return 10;
}

export function calculateDepositInterest({
  principal,
  annualRatePercent,
  termDays,
  withholdingRatePercent,
}: DepositInterestInput): DepositInterestResult {
  const safePrincipal = Math.max(0, principal);
  const safeAnnualRate = Math.max(0, annualRatePercent);
  const safeTermDays = Math.max(0, Math.floor(termDays));
  const safeWithholdingRate = Math.min(
    100,
    Math.max(0, withholdingRatePercent),
  );

  const grossInterest =
    safePrincipal * (safeAnnualRate / 100) * (safeTermDays / 365);
  const withholdingAmount = grossInterest * (safeWithholdingRate / 100);
  const netInterest = grossInterest - withholdingAmount;
  const maturityAmount = safePrincipal + netInterest;
  const effectiveNetRatePercent =
    safePrincipal > 0 ? (netInterest / safePrincipal) * 100 : 0;

  return {
    grossInterest,
    withholdingAmount,
    netInterest,
    maturityAmount,
    effectiveNetRatePercent,
  };
}
