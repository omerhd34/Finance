import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Filter,
  HandCoins,
  PiggyBank,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  PreviewBadge,
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
} from "@/components/landing/dashboard-preview/shared";

type Notification = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
  tone: "info" | "success" | "warning" | "danger";
};

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: AlertTriangle,
    title: "Bütçe limitin aşıldı",
    description:
      "Ulaşım kategorisinde aylık limitin %110'una ulaştın (₺1.650 / ₺1.500).",
    time: "2 saat önce",
    unread: true,
    tone: "warning",
  },
  {
    id: "n2",
    icon: HandCoins,
    title: "Tekrarlayan ödeme yaklaşıyor",
    description: "Kira ödemen 9 gün sonra: ₺12.500. Bakiyen yeterli.",
    time: "Bu sabah",
    unread: true,
    tone: "info",
  },
  {
    id: "n3",
    icon: Sparkles,
    title: "Aylık AI analiz raporu hazır",
    description: "Mayıs 2026 raporunda 3 yeni optimizasyon önerisi var.",
    time: "Dün",
    unread: true,
    tone: "info",
  },
  {
    id: "n4",
    icon: PiggyBank,
    title: "Tasarruf hedefi yaklaşıyor",
    description: "Tatil birikim hedefinin %82'sine ulaştın. ₺3.600 kaldı.",
    time: "2 gün önce",
    tone: "success",
  },
  {
    id: "n5",
    icon: TrendingUp,
    title: "Yatırım fırsatı",
    description:
      "Portföyünde net %18,9 artış. THYAO en yüksek katkı sağlayan kalem.",
    time: "3 gün önce",
    tone: "success",
  },
  {
    id: "n6",
    icon: AlertTriangle,
    title: "Borç ödemesi geciken",
    description: "Kredi taksitin (₺3.850) için 4 gündür ödeme yapılmadı.",
    time: "4 gün önce",
    tone: "danger",
  },
];

export function BildirimlerPreview() {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={Bell}
        title="Bildirimler"
        description="Bütçe uyarıları, vade hatırlatmaları ve AI önerileri tek akışta."
        badge={
          <PreviewDisabledButton>
            <CheckCheck className="h-3 w-3" aria-hidden />
            Tümünü okundu işaretle
          </PreviewDisabledButton>
        }
      />

      <PreviewCard className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" aria-hidden />
          <span>Tümü</span>
          <span>·</span>
          <span>Okunmamış</span>
          <span>·</span>
          <span>Bütçe</span>
          <span>·</span>
          <span>Tekrarlayan</span>
        </div>
        <PreviewBadge tone="danger">{unreadCount} okunmamış</PreviewBadge>
      </PreviewCard>

      <PreviewCard>
        <ul className="divide-y divide-border/40">
          {NOTIFICATIONS.map((n) => {
            const Icon = n.icon;
            const toneClass =
              n.tone === "success"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : n.tone === "warning"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : n.tone === "danger"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-sky-500/15 text-sky-600 dark:text-sky-400";

            return (
              <li
                key={n.id}
                className={`flex items-start gap-3 p-3 sm:gap-4 sm:p-4 ${
                  n.unread ? "bg-muted/20" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {n.title}
                      {n.unread ? (
                        <span
                          className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                          aria-hidden
                        />
                      ) : null}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {n.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                    {n.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </PreviewCard>
    </div>
  );
}
