export type LandingWhyAccent = "emerald" | "violet" | "amber" | "sky" | "rose";

type LandingWhyCardBase = {
  id: string;
  title: string;
  accent: LandingWhyAccent;
  layout: "tall" | "default" | "wide";
};

export type LandingWhyHighlightCard = LandingWhyCardBase & {
  kind: "highlight";
  efficiencyValue: number;
  stats: readonly { value: string; label: string }[];
  positives: readonly string[];
  negative: string;
};

export type LandingWhyComparisonCard = LandingWhyCardBase & {
  kind: "comparison";
  positives: readonly string[];
  negatives: readonly string[];
};

export type LandingWhySetupCard = LandingWhyCardBase & {
  kind: "setup";
  processLabel: string;
  processValue: string;
  steps: readonly { label: string; progress: number; done?: boolean }[];
  positive: string;
  negative: string;
};

export type LandingWhyCard =
  | LandingWhyHighlightCard
  | LandingWhyComparisonCard
  | LandingWhySetupCard;

export const LANDING_WHY_CARDS: LandingWhyCard[] = [
  {
    id: "finance-management",
    kind: "highlight",
    layout: "tall",
    title: "Finans yönetimi",
    accent: "emerald",
    efficiencyValue: 100,
    stats: [
      { value: "4", label: "Para birimi" },
      { value: "Anlık", label: "Kur dönüşümü" },
      { value: "Geniş", label: "Kategori ağacı" },
    ],
    positives: [
      "Gelir-gider, tekrarlayan ödemeler, borç–alacak ve grafikler tek panelde toplanır.",
      "Finansal sağlık skoru, özet kartlar ve görsel raporlarla ay içi durumu takip edersiniz.",
    ],
    negative:
      "Tablolar, notlar ve ayrı uygulamalar arasında dağınık takip yaparsınız.",
  },
  {
    id: "budget-planning",
    kind: "comparison",
    layout: "default",
    title: "Bütçe ve planlama",
    accent: "violet",
    positives: [
      "Tasarruf hedefi, bütçe planı ve ödeme hatırlatmalarını aynı akıştan yönetirsiniz.",
    ],
    negatives: ["Ay sonu sürprizleri ve parçalı araçlar planınızı dağıtır."],
  },
  {
    id: "cost-control",
    kind: "comparison",
    layout: "default",
    title: "Maliyet kontrolü",
    accent: "amber",
    positives: [
      "Ücretsiz planda panelden bütçeye geniş bir özellik seti sunulur; Premium’da AI, OCR ve portföy tek üyelikte bir araya gelir.",
    ],
    negatives: [
      "Birden fazla abonelik ve öngörülemeyen araç maliyetleriyle karşılaşırsınız.",
    ],
  },
  {
    id: "transaction-categories",
    kind: "comparison",
    layout: "default",
    title: "İşlem kaydı ve kategoriler",
    accent: "rose",
    positives: [
      "Geniş hazır kategori ağacıyla işlemleri hızlı ve doğru kaydedersiniz.",
    ],
    negatives: [
      "Her işlemde uzun liste arar ve sınıflandırmayı elle tekrarlarsınız.",
    ],
  },
  {
    id: "ai-automation",
    kind: "comparison",
    layout: "tall",
    title: "Yapay zekâ ve otomasyon",
    accent: "sky",
    positives: [
      "Premium’da AI analiz, asistan ve fiş OCR aynı kayıtlardan çalışır.",
      "Tam metin analiz, trend yorumları ve kayıtlı veriye göre yanıtlar alırsınız.",
      "AI analiz raporunu PDF olarak indirip arşivleyebilir veya paylaşabilirsiniz.",
    ],
    negatives: [
      "Raporları manuel çıkarır, uzun listeleri gezersiniz ve fişleri elle girersiniz.",
      "Sorunuza göre kişisel yorum almak yerine genel tavsiyelerle veya harici aramalarla yetinirsiniz.",
    ],
  },
  {
    id: "investment-portfolio",
    kind: "comparison",
    layout: "wide",
    title: "Yatırım portföyü",
    accent: "emerald",
    positives: [
      "Premium’da hisse, altın, döviz, kripto ve emtia pozisyonlarını tek portföyde tutarsınız.",
      "Canlı kotasyonlarla pozisyon değerini ve kar/zarar özetini panelden görürsünüz.",
    ],
    negatives: [
      "Pozisyonları ayrı tablolarda ve elle kur hesaplarıyla takip edersiniz.",
      "Portföyünüz farklı uygulamalara dağılır ve görünüm dağınık kalır.",
    ],
  },
];
