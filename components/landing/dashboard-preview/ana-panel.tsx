import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Coins,
  HandCoins,
  LineChart as LineChartIcon,
  Receipt,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ExpenseCategoryChart } from "@/components/landing/dashboard-preview/expense-category-chart";
import { PreviewSectionHeader } from "@/components/landing/dashboard-preview/shared";

type KpiCard = {
  id: string;
  label: string;
  value: string;
  prefix?: string;
  icon: LucideIcon;
  iconClassName: string;
  glowClassName: string;
  valueClassName?: string;
  description?: string;
};

const KPI_CARDS: KpiCard[] = [
  {
    id: "income",
    label: "Son Ay Toplam Gelir",
    value: "₺48.250,00",
    icon: Wallet,
    iconClassName:
      "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
    glowClassName: "bg-emerald-500/25",
    valueClassName: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "expense",
    label: "Son Ay Toplam Gider",
    value: "₺19.107,26",
    icon: Receipt,
    iconClassName:
      "bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-400",
    glowClassName: "bg-rose-500/20",
    valueClassName: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "health",
    label: "Son Ay Finansal Sağlık Skoru",
    value: "81",
    icon: Activity,
    iconClassName:
      "bg-lime-500/15 text-lime-700 ring-lime-500/30 dark:text-lime-300",
    glowClassName: "bg-lime-500/25",
    valueClassName: "text-emerald-600 dark:text-emerald-400",
    description:
      "Mali denge güçlü; borç ve gider optimizasyonuyla üst banda çıkabilirsin.",
  },
  {
    id: "net",
    label: "Net Bakiye",
    value: "₺105.682,74",
    icon: Scale,
    iconClassName:
      "bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300",
    glowClassName: "bg-sky-500/15",
  },
  {
    id: "debt",
    label: "Borç/Alacak Neti",
    value: "₺394.955,00",
    prefix: "+",
    icon: HandCoins,
    iconClassName:
      "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    glowClassName: "bg-amber-500/20",
    valueClassName: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "investment",
    label: "Yatırım Kar/Zarar",
    value: "₺34.078,68",
    prefix: "+",
    icon: TrendingUp,
    iconClassName:
      "bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300",
    glowClassName: "bg-violet-500/20",
    valueClassName: "text-emerald-600 dark:text-emerald-400",
  },
];

const FULL_BALANCE = {
  label: "Tam Bakiye",
  value: "₺534.716,42",
  prefix: "+",
  description: "Net bakiye + borç/alacak + yatırım (Premium).",
};

const MONTH_LABELS = ["Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs"];
const INCOME_SERIES = [28_400, 19_750, 41_120, 26_840, 67_250, 48_250];
const EXPENSE_SERIES = [15_200, 26_300, 19_800, 31_400, 14_120, 19_107.26];
const SAVINGS_RATE = [46, 4, 52, 7, 79, 60];
const MAX_MONEY = 67_250;
const MAX_RATE = 100;

