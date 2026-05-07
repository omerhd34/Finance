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
    subtitle:
      "AI analiz, AI asistanla mesajlaşma, OCR ve yatırım portföyü tek abonelikte",
    priceAmountTry: 150,
    priceSuffix: "/ay",
    perks: [
      "Ücretsiz plandaki her şey",
      "Fiş ve fatura görsellerinden OCR ile tutar, tarih ve kategori çıkarımı",
      "AI analiz ve AI asistanıyla mesajlaşma: gelir-gider verilerinize göre kişiselleştirilmiş yorumlar, soruya göre yönlendirme ve gelişim önerileri",
      "Finansal sağlık skoru; Premium’da portföy kar/zararı da skora dahil edilir",
      "Yapay zekâ raporunda gelecek dönem bütçe çerçevesi ve tasarruf önerileri",
      "Yapay zekâ analizinde harcama kalıpları ve trend yorumları",
      "Yatırım portföyü: hisse senedi, altın, döviz, kripto ve emtia pozisyonları",
      "Canlı kotasyonlarla pozisyon ve toplam portföy değeri; kar & zarar özeti",
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

export type LandingTestimonial = {
  id: string;
  quote: string;
  attribution: string;
  context: string;
};

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "1",
    quote:
      "Harcamalarım dağınık notlarda kayboluyordu; kategoriler ve grafiklerle ay içinde paranın nereye aktığını ilk kez net gördüm. Her şeyin tek ekranda toplanması işimi ciddi anlamda kolaylaştırdı.",
    attribution: "Cemil Y.",
    context: "Ücretsiz plan",
  },
  {
    id: "2",
    quote:
      "Tekrarlayan faturalar ve borç taksitlerini ayrı takip edebilmek iyi oldu; hangi tarihte neyin çıkacağını önden görünce sürpriz ödemeler azaldı, bütçeyi planlamak daha rahat hissettiriyor.",
    attribution: "Halil K.",
    context: "Ücretsiz plan",
  },
  {
    id: "3",
    quote:
      "Ay başında hedef belirleyip giderleri ona göre izlemek eskiden zordu; şimdi limitlere yaklaştığımda fark ediyorum ve gereksiz harcamayı durdurmak daha kolay geliyor.",
    attribution: "Zeynep D.",
    context: "Ücretsiz plan",
  },
  {
    id: "4",
    quote:
      "Uzun işlem listesini satır satır taramak yerine AI özetinin ana noktaları çıkarması zaman kazandırdı; ay sonunda nerede sıkıştığımı daha çabuk anlayabiliyorum.",
    attribution: "Erdal Ö.",
    context: "Premium plan",
  },
  {
    id: "5",
    quote:
      "AI analiz raporunu PDF indirip eşimle masada konuşabilmek iyi oldu; sayılar aynı kaynaktan gelince tartışma yerine çözüm üretmeye zaman kalıyor.",
    attribution: "Melih A.",
    context: "Premium plan",
  },
  {
    id: "6",
    quote:
      "Telefondan hızlı giriş yapabilmek işimi kurtardı; fiş çekince hemen kaydedince ay sonunda eksik satır kalmıyor, manuel toplama derdi bitti.",
    attribution: "Oğuzhan Ş.",
    context: "Premium plan",
  },
];
