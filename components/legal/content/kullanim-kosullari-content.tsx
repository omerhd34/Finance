import Link from "next/link";

export function KullanimKosullariContent() {
  return (
    <div className="space-y-6 text-muted-foreground leading-relaxed">
      <p className="text-lg text-foreground font-medium">
        IQfinansAI platformuna hoş geldiniz. Uygulamamızı, web sitemizi ve
        sunduğumuz yapay zekâ destekli finansal araçları kullanarak aşağıdaki
        koşulları okuduğunuzu, anladığınızı ve yasal olarak bağlayıcı olduğunu
        kabul ettiğinizi beyan edersiniz. Koşullar, sistemin gelişimine paralel
        olarak güncellenebilir; önemli değişikliklerde tarafınıza şeffaf bir
        şekilde bildirim yapılacaktır.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        1. Hizmetin Kapsamı ve Niteliği
      </h2>
      <p>
        IQfinansAI; bütçe yönetimi, anlık piyasa verileri (kripto, borsa, döviz,
        altın) takibi, akıllı belge tarama (OCR) ve yapay zekâ destekli finansal
        içgörüler sunan gelişmiş bir kişisel asistan platformudur.
        <strong> Önemli Uyarı:</strong> Platform üzerinden sunulan hiçbir yapay
        zekâ analizi, veri, grafik veya bildirim; yatırım, vergi, muhasebe veya
        hukuki danışmanlık tavsiyesi niteliği taşımaz. Finansal kararlarınızın
        ve yatırım tercihlerinizin tüm sorumluluğu tamamen size aittir.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        2. Hesap, Güvenlik ve Sorumluluk
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground">Kişisel Sorumluluk:</strong>{" "}
          Hesabınıza ait giriş bilgilerinin gizliliğini sağlamakla yükümlüsünüz.
          Hesabınız üzerinden yapılan tüm işlemler sizin sorumluluğunuzdadır.
        </li>
        <li>
          <strong className="text-foreground">Güçlü Şifreleme:</strong>{" "}
          Güvenliğiniz için benzersiz ve karmaşık bir şifre kullanmanızı
          öneririz.
        </li>
        <li>
          <strong className="text-foreground">Şüpheli Durumlar:</strong>{" "}
          Hesabınıza yetkisiz bir erişim olduğunu fark ettiğiniz an, derhal
          şifrenizi sıfırlamalı ve destek ekibimizle iletişime geçmelisiniz.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        3. Kabul Edilmeyen Kullanımlar
      </h2>
      <p className="mb-3">
        Platformun güvenliğini ve diğer kullanıcıların deneyimini korumak adına
        aşağıdaki eylemler kesinlikle yasaktır:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Mevzuata aykırı, kara para aklama veya yasa dışı finansal faaliyetleri
          takip amacı gütmek,
        </li>
        <li>
          Sisteme, yapay zekâ algoritmalarına veya sunuculara zarar vermeye
          yönelik girişimlerde bulunmak (ör. DDoS saldırıları, zararlı yazılım
          yükleme),
        </li>
        <li>
          Yapay zekâ ve anlık veri API&apos;lerimizi otomasyon botları ile
          manipüle etmek veya aşırı veri çekmeye (scraping) çalışmak,
        </li>
        <li>
          Platformun kodlarını kopyalamak, tersine mühendislik (reverse
          engineering) yapmak veya güvenlik açıklarını istismar etmek.
        </li>
      </ul>
      <p className="mt-3">
        Bu kuralların ihlali durumunda IQfinansAI, hesabınızı bildirim
        yapmaksızın askıya alma veya kalıcı olarak kapatma hakkını saklı tutar.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        4. Ödemeler ve Premium Abonelik
      </h2>
      <p>
        IQfinansAI temel özellikleri ücretsiz olarak sunulmaktadır. Gelişmiş
        yapay zekâ analizleri, sınırsız portföy takibi gibi ekstralar içeren{" "}
        <strong>Premium Planlar</strong>, belirtilen fiyatlar ve döngüler
        üzerinden faturalandırılır. Ödeme işlemleri (ör. Shopier) PCI-DSS
        standartlarına uygun güvenli üçüncü taraf ödeme kuruluşları tarafından
        gerçekleştirilir; kredi kartı bilgileriniz sunucularımızda kesinlikle
        saklanmaz.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        5. Sorumlulukların Sınırlandırılması
      </h2>
      <p>
        IQfinansAI platformu &quot;olduğu gibi&quot; ve &quot;mevcut olduğu
        şekliyle&quot; sunulur. Üçüncü taraf API&apos;lerden (kripto, döviz
        kurları, borsa) kaynaklanan olası veri gecikmeleri, sistemdeki anlık
        teknik kesintiler veya yapay zekâ analizlerindeki istatistiksel
        sapmalardan doğabilecek kâr kaybı, ticari zarar veya doğrudan/dolaylı
        hiçbir zarardan IQfinansAI sorumlu tutulamaz.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        6. Hesap Kapatma ve Fesih
      </h2>
      <p>
        Platformu kullanmaktan dilediğiniz zaman vazgeçebilir ve{" "}
        <strong>
          <Link href="/ayarlar">Ayarlar &gt; Hesabı Sil</Link>
        </strong>{" "}
        menüsü üzerinden ilişiğinizi tamamen kesebilirsiniz. Hesabınızı
        sildiğinizde, yasal olarak saklanması zorunlu olan fatura ve işlem
        kayıtları dışındaki tüm finansal verileriniz Gizlilik Politikamıza uygun
        şekilde geri döndürülemez biçimde sistemlerimizden temizlenir.
      </p>
    </div>
  );
}
