import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarRange,
  HandCoins,
  Lightbulb,
  MessageCircle,
  PieChart,
  Sparkles,
} from "lucide-react";

export function sectionIconAndAccent(title: string): {
  Icon: LucideIcon;
  accent: string;
  iconWrap: string;
} {
  const t = title.toLowerCase();
  if (/karşılama|merhaba|giriş/.test(t)) {
    return {
      Icon: MessageCircle,
      accent: "border-l-emerald-500/70",
      iconWrap: "bg-emerald-500/15 text-emerald-400",
    };
  }
  if (/genel\s+değerlendirme|özet/.test(t)) {
    return {
      Icon: BarChart3,
      accent: "border-l-sky-500/70",
      iconWrap: "bg-sky-500/15 text-sky-400",
    };
  }
  if (/harcama|kategori/.test(t)) {
    return {
      Icon: PieChart,
      accent: "border-l-violet-500/70",
      iconWrap: "bg-violet-500/15 text-violet-400",
    };
  }
  if (/tasarruf|öneri/.test(t)) {
    return {
      Icon: Lightbulb,
      accent: "border-l-amber-500/70",
      iconWrap: "bg-amber-500/15 text-amber-400",
    };
  }
  if (/bütçe|gelecek\s+ay/.test(t)) {
    return {
      Icon: CalendarRange,
      accent: "border-l-cyan-500/70",
      iconWrap: "bg-cyan-500/15 text-cyan-400",
    };
  }
  if (/borç|alacak/.test(t)) {
    return {
      Icon: HandCoins,
      accent: "border-l-rose-500/70",
      iconWrap: "bg-rose-500/15 text-rose-400",
    };
  }
  return {
    Icon: Sparkles,
    accent: "border-l-primary/70",
    iconWrap: "bg-primary/15 text-primary",
  };
}
