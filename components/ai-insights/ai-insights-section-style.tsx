import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  Flag,
  HandCoins,
  Lightbulb,
  ListChecks,
  MessageCircle,
  PieChart,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const ACCENT_VARIANTS = [
  {
    key: "emerald",
    accent: "border-l-emerald-500/70",
    iconWrap: "bg-emerald-500/15 text-emerald-400",
    proseMarkers:
      "[&_ul>li]:before:bg-emerald-500/80 [&_ol]:marker:text-emerald-500/90",
  },
  {
    key: "sky",
    accent: "border-l-sky-500/70",
    iconWrap: "bg-sky-500/15 text-sky-400",
    proseMarkers:
      "[&_ul>li]:before:bg-sky-500/80 [&_ol]:marker:text-sky-500/90",
  },
  {
    key: "violet",
    accent: "border-l-violet-500/70",
    iconWrap: "bg-violet-500/15 text-violet-400",
    proseMarkers:
      "[&_ul>li]:before:bg-violet-500/80 [&_ol]:marker:text-violet-500/90",
  },
  {
    key: "amber",
    accent: "border-l-amber-500/70",
    iconWrap: "bg-amber-500/15 text-amber-400",
    proseMarkers:
      "[&_ul>li]:before:bg-amber-500/80 [&_ol]:marker:text-amber-500/90",
  },
  {
    key: "cyan",
    accent: "border-l-cyan-500/70",
    iconWrap: "bg-cyan-500/15 text-cyan-400",
    proseMarkers:
      "[&_ul>li]:before:bg-cyan-500/80 [&_ol]:marker:text-cyan-500/90",
  },
  {
    key: "rose",
    accent: "border-l-rose-500/70",
    iconWrap: "bg-rose-500/15 text-rose-400",
    proseMarkers:
      "[&_ul>li]:before:bg-rose-500/80 [&_ol]:marker:text-rose-500/90",
  },
  {
    key: "orange",
    accent: "border-l-orange-500/70",
    iconWrap: "bg-orange-500/15 text-orange-400",
    proseMarkers:
      "[&_ul>li]:before:bg-orange-500/80 [&_ol]:marker:text-orange-500/90",
  },
  {
    key: "fuchsia",
    accent: "border-l-fuchsia-500/70",
    iconWrap: "bg-fuchsia-500/15 text-fuchsia-400",
    proseMarkers:
      "[&_ul>li]:before:bg-fuchsia-500/80 [&_ol]:marker:text-fuchsia-500/90",
  },
] as const;

export type AiInsightAccentVariant = (typeof ACCENT_VARIANTS)[number];

export function accentVariantAt(
  index: number,
  previousKey: string | null,
): AiInsightAccentVariant {
  const n = ACCENT_VARIANTS.length;
  for (let bump = 0; bump < n; bump++) {
    const v = ACCENT_VARIANTS[(index + bump) % n];
    if (previousKey == null || v.key !== previousKey) return v;
  }
  return ACCENT_VARIANTS[index % n];
}

export function sectionIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (/karşılama|merhaba|giriş/.test(t)) return MessageCircle;
  if (/kısa\s+özet|sonraki\s+adım/.test(t)) return Flag;
  if (/genel\s+değerlendirme/.test(t)) return BarChart3;
  if (/en\s+yüksek|üç\s+harcama|3\s+harcama|harcama\s+kategorisi/.test(t))
    return PieChart;
  if (/harcama\s+kalıpları|işlem\s+notları/.test(t)) return TrendingUp;
  if (/tasarruf|öneri/.test(t)) return Lightbulb;
  if (/bütçe|gelecek\s+ay/.test(t)) return CalendarRange;
  if (/borç|alacak/.test(t)) return HandCoins;
  if (/risk|dikkat\s+edilmesi|uyarı/.test(t)) return AlertTriangle;
  if (/öncelikli\s+aksiyon|aksiyon|eylem\s+listesi/.test(t)) return ListChecks;
  if (/harcama|kategori/.test(t)) return PieChart;
  return Sparkles;
}
