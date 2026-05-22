export type LandingModuleItem = {
  id: string;
  title: string;
  description: string;
  premium?: boolean;
};

export const LANDING_MODULES: LandingModuleItem[] = [
  {
    id: "01",
    title: "Finansal Performans Analizi",
    description:
      "Günlük, haftalık veya aylık dönem seçerek gelir–gider dengenizi çubuk, çizgi ve pasta grafiklerle ayrıntılı şekilde görüntüleyin. Hangi kategorilerde harcamanın arttığını, tasarruf oranınızın nasıl değiştiğini ve önceki dönemlere göre genel finansal performansınızı tek panelden karşılaştırın. Net bakiye, borç-alacak ve yatırım kar/zararı gibi öne çıkan KPI’ları kart tasarımında bir arada izleyin; finansal sağlık skorunuzla genel durumu özetleyin.",
  },
  {
    id: "02",
    title: "Gelir-Gider Yönetimi",
    description:
      "Tüm gelir ve giderlerinizi tarih, tutar ve geniş kategori ağacıyla saniyeler içinde kaydedin; tekrarlayan faturalar ve abonelikler için vadeleri planlayın, yaklaşan ödemelerde otomatik hatırlatma alın. Gelişmiş filtreleme, etiketleme ve hızlı arama ile binlerce işlem arasından ihtiyacınız olan kayda anında ulaşın. Premium’da fiş veya fatura fotoğrafını yükleyerek tutar, tarih ve kategoriyi OCR teknolojisiyle otomatik doldurun; manuel veri girişine harcadığınız zamanı en aza indirin.",
  },
  {
    id: "03",
    title: "Tasarruf ve Hedef Takibi",
    description:
      "Ev, tatil, eğitim, acil durum veya emeklilik gibi farklı amaçlar için ayrı birikim hedefleri tanımlayın; hedef tutarı, bugüne kadar biriken miktarı ve kalan süreyi renkli ilerleme çubuklarıyla takip edin. Aylık katkı senaryolarını değiştirerek hedefinize ne zaman ulaşacağınızı simüle edin ve farklı planları yan yana kıyaslayın. Hedefe yaklaştıkça akıllı bildirimlerle motivasyon, hatırlatma ve öneriler alın; tasarruf alışkanlığınızı sürekli güçlendirin.",
  },
  {
    id: "04",
    title: "Borç ve Alacak Yönetimi",
    description:
      "Kişi veya kuruma olan tüm borç ve alacaklarınızı ayrı kalemler halinde sınıflandırın; her kayıt için vade tarihi, faiz oranı ve geri ödeme planı belirleyin. Yapılan ödemeleri girdikçe kalan bakiye anında güncellensin, kimden ne alacağınız ya da kime ne borcunuz kaldığını tek listeden net biçimde görün. Toplam alacak, toplam borç ve net pozisyonunuzu özet kartlarla izleyin; vadesi yaklaşan veya geciken kayıtlar için akıllı hatırlatmalarla finansal disiplininizi koruyun.",
  },
  {
    id: "05",
    title: "Çoklu Para Birimi ve Kur",
    description:
      "TL, USD, EUR, GBP ve daha birçok para biriminde işlem girerek farklı dövizlerdeki gelir, gider ve yatırımlarınızı tek platformda yönetin; tutarlar güncel kurlarla otomatik olarak ana para biriminize çevrilsin. TCMB referans alış kurları, gram altın ve diğer emtia fiyatlarını anlık takip ederek raporlarınızı her zaman güncel verilerle oluşturun. Çoklu para birimli işlemleri panel, grafik ve toplu raporlarda okunabilir biçimde sunarak global harcama alışkanlıklarınızı net şekilde analiz edin.",
  },
  {
    id: "06",
    title: "Finansal Hesaplama Araçları",
    description:
      "Mevduat faizi, konut/ihtiyaç/taşıt kredisi taksiti, KDV, birikim hedefi, enflasyon (TÜFE) ve bireysel emeklilik gibi pek çok finansal senaryoyu tek yerden hesaplayın. Detaylı ödeme ve birikim planlarını çubuk ile çizgi grafiklerle karşılaştırmalı olarak inceleyin; farklı vade, oran ve katkı senaryolarını yan yana koyarak en uygun stratejiyi seçin. Tüm hesaplama sonuçlarını ihtiyaç duyduğunuzda Excel veya PDF olarak indirin; arşivleyin ya da danışmanınız ve aile bireylerinizle paylaşın.",
  },
  {
    id: "07",
    title: "Yatırım Portföyü",
    description:
      "Hisse senedi, altın, döviz, kripto ve emtia pozisyonlarınızı manuel olarak kaydedin; canlı kotasyonlarla anlık değer, ortalama maliyet ve portföy genelindeki kar/zararı eş zamanlı izleyin. Tür bazında dağılım grafikleri sayesinde risk konsantrasyonunuzu net biçimde görün, çeşitlendirme fırsatlarını hızlı şekilde tespit edin. Geçmişe yönelik kar/zarar trendleri, getiri analizleri ve toplam pozisyon büyüklüğünü tek ekranda inceleyerek daha bilinçli yatırım kararları alın.",
    premium: true,
  },
  {
    id: "08",
    title: "IQfinansAI Analiz Raporu",
    description:
      "Girdiğiniz gelir–gider verilerinden yapay zekâ; kategori bazlı yorumlar, harcama trendleri, tasarruf fırsatları ve uygulanabilir aksiyon önerileri içeren tam metin bir rapor üretir. Aylık raporlama akışıyla bir önceki dönemin gelişimini sistematik biçimde karşılaştırın; harcama anomalilerini ve gizli kalmış optimizasyon noktalarını AI sayesinde keşfedin. Raporu PDF olarak indirip arşivleyebilir, güvendiğiniz biriyle veya danışmanınızla paylaşabilir, geçmiş raporlarla finansal yolculuğunuzu belgeleyebilirsiniz.",
    premium: true,
  },
  {
    id: "09",
    title: "IQfinansAI Asistanı",
    description:
      "Sohbet ekranından bütçe, harcama alışkanlıkları, borç planlaması ve yatırım kararları hakkında sorular sorun; aldığınız yanıtlar tahminlere değil, doğrudan kendi gerçek kayıtlarınıza dayanır. Hangi kategorilere odaklanmanız gerektiği, ay sonu için olası riskler, tasarruf fırsatları ve uzun vadeli gelişim önerileri kişiselleştirilmiş biçimde sunulur. Asistan; yatırım, borç ve tasarruf konularında saniyeler içinde veriye dayalı, somut ve uygulanabilir adımlar önererek finansal kararlarınızda yanınızda olur.",
    premium: true,
  },
];
