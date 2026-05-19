export type LandingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** Ana sayfada gösterilen ilk 5 SSS — tam liste `/sss` sayfasında. */
export const landingFaqItems: LandingFaqItem[] = [
  {
    id: "excel-banka-fark",
    question:
      "IQfinansAI, Excel veya banka uygulamasından kullanmaktan nasıl farklı?",
    answer:
      "Excel ve banka uygulamaları geçmiş hareketleri listeler; IQfinansAI bütçe, borç–alacak ve yatırımları tek panelde toplar, grafiklerle özetler ve yapay zekâ ile trend ile tasarruf fırsatlarını yorumlar. Tablolar arasında gezmek yerine hangi kalemlere odaklanmanız gerektiğini tek ekranda görürsünüz.",
  },
  {
    id: "deger-suresi",
    question: "Ne kadar sürede fayda görürüm?",
    answer:
      "İlk işlem ve bütçe kayıtlarınızdan sonra panel özeti ve grafikler hemen anlamlı hale gelir. Yapay zekâ özet ve analiz için yeterli veri biriktikçe — çoğu kullanıcıda birkaç hafta içinde — trend yorumları ve tasarruf önerileri de devreye girer.",
  },
  {
    id: "banka-excel-sart",
    question: "Banka bağlantısı veya Excel kullanmak zorunlu mu?",
    answer:
      "Hayır. Gelir–gider, bütçe ve diğer kayıtları panelden manuel girebilirsiniz; banka entegrasyonu şart değildir. Dilerseniz mevcut Excel veya banka uygulamanızın yanında, karar vermenize yardımcı bir katman olarak kullanırsınız.",
  },
  {
    id: "guvenlik-kontrol",
    question: "Verilerim güvende mi, kayıtları kontrol edebilir miyim?",
    answer:
      "Her işlem tarih, tutar ve kategori ile kayıt altındadır; panelde dilediğiniz zaman düzenleyebilir veya silebilirsiniz. Verileriniz AES-256 şifreleme ile korunur, KVKK ilkelerine uygun işlenir; yapay zekâ önerileri yalnızca sizin girdiğiniz kayıtlara dayanır.",
  },
  {
    id: "kara-kutu",
    question: "Yapay zekâ benim yerime harcama veya ödeme yapar mı?",
    answer:
      "Hayır. Yapay zekâ özet, trend ve tasarruf fırsatı önerir; işlem ekleme, bütçe limiti veya ödeme kararı her zaman sizdedir. Ne önereceğini sizin girdiğiniz veriler belirler — kara kutu yerine açıklanabilir bir yardımcı katman.",
  },
];
