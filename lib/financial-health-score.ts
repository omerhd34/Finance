import type { MonthlyBarRow } from "@/lib/dashboard-stats";

type FinancialHealthInput = {
  monthIncome: number;
  monthExpense: number;
  debtReceivable: number;
  debtPayable: number;
  monthlyBars: MonthlyBarRow[];
  investmentPnl?: number;
};

export type FinancialHealthScore = {
  score: number;
  level: "zayif" | "gelisiyor" | "iyi" | "cok-iyi";
  insight: string;
};

type ScoreBand = {
  min: number;
  max: number;
  level: FinancialHealthScore["level"];
  insight: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function weightedAverage(
  parts: Array<{ score: number; weight: number }>,
): number {
  const totalWeight = parts.reduce((acc, part) => acc + part.weight, 0);
  if (totalWeight <= 0) return 0;
  const weightedTotal = parts.reduce(
    (acc, part) => acc + part.score * part.weight,
    0,
  );
  return weightedTotal / totalWeight;
}

function piecewiseLinear(
  value: number,
  points: Array<{ x: number; y: number }>,
): number {
  if (points.length === 0) return 0;
  if (value <= points[0]!.x) return points[0]!.y;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    if (value <= curr.x) {
      const t = (value - prev.x) / (curr.x - prev.x);
      return prev.y + (curr.y - prev.y) * t;
    }
  }
  return points.at(-1)?.y ?? 0;
}

function scoreFromSavingsRatio(ratio: number): number {
  if (ratio >= 0.3) return 100;
  if (ratio >= 0.2) return 85;
  if (ratio >= 0.1) return 72;
  if (ratio >= 0) return 58;
  if (ratio >= -0.1) return 38;
  return 18;
}

function scoreFromCoverage(income: number, expense: number): number {
  if (expense <= 0 && income > 0) return 100;
  if (expense <= 0) return 50;
  const ratio = income / expense;
  if (ratio >= 1.5) return 100;
  if (ratio >= 1.25) return 88;
  if (ratio >= 1.1) return 76;
  if (ratio >= 1) return 62;
  if (ratio >= 0.9) return 46;
  return 25;
}

function scoreFromDebtPressure(
  income: number,
  debtReceivable: number,
  debtPayable: number,
): number {
  const netDebt = Math.max(0, debtPayable - debtReceivable);
  const bufferedDebt = Math.max(0, debtPayable - debtReceivable * 0.5);
  if (income <= 0) return bufferedDebt <= 0 ? 45 : 10;

  const netDebtRatio = netDebt / income;
  const pressureRatio = bufferedDebt / income;
  const netDebtScore = piecewiseLinear(netDebtRatio, [
    { x: 0, y: 100 },
    { x: 0.25, y: 88 },
    { x: 0.5, y: 72 },
    { x: 0.9, y: 52 },
    { x: 1.5, y: 30 },
    { x: 2.5, y: 12 },
  ]);
  const pressureScore = piecewiseLinear(pressureRatio, [
    { x: 0, y: 100 },
    { x: 0.2, y: 90 },
    { x: 0.45, y: 76 },
    { x: 0.8, y: 56 },
    { x: 1.2, y: 36 },
    { x: 2, y: 14 },
  ]);
  return clamp(netDebtScore * 0.55 + pressureScore * 0.45, 0, 100);
}

function scoreFromTrend(monthlyBars: MonthlyBarRow[]): number {
  if (monthlyBars.length === 0) return 50;
  const nets = monthlyBars.map((row) => row.gelir - row.gider);
  const positiveRatio = nets.filter((n) => n >= 0).length / nets.length;
  const avgNet = nets.reduce((acc, n) => acc + n, 0) / nets.length;
  const lastNet = nets.at(-1) ?? 0;
  const momentumBase =
    Math.abs(avgNet) < 1 ? 0 : (lastNet - avgNet) / Math.abs(avgNet);
  const momentum = clamp((momentumBase + 1) / 2, 0, 1);

  const consistencyScore = 35 + positiveRatio * 55;
  const momentumScore = 25 + momentum * 75;
  return clamp(consistencyScore * 0.7 + momentumScore * 0.3, 0, 100);
}

function scoreFromInvestment(investmentPnl: number | undefined): number {
  if (investmentPnl === undefined) return 50;
  if (investmentPnl >= 20000) return 92;
  if (investmentPnl >= 7500) return 85;
  if (investmentPnl >= 0) return 74;
  if (investmentPnl >= -2500) return 58;
  if (investmentPnl >= -10000) return 44;
  return 28;
}

const SCORE_BANDS: ScoreBand[] = [
  {
    min: 0,
    max: 25,
    level: "zayif",
    insight: "Finansal risk kritik seviyede; acil gider kisma plani olustur.",
  },
  {
    min: 25,
    max: 40,
    level: "zayif",
    insight:
      "Kirilgan bir denge var; borc baskisini ve zorunlu harcamayi azalt.",
  },
  {
    min: 40,
    max: 55,
    level: "gelisiyor",
    insight: "Ilerleme basladi; duzenli birikim ve butce disiplini kur.",
  },
  {
    min: 55,
    max: 70,
    level: "gelisiyor",
    insight: "Denge kuruluyor; aylik net fazlayi istikrarli sekilde buyut.",
  },
  {
    min: 70,
    max: 85,
    level: "iyi",
    insight:
      "Mali denge guclu; borc ve gider optimizasyonuyla ust banda cikabilirsin.",
  },
  {
    min: 85,
    max: 100,
    level: "cok-iyi",
    insight:
      "Nakit akisin saglikli; disiplini koruyup uzun vadeli hedeflere odaklan.",
  },
];

function findScoreBand(score: number): ScoreBand {
  const normalized = clamp(score, 0, 100);
  const lastBand = SCORE_BANDS.at(-1);
  const band = SCORE_BANDS.find((item) => {
    if (item === lastBand) {
      return normalized >= item.min && normalized <= item.max;
    }
    return normalized >= item.min && normalized < item.max;
  });
  return band ?? SCORE_BANDS.at(0)!;
}

export function computeFinancialHealthScore(
  input: FinancialHealthInput,
): FinancialHealthScore {
  const savingsRatio =
    input.monthIncome > 0
      ? (input.monthIncome - input.monthExpense) / input.monthIncome
      : -1;

  const score = weightedAverage([
    { score: scoreFromSavingsRatio(savingsRatio), weight: 0.33 },
    {
      score: scoreFromCoverage(input.monthIncome, input.monthExpense),
      weight: 0.25,
    },
    {
      score: scoreFromDebtPressure(
        input.monthIncome,
        input.debtReceivable,
        input.debtPayable,
      ),
      weight: 0.24,
    },
    { score: scoreFromTrend(input.monthlyBars), weight: 0.12 },
    { score: scoreFromInvestment(input.investmentPnl), weight: 0.06 },
  ]);

  const roundedScore = Math.round(clamp(score, 0, 100));
  const band = findScoreBand(roundedScore);
  return {
    score: roundedScore,
    level: band.level,
    insight: band.insight,
  };
}
