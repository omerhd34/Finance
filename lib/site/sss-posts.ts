export type sssQaItem = {
  question: string;
  answer: string[];
};

export type sssPost = {
  slug: string;
  title: string;
  description: string;
  readingMinutes: number;
  category: string;
  cardPreview: string;
  qa: sssQaItem[];
};

export const SSSPosts: sssPost[] = [
  {
    slug: "ayarlar-profil-ve-bildirimler",
    title: "Ayarlar, profil ve bildirimler IQfinansAI'de nasıl yönetilir?",
    description:
      "Profil’de para birimi ve kimlik bilgisi; Ayarlar’da e‑posta, Shopier ile plan yükseltme ve hesap silme; Bildirimler’de uygulama içi uyarı akışı.",
    readingMinutes: 6,
    category: "Hesabım",
    cardPreview: "Tercihler ve bildirim merkezi",
    qa: [
      {
        question: "Ayarlar sayfasında neleri düzenleyebilirim?",
        answer: [
          "Bildirimler bölümünde genel e-posta gönderimini “E-posta bildirimleri” anahtarı ile yönetirsiniz; bütçe uyarıları uygulama içinde her zaman görünür. Tek bir harcama kategorisi için e-postayı kapatmak isterseniz, bunu Bütçeler sayfasındaki ilgili bütçe düzeninden yapabilirsiniz.",
          "Plan bölümünde ücretsiz ve Premium planları, güncel aylık ücret ve iki plan arasındaki özellik farklarını görürsünüz. Premium’a geçmek için “Shopier ile öde” ile Shopier ödeme sayfasına gidersiniz (çoğu tarayıcıda yeni sekmede açılır); ödeme onaylandığında planınız otomatik güncellenmeye çalışılır. Her başarılı ödeme, ödeme anından itibaren 30 gün Premium erişimi verir; süre dolduğunda hesap ücretsiz plana döner, yenilediğinizde tekrar Premium olursunuz.",
          "Sayfanın altındaki “Tehlikeli bölge” ile hesabınızı kalıcı olarak silebilirsiniz; onay için tam olarak SİL yazmanız gerekir ve bu işlem geri alınamaz.",
        ],
      },
      {
        question: "Profil sayfasında neleri düzenleyebilirim?",
        answer: [
          "Üye Profili kartında profil fotoğrafınızı yükleyebilir veya kaldırabilirsiniz (JPEG, PNG veya WebP; en fazla 5 MB). Ad ve soyad ile isteğe bağlı meslek, şehir ve ülke alanlarını güncelleyebilirsiniz; kayıtlı e-postanız güvenlik nedeniyle salt okunur olarak görüntülenir. Üzerinizdeki plan rozeti, hızlı erişim için Ayarlar’daki Plan bölümüne bağlanır.",
          "Özet ve dönüşümler için ana para biriminizi seçebilir; ay içinde raporların hangi güne göre hizalanacağını belirlemek için ay başlangıç gününü ayarlayabilirsiniz. Üyelik tarihiniz bilgi amaçlı gösterilir.",
          "Henüz doğrulanmamış bir e-postanız varsa, sayfanın altında “E-posta doğrulaması” bölümünü görürsünüz; buradan doğrulama e-postası isteyebilirsiniz. Adresinizi doğruladığınızda bu bölüm otomatik olarak kaybolur.",
        ],
      },
      {
        question: "Bildirimler ekranı ne işe yarar?",
        answer: [
          "Yaklaşan tekrarlayan ödemeler, hatırlatmalar ve uygulama içi uyarılar Bildirimler bölümünde toplanır; böylece önemli tarihleri tek listeden takip edebilirsiniz. Bildirim içeriği, kayıtlı işlem ve tekrarlayan ödeme kurallarınıza bağlıdır.",
        ],
      },
    ],
  },
  {
    slug: "hesap-guvenligi-ve-veri-koruma",
    title: "Hesap açma, giriş ve verilerimin korunması",
    description:
      "Kayıt, e-posta doğrulama, şifre sıfırlama, şifreleme ve hesabımı silmek.",
    readingMinutes: 7,
    category: "Güvenlik",
    cardPreview: "Kayıt, şifre ve veri güvenliği",
    qa: [
      {
        question: "IQfinansAI'ye nasıl kayıt olur ve giriş yaparım?",
        answer: [
          "Ana sitedeki Kayıt Ol sayfasından hesap oluşturabilir, ardından Giriş Yap ile oturum açabilirsiniz. Hesabınızın güvenliği için güçlü ve size özel bir şifre kullanmanız önerilir.",
        ],
      },
      {
        question: "E-posta doğrulaması ve şifremi unuttum akışı nasıl işler?",
        answer: [
          "Üye olduğunuz anda kayıtlı adresinize doğrulama e-postası gider; gelen bağlantıyla veya E-posta Doğrula akışıyla adresinizi onaylayabilirsiniz. Bağlantı süresi dolduysa veya maili göremediyseniz Profil sayfasındaki “E-posta doğrulaması” bölümünden yeniden doğrulama e-postası isteyebilirsiniz; doğrulama tamamlanınca bu bölüm görünmez.",
          "Şifrenizi unuttuysanız Giriş ekranındaki Şifremi Unuttum ile kayıtlı e-postanıza sıfırlama bağlantısı isteyebilirsiniz.",
        ],
      },
      {
        question: "Finansal verilerim nasıl korunur?",
        answer: [
          "Verileriniz endüstri standardı AES-256 şifreleme ile güvenli bulut altyapısında saklanır; KVKK ve gizlilik ilkelerimize uygun işlenir, reklam veya pazarlama amacıyla üçüncü taraflarla paylaşılmaz.",
        ],
      },
      {
        question: "Hesabımı ve verilerimi kalıcı olarak silebilir miyim?",
        answer: [
          "Evet. Ayarlar üzerinden hesabınızı sildiğinizde, sistemdeki finansal kayıtlarınız ve kişisel bilgileriniz geri alınamayacak şekilde temizlenir. Silmeden önce ihtiyaç duyduğunuz dışa aktarımları tamamlamanızı öneririz.",
        ],
      },
    ],
  },
  {
    slug: "gosterge-paneli-tek-bakista",
    title: "Gösterge panelinde neleri tek bakışta görebilirim?",
    description:
      "Üst özet kartları, gelir–gider grafikleri, tekrarlayan işlemler, borç/alacak özeti, Premium’da yatırım özeti ve son işlemler; hızlı kur çevirisi için Kur Dönüşüm menüsü.",
    readingMinutes: 9,
    category: "Gösterge paneli",
    cardPreview: "Özet göstergeler, grafikler ve modül kısayolları",
    qa: [
      {
        question: "Gösterge paneli IQfinansAI'de hangi rolü üstlenir?",
        answer: [
          "Sol menüdeki Ana Panel, oturum açınca gördüğünüz ana özet ekranıdır: bu ayın gelir ve gider toplamları, net bakiye, borç/alacak özeti ve finansal sağlık skoru gibi göstergeler tek sayfada bir araya gelir.",
          "Ücretsiz hesaplarda listenin üstünde Premium’a geçişi anlatan kısa bir tanıtım alanı bulunabilir. Alt sıralarda çubuk ve pasta grafikler, tekrarlayan işlemler özeti, borç ve alacaklar kartı ve en altta son işlemler tablosu yer alır; Premium üyelerde ek olarak yatırım varlıklarına göre özet kartları gösterilir. Referans kurla tutar çevirmek için menüdeki Kur Dönüşüm sayfasını kullanabilirsiniz. Detaylı düzenleme için İşlemler, Tekrarlayan, Bütçeler veya ilgili menü kalemlerine geçebilirsiniz.",
        ],
      },
      {
        question: "Üstteki özet kartlarında neler görünür?",
        answer: [
          "Ay içindeki toplam gelir, toplam gider ve net bakiye, Profil’de seçtiğiniz ana para birimiyle gösterilir. Borç ve alacak kayıtlarınızdan hesaplanan borç/alacak net tutarı ve gelir–gider dengenize göre üretilen finansal sağlık skoru (yüzde ve kısa bir yorum satırı) yer alır; Premium’da bu skor hesaplanırken portföy kar/zararı da dikkate alınır, ücretsiz planda yatırım bileşeni nötr tutulur.",
          "Premium planda portföyünüze göre hesaplanan yatırım kar/zarar özeti de üstteki özet kartları arasında ayrı bir kart olarak görünür; ücretsiz planda bu kart bulunmaz.",
        ],
      },
      {
        question: "Grafikler hangi dönemleri ve verileri gösterir?",
        answer: [
          "Sol tarafta seçebileceğiniz bir pencerede (son 2 aydan 12 aya kadar) aylık gelir, gider ve tasarruf oranı trendini çubuk grafik olarak izlersiniz.",
          "Sağ tarafta ise yine ay aralığı seçerek (örneğin son 1, 3 veya 12 ay) giderlerinizi kategori bazında pasta grafiğinde dağılım olarak görürsünüz; böylece hem zaman içindeki akışı hem de hangi kalemlerin payı büyük olduğunu tek bakışta karşılaştırabilirsiniz.",
        ],
      },
      {
        question:
          "Tekrarlayan işlemler, borç/alacak ve son işlemler kartları ne işe yarar?",
        answer: [
          "Tekrarlayan işlemler kartında aktif kural sayınız ve sıradaki birkaç ödeme/tahsilat tarihi özetlenir; “Tümünü gör” ile Tekrarlayan sayfasına geçebilirsiniz.",
          "Borç ve Alacaklar kartı alacak ve borç bakiyelerinizi özetler, öne çıkan kalemleri listeler ve ilgili modüle yönlendirir. Son işlemler kartında ise zaman sırasına göre en son beş işleminizi görür, İşlemler sayfasına kısayol alırsınız.",
        ],
      },
      {
        question: "Paneldeki veriler ne sıklıkla güncellenir?",
        answer: [
          "İşlem, borç ve tekrarlayan kayıtlarınıza dayanan tüm özetler, kayıt ekleyip güncelledikçe otomatik hesaplanır; paneli yenilediğinizde veya tekrar ziyaret ettiğinizde bu veriler sunucudan yeniden çekilir. Sayfa her açıldığında vadesi gelmiş tekrarlayan işlemler işlenmeye çalışılır.",
          "Premium yatırım kartlarında kullanılan hisse, altın, döviz, emtia ve kripto fiyatları harici kaynaklardan gelir ve performans için sunucu tarafında kısa süreli (tipik olarak birkaç dakikalık) önbelleğe alınabilir; yatırım özeti ücretsiz planda gösterilmez.",
        ],
      },
      {
        question: "Ücretsiz ve Premium kullanıcılar için panelde fark var mı?",
        answer: [
          "Ücretsiz kullanıcılar ana gelir–gider özetleri, finansal sağlık skoru kartı, grafikler, tekrarlayan ve borç/alacak bloklarını tam kullanır; listenin başında Premium tanıtımı görebilirler. Yatırım özeti ve yatırım kar/zarar kartları yalnızca Premium üyelikte yer alır.",
          "Yapay zekâ ile tam analiz raporu (çalıştırma, PDF indirme ve geçmiş kayıtlara dönme) ile Yeni işlem ekranında fiş/fatura görüntüsünden alan doldurma Premium ile açılır; ücretsiz planda AI Analiz sayfasında özellikler anlatılır, rapor üretimi kapalıdır.",
        ],
      },
      {
        question: "Panelden yapay zekâ analizine nasıl geçebilirim?",
        answer: [
          "Sol menüden AI Analiz sayfasına geçebilirsiniz. Tam kapsamlı yapay zekâ analizi ve raporları çalıştırmak Premium plana bağlıdır; ücretsiz planda bu sayfada özellikler tanıtılır, analiz ise Premium sonrası kullanılabilir.",
          "Sunulan metinler ve skorlar yatırım, vergi veya hukuki tavsiye niteliği taşımaz; kişisel finansal farkındalık için tasarlanmış özet içgörülerdir.",
        ],
      },
    ],
  },
  {
    slug: "yatirimlar-ekrani-portfoy",
    title: "Yatırımlar ekranında portföy takibi nasıl yapılır?",
    description:
      "Premium’da hisse, döviz, altın, emtia ve kripto pozisyonları; canlı fiyatlarla tahmini değer ve kar/zarar.",
    readingMinutes: 8,
    category: "Yatırımlar",
    cardPreview: "Premium portföy ve canlı fiyatlar",
    qa: [
      {
        question: "Yatırım pozisyonlarını kimler kaydedebilir?",
        answer: [
          "Hisse, döviz, altın, emtia (örneğin gümüş/platin türevleri) ve kripto pozisyonlarını ekleyip düzenlemek, silmek ve canlı fiyatlarla tahmini portföy değeri görmek Premium üyelikle açılır. Ücretsiz planda Yatırım menüsüne girdiğinizde özellik tanıtımı ve yükseltme bilgisi görürsünüz; aracı kurum hesabınızla otomatik senkronizasyon sunulmaz.",
        ],
      },
      {
        question: "Portföy değerim hangi kurlar veya fiyatlarla hesaplanır?",
        answer: [
          "Premium planda uygulama, harici kaynaklardan gelen güncel fiyat ve kur verileriyle pozisyonlarınızın tahmini değerini ve kar/zararı hesaplar. Ana para biriminizi Profil sayfasından seçersiniz; gösterilen tutarlar bilgilendirme amaçlıdır.",
        ],
      },
      {
        question: "Piyasa verileri ne sıklıkla yenilenir?",
        answer: [
          "Hisse, altın, döviz, emtia ve kripto kotasyonları sunucu tarafında tipik olarak birkaç dakikalık önbellekle yenilenir; sayfayı yenilediğinizde veya modüle her döndüğünüzde güncel veri istenir. Kesin işlem kararı için fiyatı mutlaka kendi aracı kurum veya resmi kaynağınızdan doğrulayın.",
        ],
      },
      {
        question: "IQfinansAI yatırım tavsiyesi verir mi?",
        answer: [
          "Hayır. Yatırımlar modülü yalnızca kaydettiğiniz pozisyonları listelemek ve tahmini değer göstermek içindir; alım/satım önerisi verilmez. Kararlarınızı lisanslı danışmanlar ve risk tercihinizle birlikte değerlendirin.",
        ],
      },
    ],
  },
  {
    slug: "kategori-butcesi-ve-islemler",
    title: "IQfinansAI'de işlemler ve kategori bütçeleri nasıl kullanılır?",
    description:
      "İşlemler ve Yeni işlem ekranı, sabit gelir/gider kategorileri ve Bütçeler ile üst limitleme.",
    readingMinutes: 8,
    category: "Panel",
    cardPreview: "İşlem, kategori ve bütçe limiti",
    qa: [
      {
        question: "IQfinansAI'de gelir ve giderlerimi nereden kaydediyorum?",
        answer: [
          "İşlemler menüsünden listeyi yönetir; “Yeni işlem” ile tek tek gelir veya gider satırı eklersiniz. Tutar, Profil’de seçtiğiniz para biriminde girilir ve kayıt dahili olarak TL ile saklanır.",
          "Premium üyeler Yeni işlem sayfasında fiş veya fatura fotoğrafı yükleyerek tutar, tarih ve kategori için otomatik öneri alabilir; kaydetmeden önce alanları kontrol etmek gerekir. Ücretsiz planda aynı form ile manuel giriş yapılır.",
        ],
      },
      {
        question: "Hazır kategori yapısı ne işe yarar?",
        answer: [
          "Gelir ve gider için uygulama önceden tanımlı iki ayrı liste sunar (örneğin giderde Yiyecek, Market, Kira gibi kalemler); işlem eklerken bu listeden seçim yaparsınız. Böylece grafik ve bütçelerde karşılaştırılabilir, tutarlı etiketler oluşur.",
        ],
      },
      {
        question: "Kategori bütçesi nedir; IQfinansAI'de nasıl kullanılır?",
        answer: [
          "Bütçeler menüsünde harcama kategorisi bazında aylık üst limit ve uyarı eşiği tanımlarsınız; ilgili ay içinde harcamanız bu çerçevede izlenir. Limit veya eşik aşımlarında uygulama içi bildirim oluşabilir; e-posta için Ayarlar ve tek kategori için Bütçe düzeninden tercih verebilirsiniz. Bütçe disiplin içindir; bankanızdan otomatik ödeme çekilmez.",
        ],
      },
      {
        question: "Görsel raporlarda neleri görürüm?",
        answer: [
          "Aylık trendler, kategori dağılımı ve özet metrikler anlaşılır grafiklerle sunulur. Böylece harcama alışkanlıklarınızı tek bakışta karşılaştırabilirsiniz; bu görünümler yatırım veya vergi tavsiyesi değildir.",
        ],
      },
    ],
  },
  {
    slug: "yapay-zeka-analizi-ve-premium",
    title: "Yapay zekâ analizi ve Premium: Fiş tarama ile neler mümkün?",
    description:
      "Yapay zekâ destekli analiz sayfası, PDF dışa aktarma, Premium fiş/fatura tarama ve ücretsiz plan farkı.",
    readingMinutes: 8,
    category: "Premium",
    cardPreview: "YZ içgörü ve fiş tarama",
    qa: [
      {
        question: "IQfinansAI'deki yapay zekâ analizi tam olarak ne yapar?",
        answer: [
          "Uygulama içindeki Yapay zekâ analizi; kayıtlı harcama ve gelir verilerinizden hareketle kişiselleştirilmiş özetler, trendler ve tasarruf veya düzen önerileri sunar. Amaç harcama alışkanlıklarınızı anlamanız ve bütçe disiplinini güçlendirmenizdir.",
          "Premium’da oluşturduğunuz raporu PDF olarak indirebilir ve geçmiş çalıştırmalardan birini yeniden açmak için geçmiş penceresini kullanabilirsiniz.",
        ],
      },
      {
        question: "Premium üyelikte fiş veya fatura tarama nasıl çalışır?",
        answer: [
          "Premium planda fiş veya fatura fotoğrafından tutar, tarih ve uygun kategori gibi alanları çıkarmanıza yardımcı olan akıllı tarama özelliği bulunur; böylece manuel giriş süresini kısaltırsınız. Okuma sonucunu işlemeden önce her zaman kontrol etmeniz önerilir.",
        ],
      },
      {
        question: "Yapay zekâ çıktıları yatırım veya hukuki tavsiye midir?",
        answer: [
          "Hayır. Sunulan analizler ve öneriler istatistiksel içgörü niteliğindedir; yatırım, vergi, kredi veya hukuki danışmanlık yerine geçmez. Kesin kararlarınızı ilgili uzmanlarla değerlendirmelisiniz.",
        ],
      },
      {
        question: "Ücretsiz plan ile Premium arasındaki başlıca fark nedir?",
        answer: [
          "Ücretsiz planda Ana Panel, işlemler (manuel kayıt), tekrarlayan ödemeler, kategori bütçeleri, borç–alacak takibi, Kur Dönüşüm ekranı ve çoklu para birimi (Profil’den TL/USD/EUR/GBP) kullanılır; Ana Panelde özet finansal sağlık skoru da görünür. AI Analiz bu planda çalıştırılamaz (sayfada tanıtım metni bulunur).",
          "Premium ile fiş/fatura görüntüsünden işlem alanlarını doldurma (Yeni işlem), yapay zekâ analizi raporunun çalıştırılması, PDF indirme, geçmiş analizlere erişim, yatırım portföy takibi ve canlı fiyatlarla kar/zarar özeti açılır; güncel paket tutarı ve Shopier ile ödeme için Ayarlar’daki Plan bölümüne bakabilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "tasarruf-hedefleri-ve-tekrarlayanlar",
    title:
      "Kategori bütçeleri, tekrarlayan ödemeler ve hatırlatma IQfinansAI'de nasıl kullanılır?",
    description:
      "Harcama üst sınırı (bütçe), tekrarlayan kural özeti ve Bildirimler ile uyarılar.",
    readingMinutes: 7,
    category: "Bütçe",
    cardPreview: "Bütçe limiti ve tekrarlayan ödemeler",
    qa: [
      {
        question: "Ayrı bir “tasarruf hedefi” sayfası var mı?",
        answer: [
          "Tanıtım dilinde geçen “tasarruf hedefi” veya “hedef oluşturma” ifadesi, ayrı bir hedef kaydı yerine pratikte Bütçeler menüsündeki kategori bazlı aylık üst limitler, Ana Panel’deki net bakiye ve grafiklerle disiplin kurmanızı ifade eder. Ayrı bir “hedefler” pano ekranı şu an menüde yoktur; birikim yolunuzu bu araçlarla izlersiniz.",
        ],
      },
      {
        question: "Bütçe ilerlememi nasıl anlarım?",
        answer: [
          "İşlemlerinizi kategorilere ayırdıkça, ilgili ay içinde harcamanız Bütçeler ve Ana Panel grafiklerinde limitinize göre görünür. Belirlediğiniz uyarı yüzdesine yaklaşıldığında veya limit aşıldığında uygulama içi Bildirimler kutusuna düşen kayıtlar oluşabilir.",
        ],
      },
      {
        question: "Tekrarlayan ödemeler nasıl işler?",
        answer: [
          "Tekrarlayan menüsünde düzenli gelir veya gider kalemleri için tutar, sıklık ve sonraki vade tarihi tanımlarsınız; sistem uygun zamanlarda işlem üretmeye çalışır. Ana Paneldeki “Tekrarlayan işlemler” kartında sıradaki birkaç tarihi özet olarak görürsünüz; otomatik banka ödemesi yapılmaz.",
        ],
      },
      {
        question: "Yaklaşan ödemeler için nereye bakmalıyım?",
        answer: [
          "Tekrarlayan sayfası ve Ana Paneldeki “Tekrarlayan işlemler” kartı sıradaki vadeleri gösterir. Bütçe ile ilgili uyarılar Bildirimler menüsünde birikir; genel e-posta gönderimi ise Ayarlar’daki anahtardan yönetilir.",
        ],
      },
    ],
  },
  {
    slug: "borc-alacak-ve-coklu-para-birimi",
    title:
      "Borç ve alacak takibi ile çoklu para birimi IQfinansAI'de nasıl kullanılır?",
    description:
      "Borç–alacak kayıtları, ana para birimi ve TL / USD / EUR / GBP işlemleri.",
    readingMinutes: 7,
    category: "Borç ve alacak",
    cardPreview: "Çoklu para biriminde takip",
    qa: [
      {
        question: "Borç ve alacak modülü ile neleri yönetebilirim?",
        answer: [
          "Alacak ve borç kayıtlarınızı tek ekranda tutup ödeme süreçlerini aksatmadan izleyebilirsiniz. Hangi kaleme ne kadar ayırdığınızı görmek, nakit akışınızı planlamayı kolaylaştırır; hukuki veya kredi sözleşmesi yorumu sunmaz.",
        ],
      },
      {
        question: "Farklı para birimleriyle işlem ekleyebilir miyim?",
        answer: [
          "Evet. IQfinansAI, TL, ABD doları (USD), euro (EUR) ve sterlin (GBP) ile işlem kaydını destekler. Ana para biriminizi Profil sayfasından seçersiniz; özetlerde tutarlar bu tercihe göre gösterilir ve kayıtlar dahili olarak TL ile tutulur.",
          "İşlem dışında hızlı kur çevirisi için menüdeki Kur Dönüşüm sayfasını kullanabilirsiniz; canlı döviz kurları (veya yüklenemezse yedek kurlar) ile kaynak ve hedef para birimleri arasında tutar hesaplarsınız.",
        ],
      },
      {
        question: "Banka hesabımı uygulamaya bağlamak zorunda mıyım?",
        answer: [
          "Hayır. Şu an için verilerinizi manuel olarak veya Premium'daki fiş/fatura tarama ile hızlıca girebilirsiniz. Banka entegrasyonları üzerinde çalışmalar sürmektedir; duyurular için destek ve sürüm notlarını takip edebilirsiniz.",
        ],
      },
      {
        question: "Yatırım araçlarımdaki fiyatlar ne sıklıkla güncellenir?",
        answer: [
          "Canlı kotasyonlar Premium yatırım modülünde kullanılır; sunucu tarafında tipik olarak birkaç dakikalık önbellekle yenilenir. Ücretsiz planda Yatırım ekranı yükseltme bilgisi gösterir. Gösterilen değerler bilgilendirme amaçlıdır; işlem kararı için kendi aracı kurum verinizi kullanın.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): sssPost | undefined {
  return SSSPosts.find((p) => p.slug === slug);
}
