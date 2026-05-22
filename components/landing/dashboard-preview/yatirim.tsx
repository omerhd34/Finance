import { ArrowDownRight, ArrowUpRight, Plus, TrendingUp } from "lucide-react";
import {
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
  formatTL,
} from "@/components/landing/dashboard-preview/shared";

type Position = {
  id: string;
  symbol: string;
  name: string;
  type: string;
  amount: number;
  avgCost: number;
  current: number;
  changePct: number;
};

const POSITIONS: Position[] = [
  {
    id: "p1",
    symbol: "GA",
    name: "Gram Altın",
    type: "Altın",
    amount: 12,
    avgCost: 2_280,
    current: 2_457.6,
    changePct: 7.79,
  },
  {
    id: "p2",
    symbol: "USD",
    name: "ABD Doları",
    type: "Döviz",
    amount: 1_500,
    avgCost: 31.2,
    current: 32.4583,
    changePct: 4.03,
  },
  {
    id: "p3",
    symbol: "THYAO",
    name: "Türk Hava Yolları",
    type: "Hisse senedi",
    amount: 250,
    avgCost: 218.4,
    current: 287.6,
    changePct: 31.7,
  },
  {
    id: "p4",
    symbol: "BRENT",
    name: "Brent Petrol",
    type: "Emtia",
    amount: 35,
    avgCost: 2_540,
    current: 2_712,
    changePct: 6.77,
  },
  {
    id: "p5",
    symbol: "BTC",
    name: "Bitcoin",
    type: "Kripto",
    amount: 0.085,
    avgCost: 1_980_000,
    current: 2_356_000,
    changePct: 18.99,
  },
];

const TOTAL_COST = POSITIONS.reduce((acc, p) => acc + p.amount * p.avgCost, 0);
const TOTAL_VALUE = POSITIONS.reduce((acc, p) => acc + p.amount * p.current, 0);
const TOTAL_PNL = TOTAL_VALUE - TOTAL_COST;
const TOTAL_PCT = (TOTAL_PNL / TOTAL_COST) * 100;

export function YatirimPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={TrendingUp}
        title="Yatırım Portföyü"
        description="Hisse, altın, döviz ve kripto pozisyonlarını canlı kotasyonlarla takip et."
        badge={
          <PreviewDisabledButton>
            <Plus className="h-3 w-3" aria-hidden />
            Pozisyon Ekle
          </PreviewDisabledButton>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Toplam Değer
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-foreground sm:text-lg">
            {formatTL(TOTAL_VALUE)}
          </p>
        </PreviewCard>
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Toplam Maliyet
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-muted-foreground sm:text-lg">
            {formatTL(TOTAL_COST)}
          </p>
        </PreviewCard>
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Net Kar/Zarar
          </p>
          <p
            className={`mt-1 text-base font-semibold tabular-nums sm:text-lg ${
              TOTAL_PNL >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {TOTAL_PNL >= 0 ? "+" : ""}
            {formatTL(TOTAL_PNL)}{" "}
            <span className="text-xs">({TOTAL_PCT.toFixed(2)}%)</span>
          </p>
        </PreviewCard>
      </div>

      <PreviewCard>
        <div className="overflow-hidden">
          <table className="w-full text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                <th className="px-3 py-2 sm:px-4">Sembol</th>
                <th className="hidden px-3 py-2 sm:table-cell sm:px-4">Tür</th>
                <th className="px-3 py-2 text-right sm:px-4">Adet</th>
                <th className="px-3 py-2 text-right sm:px-4">Güncel</th>
                <th className="px-3 py-2 text-right sm:px-4">Kar/Zarar</th>
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map((pos) => {
                const positive = pos.changePct >= 0;
                const pnl = (pos.current - pos.avgCost) * pos.amount;
                return (
                  <tr
                    key={pos.id}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <td className="px-3 py-2 sm:px-4">
                      <p className="text-sm font-semibold text-foreground">
                        {pos.symbol}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {pos.name}
                      </p>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-2 text-muted-foreground sm:table-cell sm:px-4">
                      {pos.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground sm:px-4">
                      {pos.amount.toLocaleString("tr-TR", {
                        maximumFractionDigits: 4,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground sm:px-4">
                      {formatTL(pos.current)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right text-sm font-semibold tabular-nums sm:px-4 ${
                        positive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {positive ? (
                          <ArrowUpRight className="h-3 w-3" aria-hidden />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" aria-hidden />
                        )}
                        {positive ? "+" : ""}
                        {formatTL(pnl)}
                        <span className="text-[10px] font-normal">
                          ({positive ? "+" : ""}
                          {pos.changePct.toFixed(2)}%)
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PreviewCard>
    </div>
  );
}
