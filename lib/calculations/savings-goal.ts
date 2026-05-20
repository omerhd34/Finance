export type SavingsFrequency =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "ninemonthly"
  | "yearly";

export type SavingsMode = "future-value" | "duration" | "contribution";

export const PERIODS_PER_YEAR: Record<SavingsFrequency, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  ninemonthly: 12 / 9,
  yearly: 1,
};

export const FREQUENCY_LABELS: Record<SavingsFrequency, string> = {
  weekly: "Haftalık",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  semiannual: "6 Aylık",
  ninemonthly: "9 Aylık",
  yearly: "Yıllık",
};

export const PERIOD_UNIT_LABELS: Record<SavingsFrequency, string> = {
  weekly: "hafta",
  monthly: "ay",
  quarterly: "3 aylık dönem",
  semiannual: "6 aylık dönem",
  ninemonthly: "9 aylık dönem",
  yearly: "yıl",
};

export const MONTHS_PER_PERIOD: Record<SavingsFrequency, number> = {
  weekly: 0,
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  ninemonthly: 9,
  yearly: 12,
};

type CommonInput = {
  initialAmount: number;
  annualReturnPercent: number;
  frequency: SavingsFrequency;
};

export type FutureValueInput = CommonInput & {
  contribution: number;
  periods: number;
};

export type FutureValueResult = {
  futureValue: number;
  totalContributed: number;
  totalInterest: number;
};

export type DurationInput = CommonInput & {
  contribution: number;
  targetAmount: number;
};

export type DurationResult = {
  periods: number;
  totalContributed: number;
  totalInterest: number;
  reached: boolean;
};

export type ContributionInput = CommonInput & {
  targetAmount: number;
  periods: number;
};

export type ContributionResult = {
  contribution: number;
  totalContributed: number;
  totalInterest: number;
};

export type SavingsScheduleRow = {
  periodNo: number;
  date: Date;
  openingBalance: number;
  interest: number;
  contribution: number;
  closingBalance: number;
};

export type ScheduleInput = {
  initialAmount: number;
  contribution: number;
  annualReturnPercent: number;
  periods: number;
  frequency: SavingsFrequency;
  startDate?: Date;
};

function periodRate(annualReturnPercent: number, frequency: SavingsFrequency) {
  const annual = annualReturnPercent / 100;
  if (annual <= -1) return 0;
  return Math.pow(1 + annual, 1 / PERIODS_PER_YEAR[frequency]) - 1;
}

export function calculateFutureValue({
  initialAmount,
  contribution,
  annualReturnPercent,
  periods,
  frequency,
}: FutureValueInput): FutureValueResult {
  const safeInitial = Math.max(0, initialAmount);
  const safeContribution = Math.max(0, contribution);
  const safePeriods = Math.max(0, Math.floor(periods));
  const i = periodRate(annualReturnPercent, frequency);

  let futureValue: number;
  if (i === 0) {
    futureValue = safeInitial + safeContribution * safePeriods;
  } else {
    const growth = Math.pow(1 + i, safePeriods);
    futureValue =
      safeInitial * growth + safeContribution * (1 + i) * ((growth - 1) / i);
  }

  const totalContributed = safeInitial + safeContribution * safePeriods;
  return {
    futureValue,
    totalContributed,
    totalInterest: futureValue - totalContributed,
  };
}

export function calculateDuration({
  initialAmount,
  contribution,
  annualReturnPercent,
  targetAmount,
  frequency,
}: DurationInput): DurationResult {
  const safeInitial = Math.max(0, initialAmount);
  const safeContribution = Math.max(0, contribution);
  const safeTarget = Math.max(0, targetAmount);
  const i = periodRate(annualReturnPercent, frequency);

  if (safeTarget <= safeInitial) {
    return {
      periods: 0,
      totalContributed: safeInitial,
      totalInterest: 0,
      reached: true,
    };
  }

  let periods = 0;
  let reached = false;

  if (i === 0) {
    if (safeContribution > 0) {
      periods = (safeTarget - safeInitial) / safeContribution;
      reached = true;
    }
  } else {
    const due = safeContribution * (1 + i);
    const numerator = safeTarget * i + due;
    const denominator = safeInitial * i + due;
    if (denominator > 0 && numerator > 0) {
      const ratio = numerator / denominator;
      if (ratio > 1) {
        periods = Math.log(ratio) / Math.log(1 + i);
        reached = true;
      } else if (safeInitial * (1 + i) >= safeTarget) {
        reached = true;
      }
    }
  }

  const periodsCeil = reached ? Math.max(0, Math.ceil(periods)) : 0;
  const fv = reached
    ? calculateFutureValue({
        initialAmount: safeInitial,
        contribution: safeContribution,
        annualReturnPercent,
        periods: periodsCeil,
        frequency,
      })
    : { futureValue: 0, totalContributed: 0, totalInterest: 0 };

  return {
    periods: reached ? periods : 0,
    totalContributed: fv.totalContributed,
    totalInterest: fv.totalInterest,
    reached,
  };
}

export function calculateRequiredContribution({
  initialAmount,
  targetAmount,
  annualReturnPercent,
  periods,
  frequency,
}: ContributionInput): ContributionResult {
  const safeInitial = Math.max(0, initialAmount);
  const safeTarget = Math.max(0, targetAmount);
  const safePeriods = Math.max(0, Math.floor(periods));
  const i = periodRate(annualReturnPercent, frequency);

  if (safePeriods === 0) {
    return {
      contribution: 0,
      totalContributed: safeInitial,
      totalInterest: 0,
    };
  }

  let contribution: number;
  if (i === 0) {
    contribution = Math.max(0, (safeTarget - safeInitial) / safePeriods);
  } else {
    const growth = Math.pow(1 + i, safePeriods);
    const annuityFactor = ((growth - 1) / i) * (1 + i);
    const remaining = safeTarget - safeInitial * growth;
    contribution = remaining > 0 ? remaining / annuityFactor : 0;
  }

  const totalContributed = safeInitial + contribution * safePeriods;
  return {
    contribution,
    totalContributed,
    totalInterest: Math.max(0, safeTarget - totalContributed),
  };
}

export function buildSavingsSchedule({
  initialAmount,
  contribution,
  annualReturnPercent,
  periods,
  frequency,
  startDate,
}: ScheduleInput): SavingsScheduleRow[] {
  const safeInitial = Math.max(0, initialAmount);
  const safeContribution = Math.max(0, contribution);
  const safePeriods = Math.max(0, Math.floor(periods));
  const i = periodRate(annualReturnPercent, frequency);
  const base = startDate ?? new Date();

  const rows: SavingsScheduleRow[] = [];
  let balance = safeInitial;

  for (let n = 1; n <= safePeriods; n++) {
    const principalWithContribution = balance + safeContribution;
    const interest = principalWithContribution * i;
    const closing = principalWithContribution + interest;

    const date = new Date(base);
    if (frequency === "weekly") {
      date.setDate(date.getDate() + n * 7);
    } else {
      date.setMonth(date.getMonth() + n * MONTHS_PER_PERIOD[frequency]);
    }

    rows.push({
      periodNo: n,
      date,
      openingBalance: principalWithContribution,
      interest,
      contribution: safeContribution,
      closingBalance: closing,
    });

    balance = closing;
  }

  return rows;
}
