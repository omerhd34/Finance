import Link from "next/link";

export function CerezPolitikasiContent() {
  return (
    <div className="space-y-6 text-muted-foreground leading-relaxed">
      <p className="text-lg text-foreground font-medium">
        IQfinansAI olarak, web sitemizde ve dijital uygulamalarımızda size daha
        güvenli, hızlı ve kişiselleştirilmiş bir deneyim sunmak amacıyla
        çerezler (cookies) ve benzeri izleme teknolojileri (web işaretçileri,
        pikseller vb.) kullanmaktayız. Bu politika, söz konusu teknolojilerin
        hangi amaçlarla kullanıldığını ve bunları nasıl yönetebileceğinizi
        açıklar.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        1. Çerez (Cookie) Nedir?
      </h2>
      <p>
        Çerezler, web sitemizi ziyaret ettiğinizde veya uygulamamızı
        kullandığınızda tarayıcınız veya cihazınız aracılığıyla depolanan küçük
        boyutlu metin dosyalarıdır. Bu dosyalar, platformumuzun cihazınızı
        tanımasını, oturum bilgilerinizi güvenle hatırlamasını ve site içi
        gezinme deneyiminizi iyileştirmesini sağlar.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        2. Kullandığımız Çerez Türleri ve Amaçları
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground">Zorunlu (Temel) Çerezler:</strong>{" "}
          Uygulamanın çalışması için kesinlikle gereklidir. Hesabınıza güvenli
          bir şekilde giriş yapmanız, yapay zekâ analiz seanslarınızın kopmaması
          ve ödeme güvenliğinin sağlanması (CSRF koruması vb.) gibi temel
          işlevleri yerine getirir. Bu çerezler kapatılamaz.
        </li>
        <li>
          <strong className="text-foreground">
            İşlevsel ve Tercih Çerezleri:
          </strong>{" "}
          Uygulama içindeki kişisel tercihlerinizi (örneğin; aydınlık/karanlık
          tema seçimi, ana para birimi tercihiniz) hatırlayarak her girişte aynı
          ayarları yapma zahmetinden sizi kurtarır.
        </li>
        <li>
          <strong className="text-foreground">
            Performans ve Analitik Çerezler:
          </strong>{" "}
          Platformumuzun nasıl kullanıldığını anlamamıza yardımcı olur. Hangi
          sayfaların daha çok ziyaret edildiği, anlık borsa/kripto veri
          akışlarındaki sayfa yüklenme süreleri gibi anonim metrikleri
          toplayarak sistem altyapımızı ve hızımızı iyileştirmemizi sağlar.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        3. Üçüncü Taraf Çerezleri
      </h2>
      <p>
        IQfinansAI, hizmet kalitesini artırmak için güvenilir iş ortaklarıyla
        çalışır. Canlı hisse, döviz ve kripto verilerini sağlayan API
        altyapıları, güvenli ödeme işlemleri için kullanılan lisanslı ödeme
        kuruluşları (ör. Shopier) veya anonim kullanım analizleri yapan
        servisler (ör. Google Analytics) kendi çerezlerini tarayıcınıza
        yerleştirebilir. Bu sağlayıcıların veri işleme süreçleri kendi gizlilik
        ve çerez politikalarına tabidir.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        4. Çerezleri Nasıl Yönetebilirsiniz?
      </h2>
      <p>
        Çerez kullanımına ilişkin tercihlerinizi dilediğiniz zaman tarayıcı
        ayarlarınız üzerinden değiştirebilirsiniz. Tarayıcınızı, tüm çerezleri
        engelleyecek, çerez yerleştirildiğinde sizi uyaracak veya yalnızca
        belirli sitelerin çerezlerine izin verecek şekilde
        yapılandırabilirsiniz. Ancak, <strong>Zorunlu Çerezleri </strong>
        engellemeniz durumunda IQfinansAI platformuna giriş yapamayabileceğinizi
        ve finansal hesaplama araçlarının düzgün çalışmayabileceğini önemle
        hatırlatırız.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        5. İletişim
      </h2>
      <p>
        Çerez politikamızla ilgili daha fazla bilgi almak veya gizlilik
        süreçlerimiz hakkında soru sormak için uygulama içerisindeki{" "}
        <strong>
          <Link href="/destek">Destek</Link>
        </strong>{" "}
        kanallarımızdan veya yayınlanan kurumsal iletişim e-posta adresimiz
        üzerinden teknik ve hukuki ekibimize ulaşabilirsiniz.
      </p>
    </div>
  );
}
