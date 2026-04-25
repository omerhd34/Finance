import Link from "next/link";

export function GizlilikPolitikasiContent() {
  return (
    <div className="space-y-6 text-muted-foreground leading-relaxed">
      <p className="text-lg text-foreground font-medium">
        IQfinansAI olarak kişisel verilerinizin gizliliğine ve güvenliğine en
        üst düzeyde önem veriyoruz. Bu aydınlatma metni, finansal asistanınız
        olarak sunduğumuz hizmetler kapsamında verilerinizi nasıl topladığımızı,
        işlediğimizi, koruduğumuzu ve haklarınızı şeffaf bir şekilde açıklamak
        amacıyla hazırlanmıştır.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        1. Veri Sorumlusu
      </h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili
        mevzuat uyarınca, IQfinansAI platformunu işleten tüzel kişi veri
        sorumlusu sıfatıyla hareket etmektedir. Tüm gizlilik endişeleriniz ve
        talepleriniz için iletişim kanallarımız üzerinden bizimle doğrudan
        irtibata geçebilirsiniz.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        2. İşlenen Kişisel Verileriniz
      </h2>
      <p className="mb-3">
        Size daha iyi ve güvenli bir hizmet sunabilmek amacıyla aşağıdaki veri
        kategorileri işlenmektedir:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground">
            Kimlik ve İletişim Verileri:
          </strong>{" "}
          Ad, soyad, e-posta adresi ve güvenli şifreleme altyapısıyla tutulan
          hesap doğrulama bilgileri.
        </li>
        <li>
          <strong className="text-foreground">Finansal Veriler:</strong> Sisteme
          kendi inisiyatifinizle eklediğiniz gelir-gider kayıtları, bütçe
          hedefleri, borç/alacak bilgileri ve kripto/hisse/döviz gibi varlık
          portföy durumunuz.
        </li>
        <li>
          <strong className="text-foreground">Görsel Veriler:</strong> Akıllı
          fiş/fatura okuma (OCR) özelliği kapsamında sisteme yüklediğiniz
          dokümanlar (bu belgeler analiz sonrası güvenle işlenir).
        </li>
        <li>
          <strong className="text-foreground">
            İşlem Güvenliği ve Teknik Veriler:
          </strong>{" "}
          IP adresi, cihaz bilgisi, tarayıcı türü, oturum logları ve hizmet
          kalitesini artırmaya yönelik analitik veriler.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        3. İşleme Amaçları ve Hukuki Sebepler
      </h2>
      <p className="mb-3">
        Kişisel ve finansal verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde
        belirtilen hukuki sebeplere (sözleşmenin ifası, yasal yükümlülüklerin
        yerine getirilmesi, veri sorumlusunun meşru menfaati) dayanarak şu
        amaçlarla işlenir:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Uygulama temel işlevlerinin (portföy takibi, bütçe yönetimi) eksiksiz
          sunulması,
        </li>
        <li>
          Yapay zekâ (AI) algoritmalarımız aracılığıyla size özel finansal
          içgörüler ve tasarruf önerileri oluşturulması,
        </li>
        <li>
          Sistem altyapısının güvenliğinin sağlanması ve olası teknik hataların
          giderilmesi,
        </li>
        <li>
          Kullanıcı deneyiminin iyileştirilmesi ve destek taleplerinizin
          yanıtlanması.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        4. Verilerin Aktarılması
      </h2>
      <p>
        IQfinansAI, finansal mahremiyetinize mutlak saygı duyar; verileriniz{" "}
        <strong>
          asla üçüncü taraflara reklam veya pazarlama amacıyla satılmaz.
        </strong>
        Kişisel verileriniz, yalnızca hizmetin kesintisiz sunulabilmesi için
        gerekli olduğu ölçüde; endüstri standardı güvenlik sertifikalarına sahip
        bulut sunucu sağlayıcılarımız, güvenli ödeme altyapısı ortaklarımız ve
        yapay zekâ veri işleme altyapılarımız ile yasal çerçevede ve gizlilik
        sözleşmeleri eşliğinde paylaşılmaktadır.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        5. Veri Saklama Süresi ve Güvenliği
      </h2>
      <p>
        Kişisel verileriniz, AES-256 gibi ileri düzey şifreleme yöntemleriyle
        yüksek güvenlikli sunucularda korunmaktadır. Verileriniz, işleme
        amacının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen yasal
        zamanaşımı süreleri sonuna kadar saklanır. Saklama süresi bitiminde veya
        hesabınızı kalıcı olarak sildiğinizde, tüm verileriniz geri döndürülemez
        şekilde silinir, yok edilir veya anonim hale getirilir.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        6. Yasal Haklarınız
      </h2>
      <p className="mb-3">
        KVKK&apos;nın 11. maddesi uyarınca sahip olduğunuz haklar şunlardır:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna
          ilişkin bilgi talep etme,
        </li>
        <li>
          İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
        </li>
        <li>
          Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü
          kişileri bilme,
        </li>
        <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme,</li>
        <li>
          Kanunda öngörülen şartlar çerçevesinde kişisel verilerin silinmesini
          veya yok edilmesini isteme,
        </li>
        <li>
          Münhasıran otomatik sistemler (örn. yapay zeka analizleri) vasıtasıyla
          işlenen veriler aleyhinize bir sonuç doğuruyorsa itiraz etme,
        </li>
        <li>
          Verilerinizin kanuna aykırı işlenmesi sebebiyle zarara uğramanız
          hâlinde zararın giderilmesini talep etme.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        7. İletişim ve Başvuru
      </h2>
      <p>
        Kişisel verilerinizle ilgili her türlü soru, görüş veya KVKK madde 11
        kapsamındaki taleplerinizi{" "}
        <strong>
          <Link href="/destek">Destek</Link>
        </strong>{" "}
        sayfamızdaki formu doldurarak veya yayınlanan kurumsal iletişim e-posta
        adresimize yazılı olarak iletebilirsiniz. Talepleriniz, niteliğine göre
        en kısa sürede ve en geç on (10) gün içinde sonuçlandırılacaktır.
      </p>
    </div>
  );
}
