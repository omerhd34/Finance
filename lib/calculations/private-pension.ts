export type PensionExitType = "early" | "matured" | "retired";

export type PensionPaymentFrequency =
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "yearly";

export type PensionInput = {
  contributionAmount: number;
  paymentFrequency: PensionPaymentFrequency;
  initialContribution: number;
  annualContributionIncreasePercent: number;
  years: number;
  annualReturnPercent: number;
  fundExpensePercent: number;
  monthlyMinimumWageGross: number;
  exitType: PensionExitType;
};

export type PensionScheduleRow = {
  year: number;
  contribution: number;
  stateBonus: number;
  interest: number;
  privateBalance: number;
  stateBalance: number;
  totalBalance: number;
};

export type PensionResult = {
  totalContribution: number;
  totalStateBonus: number;
  totalInterest: number;
  netAnnualReturnPercent: number;
  vestingPercent: number;
  vestedStateBonus: number;
  withholdingPercent: number;
  withholdingAmount: number;
  grossBalance: number;
  netBalance: number;
  schedule: PensionScheduleRow[];
};

export const STATE_BONUS_RATE = 0.3;
export const ANNUAL_STATE_BONUS_CAP_RATE = 0.3;
export const DEFAULT_MONTHLY_GROSS_MINIMUM_WAGE = 33_030;

const PAYMENTS_PER_YEAR: Record<PensionPaymentFrequency, number> = {
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  yearly: 1,
};

function getVestingPercent(years: number, exitType: PensionExitType): number {
  if (exitType === "retired") return 1;
  if (exitType === "matured") return 0.6;
  if (years >= 6) return 0.35;
  if (years >= 3) return 0.15;
  return 0;
}

function getWithholdingPercent(exitType: PensionExitType): number {
  if (exitType === "retired") return 0.05;
  if (exitType === "matured") return 0.1;
  return 0.15;
}

function monthlyRate(annualReturnPercent: number): number {
  const annual = annualReturnPercent / 100;
  if (annual <= -1) return 0;
  return Math.pow(1 + annual, 1 / 12) - 1;
}

export function calculatePrivatePension({
  contributionAmount,
  paymentFrequency,
  initialContribution,
  annualContributionIncreasePercent,
  years,
  annualReturnPercent,
  fundExpensePercent,
  monthlyMinimumWageGross,
  exitType,
}: PensionInput): PensionResult {
  const safeContribution = Math.max(0, contributionAmount);
  const safeInitialContribution = Math.max(0, initialContribution);
  const safeYears = Math.max(0, Math.floor(years));
  const safeIncreaseRate =
    Math.min(Math.max(0, annualContributionIncreasePercent), 10) / 100;
  const safeFundExpensePercent = Math.min(Math.max(0, fundExpensePercent), 100);
  const netAnnualReturnPercent =
    ((1 + annualReturnPercent / 100) * (1 - safeFundExpensePercent / 100) - 1) *
    100;
  const i = monthlyRate(netAnnualReturnPercent);
  const paymentsPerYear = PAYMENTS_PER_YEAR[paymentFrequency];
  const paymentIntervalMonths = 12 / paymentsPerYear;
  const annualBonusCap =
    Math.max(0, monthlyMinimumWageGross) * 12 * ANNUAL_STATE_BONUS_CAP_RATE;

  let privateBalance = safeInitialContribution;
  let stateBalance = 0;
  let totalContribution = safeInitialContribution;
  let totalStateBonus = 0;
  let totalInterest = 0;
  const schedule: PensionScheduleRow[] = [];

  for (let year = 1; year <= safeYears; year++) {
    const currentContribution =
      safeContribution * Math.pow(1 + safeIncreaseRate, year - 1);
    let yearInterest = 0;
    let yearContribution = 0;

    for (let m = 0; m < 12; m++) {
      if (m % paymentIntervalMonths === 0) {
        privateBalance += currentContribution;
        yearContribution += currentContribution;
      }
      const privateInterest = privateBalance * i;
      const stateInterest = stateBalance * i;
      privateBalance += privateInterest;
      stateBalance += stateInterest;
      yearInterest += privateInterest + stateInterest;
    }

    const eligibleContribution =
      year === 1
        ? yearContribution + safeInitialContribution
        : yearContribution;
    const annualStateBonus = Math.min(
      eligibleContribution * STATE_BONUS_RATE,
      annualBonusCap,
    );

    totalContribution += yearContribution;
    totalInterest += yearInterest;
    stateBalance += annualStateBonus;
    totalStateBonus += annualStateBonus;

    schedule.push({
      year,
      contribution: yearContribution,
      stateBonus: annualStateBonus,
      interest: yearInterest,
      privateBalance,
      stateBalance,
      totalBalance: privateBalance + stateBalance,
    });
  }

  const vestingPercent = getVestingPercent(safeYears, exitType);
  const vestedStateBonus = stateBalance * vestingPercent;
  const withholdingPercent = getWithholdingPercent(exitType);
  const withholdingAmount = Math.max(0, totalInterest) * withholdingPercent;
  const grossBalance = privateBalance + vestedStateBonus;
  const netBalance = grossBalance - withholdingAmount;

  return {
    totalContribution,
    totalStateBonus,
    totalInterest,
    netAnnualReturnPercent,
    vestingPercent,
    vestedStateBonus,
    withholdingPercent,
    withholdingAmount,
    grossBalance,
    netBalance,
    schedule,
  };
}
