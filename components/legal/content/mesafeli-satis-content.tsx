import Link from "next/link";

export function MesafeliSatisContent() {
  return (
    <div className="space-y-6 text-muted-foreground leading-relaxed">
      <p className="text-lg text-foreground font-medium">
        Aşağıdaki metin, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
        Mesafeli Sözleşmeler Yönetmeliği kapsamında, IQfinansAI platformu
        üzerinden sunulan dijital hizmetlerin (Premium abonelik, yapay zekâ
        analizleri vb.) satışına ilişkin yasal hak ve yükümlülükleri düzenleyen
        Mesafeli Satış Sözleşmesi&apos;dir.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        1. Taraflar
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground">Satıcı:</strong> IQfinansAI
          hizmetini geliştiren ve sunan ticari işletme (Ödeme ve fatura
          adımlarında yer alan yasal unvan, vergi kimlik numarası ve iletişim
          bilgileri esas alınacaktır).
        </li>
        <li>
          <strong className="text-foreground">Alıcı (Tüketici):</strong>{" "}
          Platforma kayıt olan, kullanım koşullarını kabul eden ve ücretli
          hizmetler (Premium Plan) için ödeme yapan gerçek veya tüzel kişi.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        2. Sözleşmenin Konusu
      </h2>
      <p>
        Bu sözleşmenin konusu; Alıcı&apos;nın, Satıcı&apos;ya ait IQfinansAI
        platformu üzerinden elektronik ortamda siparişini verdiği &quot;Yazılım
        Hizmeti (SaaS)&quot; ve &quot;Dijital Abonelik&quot; paketlerinin
        satışı, kullanımı ve anında teslimi ile ilgili olarak tarafların yasal
        sınırlarının belirlenmesidir.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        3. Cayma Hakkı ve İstisnalar
      </h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-ğ maddesi uyarınca;{" "}
        <strong>
          &quot;Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye
          anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde&quot;
        </strong>{" "}
        cayma hakkı kullanılamaz.
      </p>
      <p>
        IQfinansAI tarafından sunulan hizmetler (yapay zekâ asistanı, anlık
        piyasa verileri, gelişmiş raporlama) dijital içerik niteliği
        taşıdığından ve ödeme onayının hemen ardından Alıcı&apos;nın hesabına
        anında tanımlanarak kullanıma açıldığından,
        <strong>
          {" "}
          ödemesi tamamlanmış aboneliklerde yasal 14 günlük cayma hakkı geçerli
          değildir ve ücret iadesi yapılmaz.{" "}
        </strong>
        Alıcı, aboneliğini dilediği zaman iptal edebilir; bu durumda mevcut
        faturalandırma dönemi sonuna kadar hizmetten faydalanmaya devam eder.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        4. Ücret, Ödeme ve Fatura
      </h2>
      <p>
        Hizmete ilişkin tüm vergiler (KDV vb.) dâhil toplam bedel, ödeme
        sayfasında Alıcı&apos;ya açıkça gösterilir. Satın alma işlemleri (ör.
        Shopier) PCI-DSS güvenlik standartlarına sahip bağımsız lisanslı ödeme
        kuruluşları üzerinden gerçekleştirilir. Satın alma işlemi tamamlandıktan
        sonra, yasal elektronik faturanız sipariş esnasında belirttiğiniz
        e-posta adresine sistem tarafından otomatik olarak gönderilir.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        5. Hizmetin İfası ve Teslimatı
      </h2>
      <p>
        Sözleşmeye konu hizmet fiziksel bir ürün değildir. Kargo veya posta
        yoluyla teslimat yapılmaz. Ödeme altyapısından başarılı işlem onayı
        geldiği saniye, Alıcı&apos;nın satın aldığı dijital paket (Premium Plan)
        kullanıcı hesabına otomatik olarak tanımlanır ve hizmet internet
        üzerinden anında ifa edilmiş sayılır. Kısa süreli planlı sistem
        bakımları veya mücbir sebepler (altyapı çökmeleri, veri sağlayıcı
        kesintileri) nedeniyle yaşanabilecek aksaklıklar hizmetin ifa edilmediği
        anlamına gelmez.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
        6. Uyuşmazlıkların Çözümü
      </h2>
      <p>
        Platformumuzla ilgili yaşadığınız her türlü sorun için öncelikle
        uygulama içi{" "}
        <strong>
          <Link href="/destek">Destek</Link>
        </strong>{" "}
        sayfamızdan bizimle iletişime geçmenizi rica ederiz. Çözüme
        kavuşturulamayan durumlar için, Ticaret Bakanlığı tarafından her yıl
        ilan edilen parasal sınırlar dâhilinde Alıcı&apos;nın veya
        Satıcı&apos;nın yerleşim yerindeki
        <strong> Tüketici Hakem Heyetleri </strong> ile{" "}
        <strong>Tüketici Mahkemeleri</strong> yetkilidir.
      </p>
    </div>
  );
}
