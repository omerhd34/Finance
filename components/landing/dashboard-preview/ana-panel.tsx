import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  CalendarClock,
  Coins,
  HandCoins,
  PiggyBank,
  Plus,
  Receipt,
  Scale,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
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
    description: "",
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

type QuickAction = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-transaction",
    label: "Yeni işlem",
    description: "Gelir veya gider kaydet.",
    icon: Plus,
    iconClassName:
      "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
  },
  {
    id: "recurring",
    label: "Tekrarlayan ekle",
    description: "Sabit gelir/gider tanımla.",
    icon: CalendarClock,
    iconClassName:
      "bg-sky-500/15 text-sky-600 ring-sky-500/25 dark:text-sky-300",
  },
  {
    id: "budgets",
    label: "Bütçe ekle",
    description: "Kategori limiti belirle.",
    icon: PiggyBank,
    iconClassName:
      "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  },
  {
    id: "ai-assistant",
    label: "Asistana sor",
    description: "IQfinansAI ile sohbet et.",
    icon: Sparkles,
    iconClassName:
      "bg-violet-500/15 text-violet-600 ring-violet-500/25 dark:text-violet-300",
  },
  {
    id: "fx",
    label: "Kur dönüşüm",
    description: "Hızlı çevirim yap.",
    icon: ArrowRightLeft,
    iconClassName:
      "bg-teal-500/15 text-teal-700 ring-teal-500/25 dark:text-teal-300",
  },
];

type ActionAlert = {
  id: string;
  severity: "danger" | "warning" | "info";
  title: string;
  description: string;
  hrefLabel: string;
};

const ACTION_ALERTS: ActionAlert[] = [
  {
    id: "alert-1",
    severity: "danger",
    title: "3 borç ödemesi 7 gün içinde vadesinde",
    description:
      "Toplam ₺18.450,00 tutarındaki ödemeler bu hafta içinde vadeye geliyor.",
    hrefLabel: "Borçlara git",
  },
  {
    id: "alert-2",
    severity: "warning",
    title: "Market kategorisi bütçesini %92 doldurdu",
    description:
      "Aylık ₺10.000 limitin ₺9.180'i kullanıldı. Ay sonuna 11 gün kaldı.",
    hrefLabel: "Bütçeye git",
  },
];

const SEVERITY_BADGE_CLASS: Record<ActionAlert["severity"], string> = {
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

const SEVERITY_RING_CLASS: Record<ActionAlert["severity"], string> = {
  danger: "ring-rose-500/30",
  warning: "ring-amber-500/30",
  info: "ring-sky-500/30",
};

const SEVERITY_LABEL: Record<ActionAlert["severity"], string> = {
  danger: "Acil",
  warning: "Dikkat",
  info: "Bilgi",
};

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

function QuickActionsCard() {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-card shadow-sm">
      <PreviewSectionHeader
        icon={Zap}
        title="Hızlı eylemler"
        description="Sık kullandığın işlemlere tek tıkla eriş."
      />
      <div className="p-3 sm:p-4">
        <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.id} className="min-w-0">
                <div className="flex h-full items-start gap-2.5 rounded-xl border border-border/60 bg-muted/15 p-2.5 shadow-sm ring-1 ring-black/5 sm:p-3 dark:ring-white/10">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${action.iconClassName}`}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold leading-tight tracking-tight text-foreground sm:text-[13px]">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      {action.description}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ActionAlertsCard() {
  const dangerCount = ACTION_ALERTS.filter(
    (a) => a.severity === "danger",
  ).length;
  const warningCount = ACTION_ALERTS.filter(
    (a) => a.severity === "warning",
  ).length;

  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-card shadow-sm">
      <PreviewSectionHeader
        icon={AlertTriangle}
        title="Aksiyon uyarıları"
        description={`${dangerCount} acil, ${warningCount} dikkat`}
      />
      <div className="p-3 sm:p-4">
        <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {ACTION_ALERTS.map((alert) => (
            <li key={alert.id} className="min-w-0">
              <div
                className={`flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-muted/15 p-3 shadow-sm ring-1 ${SEVERITY_RING_CLASS[alert.severity]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${SEVERITY_BADGE_CLASS[alert.severity]}`}
                  >
                    {SEVERITY_LABEL[alert.severity]}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <p className="text-[12px] font-semibold leading-snug text-foreground sm:text-[13px]">
                  {alert.title}
                </p>
                <p className="text-[10px] leading-relaxed text-muted-foreground sm:text-[11px]">
                  {alert.description}
                </p>
                <span className="mt-auto text-[10px] font-medium text-emerald-600 sm:text-[11px] dark:text-emerald-400">
                  {alert.hrefLabel}
                </span>
              </div>
            </li>
          ))}
        </ul>
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

      <QuickActionsCard />

      <ActionAlertsCard />
    </div>
  );
}
