export type LandingWhyAccent = "emerald" | "violet" | "amber" | "sky" | "rose";

export type LandingWhyCard = {
  id: string;
  title: string;
  accent: LandingWhyAccent;
  positives: readonly string[];
  negatives: readonly string[];
};

export const LANDING_WHY_CARDS: LandingWhyCard[] = [
  {
    id: "finance-management",
    title: "Finans yönetimi",
    accent: "emerald",
    positives: [
      "Gelir, gider, borç, alacak ve çoklu para birimini tek panelde toplayın; güncel kurlarla ana para biriminize çevrilmiş özetleri, çubuk ve pasta grafiklerle dönem karşılaştırması ve finansal sağlık skoruyla izleyin.",
    ],
    negatives: [
      "Tablolar ve ayrı uygulamalarda dağınık veriyle net bakiye, kur etkisi ve riski her seferinde elle birleştirmek zorunda kalırsınız.",
    ],
  },
  {
    id: "budget-planning",
    title: "Bütçe ve planlama",
    accent: "violet",
    positives: [
      "Kategori bazlı aylık limitler tanımlayın, harcama eşiğine yaklaşınca uyarı alın; tekrarlayan ödemeleri ve yaklaşan vadeleri bildirimlerle takip edin.",
    ],
    negatives: [
      "Limitleri zihinde veya notta tutup sürpriz ödemeleri kaçırdığınızda bütçeyi ekran görüntüleriyle yeniden kurmak zorunda kalırsınız.",
    ],
  },
  {
    id: "cost-control",
    title: "Maliyet kontrolü",
    accent: "amber",
    positives: [
      "Ücretsiz planda temel panel, işlem, bütçe ve borç takibine başlayın; Premium’da AI analiz, asistan, OCR ve yatırım portföyünü tek abonelikte toplayın.",
    ],
    negatives: [
      "Grafik, OCR, AI ve portföy için ayrı uygulamalara ödeme yapıp veriyi taşırken hem maliyeti hem odağı bölersiniz.",
    ],
  },
  {
    id: "transaction-categories",
    title: "İşlem kaydı ve kategoriler",
    accent: "rose",
    positives: [
      "Geniş hazır kategori ağacıyla gelir ve giderleri tutarlı kaydedin; Premium’da fiş veya fatura görselinden OCR ile alanları doldurun, işlem listenizi CSV veya PDF olarak dışa aktarın.",
    ],
    negatives: [
      "Her işlemi elle yazıp kategoriyi her seferinde seçtiğinizde kayıt yavaşlar; dönem sonunda rapor için veriyi baştan toparlamanız gerekir.",
    ],
  },
  {
    id: "financial-calculations",
    title: "Finansal hesaplama araçları",
    accent: "sky",
    positives: [
      "Mevduat faizi, konut/ihtiyaç/taşıt kredisi taksiti, KDV, birikim hedefi, enflasyon (TÜFE) ve bireysel emeklilik hesaplarını ücretsiz tek yerden yapın; detaylı ödeme ve birikim planlarını grafikle görüp Excel veya PDF olarak indirip arşivleyin.",
    ],
    negatives: [
      "Her hesap için ayrı bankacılık veya hesaplama sitesine girip sonuçları elle not aldığınızda hem zaman kaybeder hem güncel olmayan parametrelerle yanıltıcı çıktılar elde edersiniz.",
    ],
  },
  {
    id: "ai-automation",
    title: "Yapay zekâ ve otomasyon",
    accent: "sky",
    positives: [
      "Premium’da kayıtlı verilerinizden tam metin AI analiz raporu üretin; sohbet asistanına soru sorun, OCR ile belge girişini hızlandırın ve raporu PDF olarak indirin.",
    ],
    negatives: [
      "Listeleri tek tek okuyup özeti kendiniz yazdığınızda fiş arşivinde boğulur; “bu ay nereye gitti?” sorusuna tablolar ve e-postalar arasında cevap ararsınız.",
    ],
  },
  {
    id: "investment-portfolio",
    title: "Yatırım portföyü",
    accent: "emerald",
    positives: [
      "Hisse, altın, gümüş, kripto, döviz ve emtia pozisyonlarını tek portföyde toplayın; canlı kotasyonlarla anlık değer ve kar/zararı Premium’da tek ekrandan izleyin.",
    ],
    negatives: [
      "Farklı borsa ve uygulamalarda pozisyonları elle topladığınızda toplam getiriyi kabaca tahmin eder, portföy riskini dağınık kalır.",
    ],
  },
];
