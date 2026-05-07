import {
  ArrowRightLeft,
  Bell,
  CalendarClock,
  HandCoins,
  LayoutDashboard,
  PieChart,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";

export const SIDEBAR_COLLAPSED_KEY = "iqfinansai-sidebar-collapsed";

export const DASHBOARD_PAGE_PAD_X = "px-4 md:px-6";
export const DASHBOARD_PAGE_PAD_Y = "py-4 md:py-6";

export type ProfilePatchResponse = {
  name: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  monthStartDay: number;
  email: string;
  phone: string | null;
  currency: string;
  image: string | null;
  notificationsEnabled: boolean;
  planTier: string;
};

export function profileInitials(
  name: string | null | undefined,
  email: string,
): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export const dashboardNav = [
  { href: "/gosterge-paneli", label: "Ana Panel", icon: LayoutDashboard },
  { href: "/islemler", label: "İşlemler", icon: Wallet },
  { href: "/tekrarlayanlar", label: "Tekrarlayan", icon: CalendarClock },
  { href: "/butceler", label: "Bütçeler", icon: PieChart },
  { href: "/borc-ve-alacak", label: "Borç ve Alacak", icon: HandCoins },
  { href: "/kur-donusum", label: "Kur Dönüşüm", icon: ArrowRightLeft },
  { href: "/yatirimlar", label: "Yatırım", icon: TrendingUp },
  { href: "/yapay-zeka-analizi", label: "IQfinansAI Analiz", icon: Sparkles },
  {
    href: "/yapay-zeka-asistani",
    label: "IQfinansAI Asistanı",
    icon: IQfinansAiAssistantIcon,
  },
  { href: "/bildirimler", label: "Bildirimler", icon: Bell },
] as const;

export const premiumNavHrefs = new Set([
  "/yatirimlar",
  "/yapay-zeka-analizi",
  "/yapay-zeka-asistani",
]);
