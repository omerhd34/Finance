import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Bot,
  Calculator,
  FileDown,
  MessageSquare,
  Globe,
  HandCoins,
  ArrowLeftRight,
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
    title: "Anlık kur dönüşümü",
    description:
      "Güncel kurlarla tutarları ana para biriminize çevirin; panel ve raporlarda gelir-gider dengesini tek bakışta karşılaştırın.",
    icon: ArrowLeftRight,
  },
  {
    title: "Ödeme hatırlatmaları",
    description:
      "Tekrarlayan ödemeler ve yaklaşan vadeler için uygulama içi bildirim alın.",
    icon: BellRing,
  },
  {
    title: "Finansal hesaplama araçları",
    description:
      "Mevduat faizi, kredi taksiti, KDV, birikim hedefi, enflasyon (TÜFE) ve BES hesaplamaları; grafikli ödeme planı ile dışa aktarma.",
    icon: Calculator,
  },
  {
    title: "Yapay zekâ analiz raporu",
    description:
      "Kayıtlı verilerinizden tam metin analiz; kategori yorumları, trendler ve tasarruf önerileri.",
    icon: Bot,
    premium: true,
  },
  {
    title: "Yapay zekâ asistanı",
    description:
      "Gelir-gider verilerinize göre soru sorun; kişiselleştirilmiş yorumlar, yönlendirme ve gelişim önerileri alın.",
    icon: MessageSquare,
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
  perks: string[];
};

export const LANDING_PLANS: LandingPlan[] = [
  {
    id: "free",
    title: "Ücretsiz",
    subtitle: "Panelden bütçeye kadar geniş özellik seti",
    priceAmountTry: 0,
    perks: [
      "Gelir-gider paneli, işlem kaydı ve tekrarlayan ödemeler",
      "Hedef oluşturma, bütçe planlama ve kategori grafikleri",
      "Borç ve alacak takibi",
      "Çoklu para birimi desteği",
      "Anlık kur dönüşümü",
      "Mevduat, kredi, KDV, birikim, enflasyon ve BES hesaplama araçları",
    ],
  },
  {
    id: "premium",
    title: "Premium",
    subtitle:
      "AI analiz, AI asistanla mesajlaşma, OCR ve yatırım portföyü tek abonelikte",
    priceAmountTry: 150,
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
  },
];

export function getLandingPremiumPriceTry(): number {
  const p = LANDING_PLANS.find((x) => x.id === "premium");
  return p?.priceAmountTry ?? 150;
}

export type LandingShowcaseTile = {
  title: string;
  icon: LucideIcon;
  tone:
    | "emerald"
    | "sky"
    | "rose"
    | "amber"
    | "violet"
    | "cyan"
    | "orange"
    | "fuchsia";
  premium?: boolean;
};

const showcaseTones: LandingShowcaseTile["tone"][] = [
  "emerald",
  "sky",
  "rose",
  "amber",
  "violet",
  "cyan",
  "orange",
  "fuchsia",
];

export const LANDING_SHOWCASE_TOP_ROW: LandingShowcaseTile[] =
  LANDING_FEATURES.slice(0, 6).map((feature, index) => ({
    title: feature.title,
    icon: feature.icon,
    tone: showcaseTones[index % showcaseTones.length],
    premium: feature.premium,
  }));

export const LANDING_SHOWCASE_BOTTOM_ROW: LandingShowcaseTile[] =
  LANDING_FEATURES.slice(6).map((feature, index) => ({
    title: feature.title,
    icon: feature.icon,
    tone: showcaseTones[(index + 3) % showcaseTones.length],
    premium: feature.premium,
  }));

