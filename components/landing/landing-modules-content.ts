export const LANDING_MODULES_VIDEO_SRC = "/iqfinansai.mp4";

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
      "Günlük, haftalık veya aylık dönem seçerek gelir–gider dengenizi çubuk ve pasta grafiklerle görün. Hangi kategorilerde harcama arttığını, tasarruf oranınızı ve önceki dönemlere göre değişimi tek ekranda karşılaştırın.",
  },
  {
    id: "02",
    title: "Gelir-Gider Yönetimi",
    description:
      "Tüm gelir ve giderlerinizi tarih, tutar ve hazır kategori ağacıyla kaydedin; tekrarlayan faturalar ve abonelikler için vadeleri planlayın, yaklaşan ödemelerde hatırlatma alın. Premium’da fiş veya fatura fotoğrafı yükleyerek tutar, tarih ve kategoriyi OCR ile saniyeler içinde doldurun.",
  },
  {
    id: "03",
    title: "Tasarruf ve Hedef Takibi",
    description:
      "Ev, tatil veya acil durum gibi birikim hedefleri tanımlayın; hedef tutarı, bugüne kadar biriken miktar ve kalan süreyi ilerleme çubuğuyla takip edin. Ay içinde hedefinize ne kadar yaklaştığınızı her an görebilirsiniz.",
  },
  {
    id: "04",
    title: "Borç ve Alacak Yönetimi",
    description:
      "Kişi veya kuruma olan borç ve alacaklarınızı ayrı kalemler halinde tutun; yapılan ödemelerle kalan bakiyeyi anında güncelleyin. Kimden ne alacağınız veya kime ne borcunuz kaldığına tek listeden bakın.",
  },
  {
    id: "05",
    title: "Çoklu Para Birimi ve Kur",
    description:
      "TL, USD, EUR ve GBP cinsinden işlem girin; güncel kurlarla tutarlar otomatik olarak ana para biriminize çevrilsin. Farklı para birimlerindeki harcamalarınızı panel ve raporlarda toplu, okunabilir biçimde görün.",
  },
  {
    id: "06",
    title: "Yatırım Portföyü",
    description:
      "Hisse, altın, döviz, kripto ve emtia pozisyonlarınızı manuel kaydedin; canlı kotasyonlarla anlık değer ve portföy genelindeki kar/zararı izleyin. Dağılımınızı ve toplam pozisyon büyüklüğünü tek ekranda kontrol edin.",
    premium: true,
  },
  {
    id: "07",
    title: "IQfinansAI Analiz Raporu",
    description:
      "Girdiğiniz gelir–gider verilerinden yapay zekâ tam metin rapor üretir: kategori bazlı yorum, harcama trendleri ve tasarruf fırsatları. Raporu PDF olarak indirip arşivleyebilir veya güvendiğiniz biriyle paylaşabilirsiniz.",
    premium: true,
  },
  {
    id: "08",
    title: "IQfinansAI Asistanı",
    description:
      "Sohbet ekranından bütçe ve harcama alışkanlıklarınızı sorun; yanıtlar gerçek kayıtlarınıza dayanır. Hangi kalemlere odaklanmanız gerektiği, ay sonu riskleri ve gelişim önerileri kişiselleştirilmiş şekilde sunulur.",
    premium: true,
  },
];