function KpiCardCell({ card }: { card: KpiCard }) {
  const Icon = card.icon;
  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-card via-card/90 to-muted/30 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-80 blur-3xl ${card.glowClassName}`}
        aria-hidden
      />
      <div className="relative flex min-w-0 items-start gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 sm:h-10 sm:w-10 ${card.iconClassName}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
            {card.label}
          </p>
          <p
            className={`min-w-0 text-sm font-semibold leading-tight tracking-tight tabular-nums sm:text-base lg:text-lg ${
              card.valueClassName ?? "text-foreground"
            }`}
          >
            {card.prefix ? card.prefix : ""}
            {card.value}
          </p>
          {card.description ? (
            <p className="text-[10px] font-medium leading-snug text-muted-foreground sm:text-[11px]">
              {card.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FullBalanceCard() {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-card via-card/90 to-muted/30 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/15 opacity-80 blur-3xl"
        aria-hidden
      />
      <div className="relative flex min-w-0 items-start gap-3 p-3 sm:p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 ring-1 ring-teal-500/25 sm:h-10 sm:w-10 dark:text-teal-300">
          <Coins
            className="h-4 w-4 sm:h-5 sm:w-5"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
            {FULL_BALANCE.label}
          </p>
          <p className="text-base font-semibold leading-tight tracking-tight tabular-nums text-emerald-600 sm:text-lg lg:text-xl dark:text-emerald-400">
            {FULL_BALANCE.prefix}
            {FULL_BALANCE.value}
          </p>
          <p className="text-[10px] font-medium leading-snug text-muted-foreground sm:text-[11px]">
            {FULL_BALANCE.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function IncomeExpenseSavingsChart() {
  const chartWidth = 460;
  const chartHeight = 220;
  const padLeft = 44;
  const padRight = 38;
  const padTop = 14;
  const padBottom = 34;
  const usableW = chartWidth - padLeft - padRight;
  const usableH = chartHeight - padTop - padBottom;

  const xFor = (i: number) =>
    padLeft + (i / (MONTH_LABELS.length - 1)) * usableW;
  const yMoney = (v: number) => padTop + usableH - (v / MAX_MONEY) * usableH;
  const yRate = (v: number) => padTop + usableH - (v / MAX_RATE) * usableH;

  const buildPath = (values: number[], mapY: (v: number) => number): string => {
    if (values.length === 0) return "";
    const pts = values.map((v, i) => ({ x: xFor(i), y: mapY(v) }));
    if (pts.length === 1)
      return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;

    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? pts[i + 1];

      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const incomePath = buildPath(INCOME_SERIES, yMoney);
  const expensePath = buildPath(EXPENSE_SERIES, yMoney);
  const ratePath = buildPath(SAVINGS_RATE, yRate);

  const moneyTicks = [0, 14_850, 33_625, 50_438, 67_250];
  const rateTicks = [0, 25, 50, 75, 100];

  const formatMoneyTick = (v: number) =>
    v === 0
      ? "₺0,00"
      : v >= 1000
        ? `₺${(v / 1000).toFixed(v >= 10_000 ? 1 : 2).replace(".", ",")}K`
        : `₺${v}`;

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-border/60 bg-card shadow-sm">
      <PreviewSectionHeader
        icon={LineChartIcon}
        title="Gelir, Gider ve Tasarruf Oranı"
        description="15 Kasım 2025 - 15 Mayıs 2026 döneminin aylık gelir-gider trendi ve tasarruf oranı"
      />
      <div className="flex-1 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-44 w-full sm:h-52"
          aria-hidden
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="income-line-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={padLeft}
              y1={padTop + usableH * t}
              x2={chartWidth - padRight}
              y2={padTop + usableH * t}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeDasharray="3 3"
              className="text-muted-foreground"
            />
          ))}

          {moneyTicks.map((tick) => (
            <text
              key={`m-${tick}`}
              x={padLeft - 6}
              y={yMoney(tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[8px] tabular-nums"
            >
              {formatMoneyTick(tick)}
            </text>
          ))}

          {rateTicks.map((tick) => (
            <text
              key={`r-${tick}`}
              x={chartWidth - padRight + 6}
              y={yRate(tick) + 3}
              textAnchor="start"
              className="fill-muted-foreground text-[8px] tabular-nums"
            >
              {tick}%
            </text>
          ))}

          <path
            d={`${incomePath} L${xFor(INCOME_SERIES.length - 1).toFixed(1)},${(padTop + usableH).toFixed(1)} L${xFor(0).toFixed(1)},${(padTop + usableH).toFixed(1)} Z`}
            fill="url(#income-line-area)"
          />

          <path
            d={incomePath}
            fill="none"
            stroke="#10b981"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={expensePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={ratePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {INCOME_SERIES.map((v, i) => (
            <circle
              key={`i-${i}`}
              cx={xFor(i)}
              cy={yMoney(v)}
              r={2.5}
              className="fill-emerald-500"
            />
          ))}
          {EXPENSE_SERIES.map((v, i) => (
            <circle
              key={`e-${i}`}
              cx={xFor(i)}
              cy={yMoney(v)}
              r={2.5}
              className="fill-rose-500"
            />
          ))}
          {SAVINGS_RATE.map((v, i) => (
            <circle
              key={`s-${i}`}
              cx={xFor(i)}
              cy={yRate(v)}
              r={2.5}
              className="fill-sky-500"
            />
          ))}

          {MONTH_LABELS.map((m, i) => (
            <text
              key={m}
              x={xFor(i)}
              y={chartHeight - 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {m}
            </text>
          ))}
        </svg>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border/40 pt-3">
          {[
            { label: "Gelir", color: "#10b981" },
            { label: "Gider", color: "#ef4444" },
            { label: "Tasarruf Oranı", color: "#3b82f6" },
          ].map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-[10px] font-medium text-foreground/90 sm:text-[11px]"
            >
              <span
                className="h-0.5 w-5 rounded-full ring-1 ring-white/15"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnaPanelPreview() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {KPI_CARDS.map((card) => (
          <KpiCardCell key={card.id} card={card} />
        ))}
      </div>

      <FullBalanceCard />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <IncomeExpenseSavingsChart />
        <ExpenseCategoryChart />
      </div>
    </div>
  );
}
