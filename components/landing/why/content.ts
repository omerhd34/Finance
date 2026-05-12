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
      "Gelir, gider, borç ve çoklu para biriminizi tek panelde birleştirip nakit akışı ve finansal sağlık skoruyla anlık görün.",
    ],
    negatives: [
      "Tablolar ve ayrı uygulamalarda dağınık veriyle net bakiye ve riski her seferinde elle birleştirmek zorunda kalırsınız.",
    ],
  },
  {
    id: "budget-planning",
    title: "Bütçe ve planlama",
    accent: "violet",
    positives: [
      "Kategori limitleri ve tekrarlayan ödemeleri takvim ve bildirimlerle izleyin; planlanan bütçeyi gerçekleşen harcamalarla yan yana kıyaslayın.",
    ],
    negatives: [
      "Limitleri zihinde veya notta tutup sürpriz ödemeleri kaçırdığınızda bütçeyi ekran görüntüleriyle yeniden tazelemek zorunda kalırsınız.",
    ],
  },
  {
    id: "cost-control",
    title: "Maliyet kontrolü",
    accent: "amber",
    positives: [
      "Ücretsiz temel araçlarla başlayıp premiumda AI, OCR ve portföyü tek abonelikte toplayarak araç başına maliyeti düşürün.",
    ],
    negatives: [
      "Grafik, OCR ve portföy için ayrı uygulamalara ödeme yapıp veriyi taşırken hem bütçeyi hem odağı bölersiniz.",
    ],
  },
  {
    id: "transaction-categories",
    title: "İşlem kaydı ve kategoriler",
    accent: "rose",
    positives: [
      "Hazır kategori ağacı, toplu ekstre içe aktarma ve otomatik eşleştirme ile kayıtları tutarlı ve hızlı işleyin.",
    ],
    negatives: [
      "Manuel seçim ve kaydedilmeyen filtreler yüzünden raporlar dağınık kalır; dönem sonunda her şeyi baştan kurarsınız.",
    ],
  },
  {
    id: "ai-automation",
    title: "Yapay zekâ ve otomasyon",
    accent: "sky",
    positives: [
      "OCR ile belgeyi taratın, AI özet ve tasarruf önerileri alın; PDF dışa aktarım ve kurallarla bildirimleri otomatikleştirin.",
    ],
    negatives: [
      "Listeleri tek tek okuyup raporu elle yazdığınızda fiş arşivinde boğulur, anomalleri e-posta ile tablolar arasında avlarsınız.",
    ],
  },
  {
    id: "investment-portfolio",
    title: "Yatırım portföyü",
    accent: "emerald",
    positives: [
      "Hisse, altın, kripto ve dövizi tek portföyde birleştirip güncel fiyatlarla kar/zarar ve riski tek ekrandan izleyin.",
    ],
    negatives: [
      "Farklı borsa ve uygulamalarda pozisyonları elle topladığınızda toplam getiri ve vergi etkisini kabaca tahmin edersiniz.",
    ],
  },
];
