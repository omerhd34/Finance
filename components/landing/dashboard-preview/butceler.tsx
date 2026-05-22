import { PieChart, Plus } from "lucide-react";
import {
  PreviewBadge,
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
  PreviewProgressBar,
  formatTL,
} from "@/components/landing/dashboard-preview/shared";

type Budget = {
  id: string;
  category: string;
  spent: number;
  limit: number;
};

const BUDGETS: Budget[] = [
  { id: "b1", category: "Market", spent: 9_100, limit: 10_000 },
  { id: "b2", category: "Yemek", spent: 3_300, limit: 4_000 },
  { id: "b3", category: "Ulaşım", spent: 1_650, limit: 1_500 },
  { id: "b4", category: "Fatura", spent: 1_400, limit: 2_000 },
  { id: "b5", category: "Eğlence", spent: 1_100, limit: 1_200 },
  { id: "b8", category: "Abonelik", spent: 580, limit: 700 },
];

function ratio(spent: number, limit: number) {
  return (spent / limit) * 100;
}

function tone(ratio: number): "success" | "warning" | "danger" {
  if (ratio >= 100) return "danger";
  if (ratio >= 80) return "warning";
  return "success";
}

export function ButcelerPreview() {
  const totalSpent = BUDGETS.reduce((acc, b) => acc + b.spent, 0);
  const totalLimit = BUDGETS.reduce((acc, b) => acc + b.limit, 0);
  const overall = ratio(totalSpent, totalLimit);

  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={PieChart}
        title="Bütçeler"
        description="Kategori başına aylık limit belirle, harcama sınırını aşmadan ilerle."
        badge={
          <PreviewDisabledButton>
            <Plus className="h-3 w-3" aria-hidden />
            Yeni Bütçe
          </PreviewDisabledButton>
        }
      />

      <PreviewCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Genel Aylık Bütçe
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            <span className="text-foreground font-semibold tabular-nums">
              {formatTL(totalSpent)}
            </span>{" "}
            / {formatTL(totalLimit)}
          </p>
        </div>
        <div className="mt-3">
          <PreviewProgressBar value={overall} tone={tone(overall)} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Toplam bütçenin{" "}
          <strong className="text-foreground">%{overall.toFixed(0)}</strong> ı
          kullanıldı, kalan ay sonuna kadar dengeli ilerle.
        </p>
      </PreviewCard>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
        {BUDGETS.map((b) => {
          const pct = ratio(b.spent, b.limit);
          const t = tone(pct);
          return (
            <PreviewCard key={b.id} className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {b.category}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatTL(b.spent)} / {formatTL(b.limit)}
                  </p>
                </div>
                <PreviewBadge tone={t}>%{pct.toFixed(0)}</PreviewBadge>
              </div>
              <div className="mt-3">
                <PreviewProgressBar value={pct} tone={t} />
              </div>
            </PreviewCard>
          );
        })}
      </div>
    </div>
  );
}
