import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  HelpCircle,
  LayoutDashboard,
  MessageSquareQuote,
  Sparkles,
  Wallet,
} from "lucide-react";

export type LandingHeaderNavItem = {
  label: string;
  shortLabel: string;
  href: string;
  description: string;
  Icon: LucideIcon;
};

export const landingHeaderNavItems: LandingHeaderNavItem[] = [
  {
    label: "Canlı dashboard",
    shortLabel: "Dashboard",
    href: "/#canli-dashboard",
    description: "Finansal panoraman tek ekranda",
    Icon: LayoutDashboard,
  },
  {
    label: "Ana modüllerimiz",
    shortLabel: "Modüller",
    href: "/#ana-moduller",
    description: "Gelir-gider, bütçe, borç ve yatırım araçları",
    Icon: Boxes,
  },
  {
    label: "Neden IQfinansAI",
    shortLabel: "Neden biz",
    href: "/#neden-iqfinansai",
    description: "Bizi öne çıkaran özellikler",
    Icon: Sparkles,
  },
  {
    label: "Plan karşılaştırması",
    shortLabel: "Planlar",
    href: "/#plan-karsilastirmasi",
    description: "Ücretsiz ve Premium farkları",
    Icon: Wallet,
  },
  {
    label: "Kullanıcı hikayeleri",
    shortLabel: "Yorumlar",
    href: "/#kullanici-hikayeleri",
    description: "Gerçek kullanıcı yorumları",
    Icon: MessageSquareQuote,
  },
  {
    label: "SSS",
    shortLabel: "SSS",
    href: "/#sss",
    description: "Sık sorulan sorular",
    Icon: HelpCircle,
  },
];
