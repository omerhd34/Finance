import { ArrowRightLeft, RefreshCcw } from "lucide-react";
import {
  PreviewBadge,
  PreviewCard,
  PreviewPageHeader,
} from "@/components/landing/dashboard-preview/shared";

type Rate = {
  code: string;
  name: string;
  rate: number;
  changePct: number;
};

const RATES: Rate[] = [
  { code: "USD", name: "ABD Doları", rate: 32.4583, changePct: 0.42 },
  { code: "EUR", name: "Euro", rate: 35.1218, changePct: -0.18 },
  { code: "GBP", name: "İngiliz Sterlini", rate: 41.0726, changePct: 0.65 },
  { code: "XAU", name: "Gram Altın", rate: 2_457.6, changePct: 1.32 },
];

export function KurDonusumPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={ArrowRightLeft}
        title="Kur Dönüşüm"
        description="Güncel kurlar ile farklı para birimleri arasında anlık çevirim yap."
        badge={
          <PreviewBadge tone="info">
            <RefreshCcw className="h-3 w-3" aria-hidden />
            Anlık kurlar · 15:42
          </PreviewBadge>
        }
      />

      <PreviewCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Çevrilen
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
                1.000,00
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                TRY
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Türk Lirası
            </p>
          </div>
          <div className="grid place-items-center md:px-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
              <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Karşılığı
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-emerald-600 sm:text-3xl dark:text-emerald-400">
                30,808
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                USD
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              1 USD = 32,4583 TRY
            </p>
          </div>
        </div>
      </PreviewCard>

      <PreviewCard>
        <div className="border-b border-border/60 px-3 py-3 sm:px-4">
          <p className="text-sm font-semibold text-foreground">Güncel Kurlar</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            TCMB referans alış kuru — Bugün
          </p>
        </div>
        <ul className="divide-y divide-border/40">
          {RATES.map((r) => {
            const positive = r.changePct >= 0;
            return (
              <li
                key={r.code}
                className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                  {r.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {r.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    1 {r.code} ={" "}
                    {r.rate.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{" "}
                    TRY
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold tabular-nums ${
                    positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {positive ? "+" : ""}
                  {r.changePct.toFixed(2)}%
                </span>
              </li>
            );
          })}
        </ul>
      </PreviewCard>
    </div>
  );
}
