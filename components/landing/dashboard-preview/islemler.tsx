import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import {
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
  formatTL,
} from "@/components/landing/dashboard-preview/shared";

type Tx = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
};

const TRANSACTIONS: Tx[] = [
  {
    id: "tx1",
    date: "15 May 2026",
    description: "Maaş ödemesi",
    category: "Gelir",
    type: "income",
    amount: 38_500,
  },
  {
    id: "tx2",
    date: "14 May 2026",
    description: "Çağrı - Haftalık alışveriş",
    category: "Market",
    type: "expense",
    amount: 2_345.6,
  },
  {
    id: "tx3",
    date: "13 May 2026",
    description: "Freelance proje",
    category: "Yan Gelir",
    type: "income",
    amount: 9_750,
  },
  {
    id: "tx4",
    date: "12 May 2026",
    description: "Fizy",
    category: "Abonelik",
    type: "expense",
    amount: 79.99,
  },
  {
    id: "tx5",
    date: "12 May 2026",
    description: "Akaryakıt - Türkiye Petrolleri",
    category: "Ulaşım",
    type: "expense",
    amount: 1_240,
  },
  {
    id: "tx6",
    date: "11 May 2026",
    description: "Restoran - Akşam yemeği",
    category: "Yemek",
    type: "expense",
    amount: 685.5,
  },
  {
    id: "tx7",
    date: "10 May 2026",
    description: "Elektrik faturası",
    category: "Fatura",
    type: "expense",
    amount: 487.3,
  },
];

export function IslemlerPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={Wallet}
        title="İşlemler"
        description="Tüm gelir ve giderlerini tek yerden yönet, kategoriye göre filtrele."
        badge={
          <PreviewDisabledButton>
            <Plus className="h-3 w-3" aria-hidden />
            Yeni İşlem
          </PreviewDisabledButton>
        }
      />

      <PreviewCard className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" aria-hidden />
            <span>İşlemlerde ara…</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground">
            <SlidersHorizontal className="h-3 w-3" aria-hidden />
            Filtreler
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground">
            Son 30 gün
          </span>
        </div>
      </PreviewCard>

      <PreviewCard>
        <div className="overflow-hidden">
          <table className="w-full min-w-0 text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                <th className="px-3 py-2 sm:px-4">Tarih</th>
                <th className="px-3 py-2 sm:px-4">Açıklama</th>
                <th className="hidden px-3 py-2 sm:table-cell sm:px-4">
                  Kategori
                </th>
                <th className="px-3 py-2 text-right sm:px-4">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground sm:px-4">
                    {tx.date}
                  </td>
                  <td className="px-3 py-2 text-foreground sm:px-4">
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          tx.type === "income"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <ArrowDownLeft className="h-3 w-3" aria-hidden />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" aria-hidden />
                        )}
                      </span>
                      <span className="truncate">{tx.description}</span>
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-muted-foreground sm:table-cell sm:px-4">
                    {tx.category}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums sm:px-4 ${
                      tx.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "−"}
                    {formatTL(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PreviewCard>
    </div>
  );
}
