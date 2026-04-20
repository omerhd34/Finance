import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Bot,
  Globe,
  HandCoins,
  ReceiptText,
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
    title: "Gelir-Gider Yönetimi",
    description:
      "Tüm finans hareketlerinizi tek panelden kaydedin ve düzenleyin.",
    icon: BarChart3,
  },
  {
    title: "Akıllı Finans Asistanı",
    description:
      "Harcamalarınızı yorumlayın, kişisel önerilerle daha iyi kararlar alın.",
    icon: Bot,
  },
  {
    title: "Tasarruf Hedefleri",
    description: "Kendinize hedef koyun, ilerlemenizi adım adım takip edin.",
    icon: Target,
  },
  {
    title: "Borç ve Alacak Takibi",
    description:
      "Alacak ve borç kayıtlarınızı yönetin, ödeme süreçlerini aksatmadan izleyin.",
    icon: HandCoins,
  },
  {
    title: "Görsel Finans Raporları",
    description:
      "Aylık trendleri ve kategori dağılımını anlaşılır grafiklerle inceleyin.",
    icon: PieChart,
  },
  {
    title: "Hazır Kategori Yapısı",
    description:
      "Gelir ve giderlerinizi pratik kategori yapısıyla kolayca sınıflandırın.",
    icon: Shield,
  },
  {
    title: "Çoklu Para Birimi Desteği",
    description:
      "TL, USD, EUR ve GBP ile işlem yapın, tercihinizi ayarlardan belirleyin.",
    icon: Globe,
  },
  {
    title: "Akıllı Ödeme Hatırlatmaları",
    description:
      "Yaklaşan ödemeleri kaçırmayın; zamanında aksiyon almak için bildirim alın.",
    icon: BellRing,
  },
  {
    title: "Detaylı İşlem Geçmişi",
    description:
      "Tüm finans kayıtlarını tek ekranda filtreleyin ve geçmiş işlemleri hızlıca bulun.",
    icon: ReceiptText,
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
    ctaHref: "/kayit",
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
    ctaHref: "/kayit",
    highlighted: true,
    ctaVariant: "primary",
  },
];

export function getLandingPremiumPriceTry(): number {
  const p = LANDING_PLANS.find((x) => x.id === "premium");
  return p?.priceAmountTry ?? 120;
}
