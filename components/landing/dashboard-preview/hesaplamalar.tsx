import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  Coins,
  Home,
  Landmark,
  Percent,
  PiggyBank,
  Receipt,
  TrendingUp,
} from "lucide-react";
import {
  PreviewCard,
  PreviewPageHeader,
} from "@/components/landing/dashboard-preview/shared";

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
};

const TOOLS: Tool[] = [
  {
    id: "konut",
    title: "Konut Kredisi",
    description:
      "Tutar, vade ve faiz oranıyla aylık taksit ve toplam ödemeyi hesapla.",
    icon: Home,
    accentClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "ihtiyac",
    title: "İhtiyaç Kredisi",
    description:
      "Bireysel ihtiyaç kredisi planını detaylı taksit tablosuyla incele.",
    icon: Landmark,
    accentClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "tasit",
    title: "Taşıt Kredisi",
    description:
      "Araç fiyatı, peşinat ve vade ile aylık taksit projeksiyonu çıkar.",
    icon: Coins,
    accentClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    id: "mevduat",
    title: "Mevduat / Vadeli",
    description: "Anapara ve vade üzerinden net getiri ile efektif faizi gör.",
    icon: PiggyBank,
    accentClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "kdv",
    title: "KDV Hesaplama",
    description: "KDV dahil/hariç tutarları farklı oranlarla anında dönüştür.",
    icon: Receipt,
    accentClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    id: "birikim",
    title: "Birikim Hedefi",
    description:
      "Hedef tutara ulaşmak için aylık yatırman gereken miktarı bul.",
    icon: TrendingUp,
    accentClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  {
    id: "enflasyon",
    title: "Enflasyon (TÜFE)",
    description: "Geçmiş tutarın bugünkü değerini TÜFE verisiyle hesapla.",
    icon: Percent,
    accentClass: "bg-lime-500/15 text-lime-700 dark:text-lime-300",
  },
  {
    id: "bes",
    title: "Bireysel Emeklilik",
    description:
      "Aylık katkı, vade ve devlet katkısıyla BES projeksiyonunu çıkar.",
    icon: Calculator,
    accentClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
];

export function HesaplamalarPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={Calculator}
        title="Hesaplamalar"
        description="Kredi, mevduat, KDV, birikim ve enflasyon hesaplamalarını tek yerden yap."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <PreviewCard
              key={tool.id}
              className="flex flex-col gap-3 p-4 transition hover:border-emerald-500/50 sm:gap-4 sm:p-5"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${tool.accentClass}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tool.title}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </PreviewCard>
          );
        })}
      </div>
    </div>
  );
}
