export type LoanType = "consumer" | "housing" | "vehicle";

export const LOAN_TAX_DEFAULTS: Record<
  LoanType,
  { kkdfPercent: number; bsmvPercent: number }
> = {
  consumer: { kkdfPercent: 15, bsmvPercent: 15 },
  housing: { kkdfPercent: 0, bsmvPercent: 0 },
  vehicle: { kkdfPercent: 15, bsmvPercent: 15 },
};

export type LoanInstallmentInput = {
  principal: number;
  annualRatePercent: number;
  termMonths: number;
  kkdfPercent: number;
  bsmvPercent: number;
  allocationFee?: number;
  appraisalFee?: number;
  mortgageFee?: number;
  kaskoFee?: number;
  pledgeFee?: number;
};

export type AmortizationRow = {
  installmentNo: number;
  installmentAmount: number;
  principalPaid: number;
  interestPaid: number;
  kkdfPaid: number;
  bsmvPaid: number;
  remainingPrincipal: number;
};

export type LoanInstallmentResult = {
  monthlyPayment: number;
  totalInstallments: number;
  totalFees: number;
  totalPayment: number;
  totalCost: number;
  pureInterest: number;
  kkdfAmount: number;
  bsmvAmount: number;
  effectiveAnnualRatePercent: number;
  schedule: AmortizationRow[];
};

export function calculateLoanInstallment({
  principal,
  annualRatePercent,
  termMonths,
  kkdfPercent,
  bsmvPercent,
  allocationFee = 0,
  appraisalFee = 0,
  mortgageFee = 0,
  kaskoFee = 0,
  pledgeFee = 0,
}: LoanInstallmentInput): LoanInstallmentResult {
  const safePrincipal = Math.max(0, principal);
  const safeAnnualRate = Math.max(0, annualRatePercent);
  const safeMonths = Math.max(0, Math.floor(termMonths));
  const safeKkdf = Math.max(0, kkdfPercent) / 100;
  const safeBsmv = Math.max(0, bsmvPercent) / 100;
  const safeAllocation = Math.max(0, allocationFee);
  const safeAppraisal = Math.max(0, appraisalFee);
  const safeMortgage = Math.max(0, mortgageFee);
  const safeKasko = Math.max(0, kaskoFee);
  const safePledge = Math.max(0, pledgeFee);
  const totalFees =
    safeAllocation + safeAppraisal + safeMortgage + safeKasko + safePledge;

  const baseMonthlyRate = safeAnnualRate / 100 / 12;
  const taxMultiplier = 1 + safeKkdf + safeBsmv;
  const effectiveMonthlyRate = baseMonthlyRate * taxMultiplier;

  if (safePrincipal === 0 || safeMonths === 0) {
    return {
      monthlyPayment: 0,
      totalInstallments: 0,
      totalFees,
      totalPayment: totalFees,
      totalCost: totalFees,
      pureInterest: 0,
      kkdfAmount: 0,
      bsmvAmount: 0,
      effectiveAnnualRatePercent: effectiveMonthlyRate * 12 * 100,
      schedule: [],
    };
  }

  let rawMonthlyPayment: number;
  if (effectiveMonthlyRate === 0) {
    rawMonthlyPayment = safePrincipal / safeMonths;
  } else {
    const factor = Math.pow(1 + effectiveMonthlyRate, safeMonths);
    rawMonthlyPayment =
      (safePrincipal * effectiveMonthlyRate * factor) / (factor - 1);
  }
  const monthlyPayment = Math.round(rawMonthlyPayment * 100) / 100;
  const totalInstallments = monthlyPayment * safeMonths;
  const interestAndTaxes = totalInstallments - safePrincipal;
  const pureInterest =
    taxMultiplier > 0 ? interestAndTaxes / taxMultiplier : interestAndTaxes;
  const kkdfAmount = pureInterest * safeKkdf;
  const bsmvAmount = pureInterest * safeBsmv;
  const totalPayment = totalInstallments + totalFees;
  const totalCost = totalPayment - safePrincipal;

  const netDisbursement = Math.max(0, safePrincipal - totalFees);
  const irrMonthlyRate = solveMonthlyIRR(
    netDisbursement,
    monthlyPayment,
    safeMonths,
    effectiveMonthlyRate,
  );
  const effectiveAnnualRatePercent =
    (Math.pow(1 + irrMonthlyRate, 12) - 1) * 100;

  const schedule = buildSchedule({
    principal: safePrincipal,
    monthlyPayment,
    months: safeMonths,
    baseMonthlyRate,
    kkdfRate: safeKkdf,
    bsmvRate: safeBsmv,
  });

  return {
    monthlyPayment,
    totalInstallments,
    totalFees,
    totalPayment,
    totalCost,
    pureInterest,
    kkdfAmount,
    bsmvAmount,
    effectiveAnnualRatePercent,
    schedule,
  };
}

function buildSchedule({
  principal,
  monthlyPayment,
  months,
  baseMonthlyRate,
  kkdfRate,
  bsmvRate,
}: {
  principal: number;
  monthlyPayment: number;
  months: number;
  baseMonthlyRate: number;
  kkdfRate: number;
  bsmvRate: number;
}): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let remainingPrincipal = principal;

  for (let i = 1; i <= months; i++) {
    const interestPaid = remainingPrincipal * baseMonthlyRate;
    const kkdfPaid = interestPaid * kkdfRate;
    const bsmvPaid = interestPaid * bsmvRate;
    const totalDeduction = interestPaid + kkdfPaid + bsmvPaid;
    let principalPaid = monthlyPayment - totalDeduction;
    if (i === months) {
      principalPaid = remainingPrincipal;
    }
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPaid);
    rows.push({
      installmentNo: i,
      installmentAmount: monthlyPayment,
      principalPaid,
      interestPaid,
      kkdfPaid,
      bsmvPaid,
      remainingPrincipal,
    });
  }

  return rows;
}

function solveMonthlyIRR(
  netDisbursement: number,
  monthlyPayment: number,
  months: number,
  fallbackRate: number,
): number {
  if (
    netDisbursement <= 0 ||
    monthlyPayment <= 0 ||
    months <= 0 ||
    monthlyPayment * months <= netDisbursement
  ) {
    return fallbackRate;
  }

  let lo = 0;
  let hi = 1;
  for (let iter = 0; iter < 80; iter++) {
    const mid = (lo + hi) / 2;
    if (mid === 0) {
      lo = mid;
      continue;
    }
    const pv = (monthlyPayment * (1 - Math.pow(1 + mid, -months))) / mid;
    if (Math.abs(pv - netDisbursement) < 0.0001) return mid;
    if (pv > netDisbursement) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}
