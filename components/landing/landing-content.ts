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
    title: "Borç & Alacak",
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
  priceMain: string;
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
    subtitle: "Temel takip ve raporlama",
    priceMain: "₺0",
    priceSuffix: "/ay",
    perks: [
      "Sınırsız işlem kaydı",
      "Grafikler ve hedefler",
      "Çoklu para birimi",
    ],
    ctaLabel: "Başla",
    ctaHref: "/register",
    ctaVariant: "muted",
  },
  {
    id: "pro",
    title: "Pro",
    subtitle: "AI destekli derin analiz",
    priceMain: "Yakında",
    priceNote: "özel fiyat",
    perks: [
      "Ücretsiz plandaki her şey",
      "Yapay zekâ ile kişiselleştirilmiş AI analizi",
      "Öncelikli yeni özellikler",
    ],
    ctaLabel: "Listeye katıl",
    ctaHref: "/register",
    highlighted: true,
    ctaVariant: "primary",
  },
];
