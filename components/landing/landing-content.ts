import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  Globe,
  HandCoins,
  PieChart,
  Shield,
  Target,
} from "lucide-react";

export type LandingFeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const LANDING_FEATURES: LandingFeatureItem[] = [
  {
    title: "Gelir ve Gider Takibi",
    description: "Tüm hareketlerinizi tek yerden kaydedin ve raporlayın.",
    icon: BarChart3,
  },
  {
    title: "AI analiz",
    description: "Yapay zekâ ile son 30 gününüzü yorumlayın ve öneriler alın.",
    icon: Bot,
  },
  {
    title: "Hedef belirleme",
    description: "Tasarruf hedeflerinizi takip edin, ilerlemenizi görün.",
    icon: Target,
  },
  {
    title: "Borç ve Alacak",
    description:
      "Size borçlu olanları ve sizin borçlarınızı kaydedin, ödemeleri takip edin.",
    icon: HandCoins,
  },
  {
    title: "Grafikler",
    description:
      "Aylık trend ve kategori dağılımını Recharts ile görselleştirin.",
    icon: PieChart,
  },
  {
    title: "Çoklu kategori",
    description: "Harcama ve gelir için hazır kategori setleri.",
    icon: Shield,
  },
  {
    title: "Çoklu para birimi",
    description: "TL, USD, EUR ve GBP desteği; ayarlardan seçin.",
    icon: Globe,
  },
];

export type LandingPlan = {
  id: string;
  title: string;
  subtitle: string;
  priceAmountTry: number;
  priceSuffix?: string;
  priceNote?: string;
  perks: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  ctaVariant: "primary" | "muted";
};

export const LANDING_PLANS: LandingPlan[] = [
  {
    id: "free",
    title: "Ücretsiz",
    subtitle: "Panelden bütçeye kadar geniş özellik seti",
    priceAmountTry: 0,
    priceSuffix: "/ay",
    perks: [
      "Ana panel, işlemler ve tekrarlayan ödemeler",
      "Hedefler, bütçeler ve kategori grafikleri",
      "Borç ve alacak takibi",
      "Çoklu para birimi",
    ],
    ctaLabel: "Başla",
    ctaHref: "/register",
    ctaVariant: "muted",
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "Premium'a geçince yapay zekâ destekli derin analiz",
    priceAmountTry: 125,
    priceSuffix: "/ay",
    perks: [
      "Ücretsiz plandaki her şey",
      "Yapay zekâ ile kişiselleştirilmiş harcama ve gelir analizi",
      "Aylık finans sağlığı skoru ve gelişim önerileri",
      "Kategori bazlı otomatik bütçe önerileri",
      "Haftalık performans özeti ve trend uyarıları",
      "Öncelikli yeni özellikler",
    ],
    ctaLabel: "Listeye katıl",
    ctaHref: "/register",
    highlighted: true,
    ctaVariant: "primary",
  },
];

export function getLandingPremiumPriceTry(): number {
  const p = LANDING_PLANS.find((x) => x.id === "premium");
  return p?.priceAmountTry ?? 120;
}
