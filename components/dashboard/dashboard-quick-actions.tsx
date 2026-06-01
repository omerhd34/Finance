import Link from "next/link";
import {
  ArrowRightLeft,
  CalendarClock,
  PiggyBank,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { cn } from "@/lib/common/utils";

type QuickAction = {
  key: string;
  href?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "new-transaction",
    href: "/islemler?new=1",
    label: "Yeni işlem",
    description: "Gelir veya gider kaydet.",
    icon: Plus,
    iconClass:
      "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
  },
  {
    key: "recurring",
    href: "/tekrarlayanlar",
    label: "Tekrarlayan ekle",
    description: "Sabit gelir/gider tanımla.",
    icon: CalendarClock,
    iconClass: "bg-sky-500/15 text-sky-600 ring-sky-500/25 dark:text-sky-300",
  },
  {
    key: "budgets",
    href: "/butceler",
    label: "Bütçe ekle",
    description: "Kategori limiti belirle.",
    icon: PiggyBank,
    iconClass:
      "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  },
  {
    key: "ai-assistant",
    href: "/yapay-zeka-asistani",
    label: "Asistana sor",
    description: "IQfinansAI ile sohbet et.",
    icon: Sparkles,
    iconClass:
      "bg-violet-500/15 text-violet-600 ring-violet-500/25 dark:text-violet-300",
  },
  {
    key: "fx",
    href: "/kur-donusum",
    label: "Kur dönüşüm",
    description: "Hızlı çevirim yap.",
    icon: ArrowRightLeft,
    iconClass:
      "bg-teal-500/15 text-teal-700 ring-teal-500/25 dark:text-teal-300",
  },
];

const ITEM_CLASS_NAME = cn(
  "group flex h-full w-full items-start gap-3 rounded-xl border border-border/60 bg-muted/15 p-3 text-left shadow-sm",
  "ring-1 ring-black/4 transition-colors hover:bg-muted/40 hover:border-border dark:ring-white/6",
);

type Props = {
  onNewTransaction?: () => void;
  onAddRecurring?: () => void;
  onAddBudget?: () => void;
};

export function DashboardQuickActions({
  onNewTransaction,
  onAddRecurring,
  onAddBudget,
}: Props = {}) {
  return (
    <Card className="overflow-hidden">
      <DashboardSectionHeader
        icon={Zap}
        title="Hızlı eylemler"
        description="Sık kullandığınız işlemlere tek tıkla erişin."
      />
      <div className="p-4 sm:p-6">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const handler =
              action.key === "new-transaction"
                ? onNewTransaction
                : action.key === "recurring"
                  ? onAddRecurring
                  : action.key === "budgets"
                    ? onAddBudget
                    : undefined;
            const useHandler = Boolean(handler);
            const content = (
              <>
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
                    action.iconClass,
                  )}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </>
            );
            return (
              <li key={action.key} className="min-w-0">
                {useHandler ? (
                  <button
                    type="button"
                    onClick={handler}
                    className={cn(ITEM_CLASS_NAME, "cursor-pointer")}
                  >
                    {content}
                  </button>
                ) : (
                  <Link href={action.href ?? "#"} className={ITEM_CLASS_NAME}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
