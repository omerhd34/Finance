# Finance — Kişisel Finans Uygulaması

Next.js tabanlı bir kişisel finans paneli: gelir ve gider işlemleri, hedefler, borç takibi, yatırım pozisyonları, döviz kurları ve yapay zekâ destekli özetler tek arayüzde bir araya gelir.

## Önizleme

<p align="center">
  <img src="./public/website1.png" alt="Finance uygulamasından ekran görüntüsü 1" width="920" /><br /><br />
  <img src="./public/website2.png" alt="Finance uygulamasından ekran görüntüsü 2" width="920" /><br /><br />
  <img src="./public/website3.png" alt="Finance uygulamasından ekran görüntüsü 3" width="920" />
</p>


## Özellikler

- **Kimlik doğrulama**: E-posta/şifre ile kayıt ve giriş; isteğe bağlı Google ile oturum (NextAuth v5).
- **İşlemler**: Gelir/gider kayıtları, kategori ve tarih ile listeleme ve düzenleme.
- **Pano**: Aylık özetler, kategori dağılımı (pasta grafik) ve aylık bar grafikleri (Recharts).
- **Hedefler**: Birikim hedefleri, tutar ve tarih takibi.
- **Borçlar**: Alacak/verecek yönü, karşı taraf, ödeme durumu.
- **Yatırımlar**: Altın alt türleri, hisse vb. pozisyonlar; maliyet ve güncel fiyat alanları.
- **Döviz kurları**: Uygulama içi kur senkronizasyonu (kullanıcı para birimi ayarıyla uyumlu).
- **AI öngörüleri**: Google Gemini ile harcama/özet analizi (`GEMINI_API_KEY` gerekir).
- **Ayarlar**: Profil, para birimi, şifre güncelleme.

Veri katmanı **Prisma** ve **MySQL** ile modellenir; istemci tarafında **Redux Toolkit** ile durum yönetimi kullanılır. Arayüz **React 19**, **Tailwind CSS 4** ve **Radix UI** bileşenleriyle kurulmuştur.

## Gereksinimler

- Node.js 20+ (TypeScript 5, Next.js 16 ve React 19)
- MySQL 8 (veya Prisma’nın desteklediği uyumlu bir sürüm)

## Kurulum

1. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

2. Ortam değişkenlerini ayarlayın. Proje kökünde `.env` oluşturup `.env.example` içeriğini kopyalayın ve değerleri doldurun:

   | Değişken | Açıklama |
   |----------|----------|
   | `DATABASE_URL` | MySQL bağlantı dizisi (`mysql://kullanıcı:şifre@host:3306/veritabanı`) |
   | `AUTH_SECRET` | NextAuth için güçlü rastgele bir secret |
   | `NEXTAUTH_URL` | Geliştirmede genelde `http://localhost:3000` |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google ile giriş için (opsiyonel) |
   | `GEMINI_API_KEY` | AI analiz uç noktası için (opsiyonel) |

3. Veritabanı şemasını oluşturun:

   ```bash
   npx prisma migrate dev
   ```

   İlk kurulumda veya şema değişince bu komut tabloları günceller.

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   ```

   Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (hot reload) |
| `npm run build` | `prisma migrate deploy` sonrası üretim derlemesi (`next build --webpack`) |
| `npm start` | Derlenmiş uygulamayı çalıştırır (`build` sonrası) |
| `npm run lint` | ESLint kontrolü |

`postinstall` içinde `prisma generate` çalışır; bağımlılık kurulumundan sonra Prisma Client güncel kalır.

## Proje yapısı (özet)

- `app/` — App Router: açılış sayfası, `hakkimizda`, yasal/destek sayfaları; `(auth)` giriş/kayıt/şifre akışları; `(dashboard)` gösterge paneli, işlemler, bütçeler, tekrarlayanlar, hedefler, borç ve alacak, yatırımlar, yapay zekâ analizi, ayarlar, profil, bildirimler
- `app/api/` — REST benzeri API route’ları (işlemler, kullanıcı, borçlar, yatırımlar, döviz, AI vb.)
- `components/` — UI bileşenleri, grafikler, formlar
- `lib/` — Auth, doğrulama, para birimi, istatistik yardımcıları
- `prisma/schema.prisma` — Veri modeli (User, Transaction, Goal, Debt, InvestmentPosition, NextAuth tabloları)
- `public/` — Statik varlıklar (ör. `website1.png` / `website2.png` README önizleme görselleri)
- `store/` — Redux slice’lar

## Notlar

- Bu depo, Next.js 16 ve ilgili ekosistemle uyumludur; framework davranışı için `node_modules/next/dist/docs/` altındaki güncel dokümantasyona bakın (`AGENTS.md` yönlendirmesi).
- Üretim ortamında `NEXTAUTH_URL` ve `DATABASE_URL` değerlerini gerçek domain ve veritabanına göre güncelleyin; `AUTH_SECRET`’i asla repoya commit etmeyin.

## Lisans

Özel proje (`"private": true`).
