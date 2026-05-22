import { CalendarClock, Plus, RefreshCw } from "lucide-react";
import {
  PreviewBadge,
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
  formatTL,
} from "@/components/landing/dashboard-preview/shared";

type Recurring = {
  id: string;
  name: string;
  category: string;
  frequency: string;
  nextDate: string;
  amount: number;
  status: "yaklasan" | "odendi" | "gecikti";
};

const RECURRING_ITEMS: Recurring[] = [
  {
    id: "r1",
    name: "Kira Ödemesi",
    category: "Konut",
    frequency: "Aylık",
    nextDate: "1 Haziran",
    amount: 12_500,
    status: "yaklasan",
  },
  {
    id: "r2",
    name: "Tabii",
    category: "Abonelik",
    frequency: "Aylık",
    nextDate: "5 Haziran",
    amount: 99.99,
    status: "yaklasan",
  },
  {
    id: "r3",
    name: "Spor Salonu",
    category: "Sağlık",
    frequency: "Aylık",
    nextDate: "8 Haziran",
    amount: 850,
    status: "yaklasan",
  },
  {
    id: "r4",
    name: "Türk Telekon İnternet",
    category: "Fatura",
    frequency: "Aylık",
    nextDate: "12 Mayıs",
    amount: 419,
    status: "odendi",
  },
  {
    id: "r5",
    name: "Kredi Taksiti",
    category: "Borç",
    frequency: "Aylık",
    nextDate: "10 Mayıs",
    amount: 3_850,
    status: "gecikti",
  },
];

const STATUS_LABEL: Record<Recurring["status"], string> = {
  yaklasan: "Yaklaşan",
  odendi: "Ödendi",
  gecikti: "Gecikti",
};

const STATUS_TONE: Record<Recurring["status"], "info" | "success" | "danger"> =
  {
    yaklasan: "info",
    odendi: "success",
    gecikti: "danger",
  };

export function TekrarlayanPreview() {
  const monthlyTotal = RECURRING_ITEMS.reduce((acc, it) => acc + it.amount, 0);

  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={CalendarClock}
        title="Tekrarlayan Ödemeler"
        description="Aylık aboneliklerini ve faturalarını planla, vade gelmeden hatırlat."
        badge={
          <PreviewDisabledButton>
            <Plus className="h-3 w-3" aria-hidden />
            Yeni Tekrarlayan
          </PreviewDisabledButton>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Aylık Toplam
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-foreground sm:text-lg">
            {formatTL(monthlyTotal)}
          </p>
        </PreviewCard>
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Bu Ay Yaklaşan
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-sky-600 sm:text-lg dark:text-sky-400">
            3 ödeme
          </p>
        </PreviewCard>
        <PreviewCard className="p-3 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Geciken
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-rose-600 sm:text-lg dark:text-rose-400">
            1 ödeme
          </p>
        </PreviewCard>
      </div>

      <PreviewCard>
        <ul className="divide-y divide-border/40">
          {RECURRING_ITEMS.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
                <RefreshCw className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {item.category} · {item.frequency} · {item.nextDate}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PreviewBadge tone={STATUS_TONE[item.status]}>
                  {STATUS_LABEL[item.status]}
                </PreviewBadge>
                <span className="text-sm font-semibold tabular-nums text-foreground sm:text-base">
                  {formatTL(item.amount)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </PreviewCard>
    </div>
  );
}