export type LandingTestimonial = {
  id: string;
  quote: string;
  attribution: string;
  context: string;
  profession: string;
};

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "1",
    quote:
      "Serbest çalışırken gelirim düzensiz geliyordu; kategoriler ve grafiklerle ay içinde paranın nereye aktığını ilk kez net gördüm. Tek ekranda toplanması işimi ciddi anlamda kolaylaştırdı.",
    attribution: "Cemil Y.",
    context: "Ücretsiz plan",
    profession: "Grafik tasarımcı",
  },
  {
    id: "2",
    quote:
      "Kafedeki tekrarlayan faturalar ve tedarikçi ödemelerini ayrı takip edebilmek iyi oldu; hangi tarihte neyin çıkacağını önden görünce sürpriz ödemeler azaldı, bütçeyi planlamak daha rahat hissettiriyor.",
    attribution: "Halil K.",
    context: "Ücretsiz plan",
    profession: "Kafe işletmecisi",
  },
  {
    id: "3",
    quote:
      "Öğrenci bütçemde ay başında hedef belirleyip giderleri ona göre izlemek eskiden zordu; limitlere yaklaştığımda fark ediyorum ve gereksiz harcamayı durdurmak daha kolay geliyor.",
    attribution: "Zeynep D.",
    context: "Ücretsiz plan",
    profession: "Üniversite öğrencisi",
  },
  {
    id: "4",
    quote:
      "Yoğun sprint dönemlerinde uzun işlem listesini satır satır taramak yerine AI özetinin ana noktaları çıkarması zaman kazandırdı; ay sonunda nerede sıkıştığımı daha çabuk anlayabiliyorum.",
    attribution: "Erdal Ö.",
    context: "Premium plan",
    profession: "Yazılım geliştirici",
  },
  {
    id: "5",
    quote:
      "Saha satışında gelir dalgalanınca AI analiz raporunu PDF indirip eşimle masada konuşabilmek iyi oldu; sayılar aynı kaynaktan gelince tartışma yerine çözüm üretmeye zaman kalıyor.",
    attribution: "Melih A.",
    context: "Premium plan",
    profession: "Satış temsilcisi",
  },
  {
    id: "6",
    quote:
      "Sahada çekim yaparken telefondan hızlı giriş yapabilmek işimi kurtardı; fiş çekince hemen kaydedince ay sonunda eksik satır kalmıyor, manuel toplama derdi bitti.",
    attribution: "Oğuzhan Ş.",
    context: "Premium plan",
    profession: "Fotoğrafçı",
  },
  {
    id: "7",
    quote:
      "İş seyahatlerinde döviz ve TL işlemlerini aynı panelde görmek işime yarıyor; kur farkını her seferinde ayrı hesaplamak zorunda kalmıyorum.",
    attribution: "Ayşe T.",
    context: "Ücretsiz plan",
    profession: "İnsan kaynakları uzmanı",
  },
  {
    id: "8",
    quote:
      "Şantiyedeki borç ödemelerini kaydedince kalan bakiyeyi anında görmek iyi oldu; hangi taksidin bittiğini takip etmek için ayrı tablo tutmuyorum.",
    attribution: "Burak N.",
    context: "Ücretsiz plan",
    profession: "İnşaat teknikeri",
  },
  {
    id: "9",
    quote:
      "Danışan takibinin yanında kendi market ve yeme-içme harcamalarını grafiklerle izleyince ay içinde nasıl şiştiğini fark ettim; küçük ama düzenli ödemeler bile toplamı etkiliyormuş.",
    attribution: "Selin R.",
    context: "Ücretsiz plan",
    profession: "Diyetisyen",
  },
  {
    id: "10",
    quote:
      "E-ticaret operasyonunda günlük çok sayıda işlem giriyorum; hazır kategori ağacı sayesinde fişleri doğru yere atamak hızlandı, her kayıtta uzun liste aramıyorum.",
    attribution: "Deniz K.",
    context: "Ücretsiz plan",
    profession: "E-ticaret operasyon sorumlusu",
  },
  {
    id: "11",
    quote:
      "Ev bütçesinde ödeme hatırlatmaları abonelik yenilemelerini kaçırmamamı sağladı; özellikle karttan çekilen küçük tutarlar artık ay sonunda sürpriz olmuyor.",
    attribution: "Fatma E.",
    context: "Ücretsiz plan",
    profession: "Öğretmen",
  },
  {
    id: "12",
    quote:
      "Finans raporlarına alışkın olsam da AI asistanına ay içindeki harcama dağılımını sorunca net bir özet aldım; uzun listeyi tek tek okumadan hangi kalemlere odaklanmam gerektiğini anladım.",
    attribution: "Kaan M.",
    context: "Premium plan",
    profession: "Finans analisti",
  },
  {
    id: "13",
    quote:
      "Duruşma günlerinde fiş fotoğrafından tutar ve tarih alanlarının dolması kayıt süresini kısalttı; adliyeden çıkınca birkaç saniyede işlemi ekleyebiliyorum.",
    attribution: "İrem L.",
    context: "Premium plan",
    profession: "Avukat",
  },
  {
    id: "14",
    quote:
      "Maaş dışı yatırım pozisyonlarını tek ekranda görmek portföy dağılımını takip etmeyi kolaylaştırdı; canlı değerlerle toplam bakiyeyi anlık kontrol edebiliyorum.",
    attribution: "Volkan P.",
    context: "Premium plan",
    profession: "Makine mühendisi",
  },
  {
    id: "15",
    quote:
      "Vardiyalı çalışırken tasarruf hedefinde kalan tutarı görmek motivasyonu artırdı; ay ortasında hedefe ne kadar yaklaştığımı kontrol edince gereksiz harcamayı kısmak daha kolay oluyor.",
    attribution: "Gizem H.",
    context: "Ücretsiz plan",
    profession: "Hemşire",
  },
  {
    id: "16",
    quote:
      "Dükkanın aylık giderlerinde AI analiz raporundaki trend yorumları hangi kategorilerde sürekli aşım yaptığımı gösterdi; bir sonraki ay için bütçe çerçevesini daha gerçekçi kurabiliyorum.",
    attribution: "Onur C.",
    context: "Premium plan",
    profession: "Bakkal işletmecisi",
  },
];
