import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Bot,
  FileDown,
  Globe,
  HandCoins,
  ReceiptText,
  PieChart,
  ScanLine,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";

export type LandingFeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  premium?: boolean;
};

export const LANDING_FEATURES: LandingFeatureItem[] = [
  {
    title: "Gelir-gider yönetimi",
    description:
      "Gelir ve giderleri tarih ve kategoriye göre kaydedin; tekrarlayan ödemeleri tek akıştan yönetin.",
    icon: BarChart3,
  },
  {
    title: "Tasarruf hedefleri",
    description:
      "Birikim hedefi oluşturun, hedefe kalan tutarı ve ilerlemeyi net biçimde takip edin.",
    icon: Target,
  },
  {
    title: "Borç ve alacak takibi",
    description:
      "Borç ve alacak kalemlerini kaydedin; ödemelerle kalan bakiyeyi güncel tutun.",
    icon: HandCoins,
  },
  {
    title: "Görsel finans raporları",
    description:
      "Seçtiğiniz döneme göre gelir–gider dengesini çubuk ve pasta grafiklerle inceleyin.",
    icon: PieChart,
  },
  {
    title: "Hazır kategori yapısı",
    description:
      "Geniş gelir ve gider ağacıyla işlemleri hızlıca doğru alt kategoriye atayın.",
    icon: Shield,
  },
  {
    title: "Çoklu para birimi",
    description:
      "TL, USD, EUR ve GBP ile işlem girin; varsayılan para birimini ayarlardan seçin.",
    icon: Globe,
  },
  {
    title: "Ödeme hatırlatmaları",
    description:
      "Tekrarlayan ödemeler ve yaklaşan vadeler için uygulama içi bildirim alın.",
    icon: BellRing,
  },
  {
    title: "Detaylı işlem geçmişi",
    description:
      "Tüm kayıtları tek ekranda arayın; tarih, tür ve kategoriye göre daraltın.",
    icon: ReceiptText,
  },
  {
    title: "Yapay zekâ analiz raporu",
    description:
      "Kayıtlı verilerinizden tam metin analiz; kategori yorumları, trendler ve tasarruf önerileri.",
    icon: Bot,
    premium: true,
  },
  {
    title: "Fiş ve fatura OCR",
    description:
      "Görsel yükleyerek tutar, tarih ve kategori alanlarını otomatik doldurun; yeni işlem akışını hızlandırın.",
    icon: ScanLine,
    premium: true,
  },
  {
    title: "Yatırım portföyü",
    description:
      "Hisse, altın, döviz, kripto ve emtia pozisyonları; canlı kotasyonlarla değer ve kar/zarar özeti. Kayıtlar manueldir.",
    icon: TrendingUp,
    premium: true,
  },
  {
    title: "AI raporu PDF indirme",
    description:
      "Oluşturulan yapay zekâ analiz raporunu tek tıkla PDF olarak cihazınıza kaydedin; arşiv ve paylaşım için hazır.",
    icon: FileDown,
    premium: true,
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
      "Gelir-gider paneli, işlem kaydı ve tekrarlayan ödemeler",
      "Hedef oluşturma, bütçe planlama ve kategori grafikleri",
      "Borç ve alacak takibi",
      "Çoklu para birimi desteği",
      "Anlık kur dönüşümü",
    ],
    ctaLabel: "Başla",
    ctaHref: "/kayit",
    ctaVariant: "muted",
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "AI analizi, OCR, bütçe ve yatırım portföyü tek abonelikte",
    priceAmountTry: 150,
    priceSuffix: "/ay",
    perks: [
      "Ücretsiz plandaki her şey",
      "Fiş ve fatura görsellerinden OCR ile tutar, tarih ve kategori çıkarımı",
      "Yapay zekâ (AI) gelir–gider analizi: kişiselleştirilmiş yorumlar ve gelişim önerileri",
      "Finansal sağlık skoru; Premium’da portföy kar/zararı da skora dahil edilir",
      "Yapay zekâ raporunda gelecek dönem bütçe çerçevesi ve tasarruf önerileri",
      "Yapay zekâ analizinde harcama kalıpları ve trend yorumları",
      "Yatırım portföyü: hisse senedi, altın, döviz, kripto ve emtia pozisyonları",
      "Canlı kotasyonlarla pozisyon ve toplam portföy değeri; kar & zarar özeti",
      "Yeni özelliklere öncelikli erişim",
    ],
    ctaLabel: "Listeye katıl",
    ctaHref: "/kayit",
    highlighted: true,
    ctaVariant: "primary",
  },
];

export function getLandingPremiumPriceTry(): number {
  const p = LANDING_PLANS.find((x) => x.id === "premium");
  return p?.priceAmountTry ?? 150;
}
