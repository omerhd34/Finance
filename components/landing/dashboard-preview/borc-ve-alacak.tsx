import { ArrowDownLeft, ArrowUpRight, HandCoins, Plus } from "lucide-react";
import {
  PreviewBadge,
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
  PreviewProgressBar,
  formatTL,
} from "@/components/landing/dashboard-preview/shared";

type Item = {
  id: string;
  party: string;
  description: string;
  total: number;
  paid: number;
  dueDate: string;
};

const RECEIVABLES: Item[] = [
  {
    id: "rcv1",
    party: "Ahmet K.",
    description: "Kişisel borç",
    total: 250_000,
    paid: 100_000,
    dueDate: "30 Haziran 2026",
  },
  {
    id: "rcv2",
    party: "Mehmet Y.",
    description: "Araç satışı bakiyesi",
    total: 180_000,
    paid: 30_000,
    dueDate: "15 Temmuz 2026",
  },
];

const PAYABLES: Item[] = [
  {
    id: "pay1",
    party: "Banka Kredisi",
    description: "İhtiyaç kredisi",
    total: 120_000,
    paid: 92_000,
    dueDate: "10 Eylül 2027",
  },
  {
    id: "pay2",
    party: "Kardeş",
    description: "Aile içi destek",
    total: 35_000,
    paid: 15_000,
    dueDate: "1 Ekim 2026",
  },
];

const RECEIVABLES_REMAINING = RECEIVABLES.reduce(
  (acc, i) => acc + (i.total - i.paid),
  0,
);
const PAYABLES_REMAINING = PAYABLES.reduce(
  (acc, i) => acc + (i.total - i.paid),
  0,
);

function ItemRow({
  item,
  variant,
}: {
  item: Item;
  variant: "receivable" | "payable";
}) {
  const remaining = item.total - item.paid;
  const pct = (item.paid / item.total) * 100;
  const isReceivable = variant === "receivable";

  return (
    <li className="space-y-2 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              isReceivable
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isReceivable ? (
              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {item.party}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {item.description} · Vade: {item.dueDate}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${
            isReceivable
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {formatTL(remaining)}
        </span>
      </div>
      <PreviewProgressBar
        value={pct}
        tone={isReceivable ? "success" : "warning"}
      />
      <p className="text-[10px] text-muted-foreground">
        Ödenen {formatTL(item.paid)} / Toplam {formatTL(item.total)} · %
        {pct.toFixed(0)}
      </p>
    </li>
  );
}

export function BorcVeAlacakPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={HandCoins}
        title="Borç ve Alacak"
        description="Kime ne borcun, kimden ne alacağın var; vade ve ödeme planlarını tek listede gör."
        badge={
          <PreviewDisabledButton>
            <Plus className="h-3 w-3" aria-hidden />
            Yeni Kayıt
          </PreviewDisabledButton>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Net Bakiye
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-emerald-600 sm:text-lg dark:text-emerald-400">
            +{formatTL(RECEIVABLES_REMAINING - PAYABLES_REMAINING)}
          </p>
        </PreviewCard>
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Toplam Alacak
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-emerald-600 sm:text-lg dark:text-emerald-400">
            {formatTL(RECEIVABLES_REMAINING)}
          </p>
        </PreviewCard>
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Toplam Borç
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-amber-600 sm:text-lg dark:text-amber-400">
            {formatTL(PAYABLES_REMAINING)}
          </p>
        </PreviewCard>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <PreviewCard>
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-3 sm:px-4">
            <p className="text-sm font-semibold text-foreground">Alacaklar</p>
            <PreviewBadge tone="success">
              {RECEIVABLES.length} aktif
            </PreviewBadge>
          </div>
          <ul className="divide-y divide-border/40">
            {RECEIVABLES.map((item) => (
              <ItemRow key={item.id} item={item} variant="receivable" />
            ))}
          </ul>
        </PreviewCard>

        <PreviewCard>
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-3 sm:px-4">
            <p className="text-sm font-semibold text-foreground">Borçlar</p>
            <PreviewBadge tone="warning">{PAYABLES.length} aktif</PreviewBadge>
          </div>
          <ul className="divide-y divide-border/40">
            {PAYABLES.map((item) => (
              <ItemRow key={item.id} item={item} variant="payable" />
            ))}
          </ul>
        </PreviewCard>
      </div>
    </div>
  );
}
