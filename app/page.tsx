import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Globe,
  HandCoins,
  PieChart,
  Shield,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Gelir & gider takibi",
    desc: "Tüm hareketlerinizi tek yerden kaydedin ve raporlayın.",
    icon: BarChart3,
  },
  {
    title: "AI analiz",
    desc: "Yapay zekâ ile son 30 gününüzü yorumlayın ve öneriler alın.",
    icon: Bot,
  },
  {
    title: "Hedef belirleme",
    desc: "Tasarruf hedeflerinizi takip edin, ilerlemenizi görün.",
    icon: Target,
  },
  {
    title: "Borç & Alacak",
    desc: "Size borçlu olanları ve sizin borçlarınızı kaydedin, ödemeleri takip edin.",
    icon: HandCoins,
  },
  {
    title: "Grafikler",
    desc: "Aylık trend ve kategori dağılımını Recharts ile görselleştirin.",
    icon: PieChart,
  },
  {
    title: "Çoklu kategori",
    desc: "Harcama ve gelir için hazır kategori setleri.",
    icon: Shield,
  },
  {
    title: "Çoklu para birimi",
    desc: "TL, USD, EUR ve GBP desteği; ayarlardan seçin.",
    icon: Globe,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f0f] text-foreground">
      <header className="border-b border-border/60 bg-[#0f0f0f]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold tracking-tight text-white">
            FinansIQ
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-zinc-300">
              <Link href="/login">Giriş</Link>
            </Button>
            <Button
              asChild
              className="bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90"
            >
              <Link href="/register">Ücretsiz Başla</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border/40 bg-linear-to-b from-[#0f0f0f] to-background px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Paranı Akıllıca Yönet
            </h1>
            <p className="mt-4 text-lg text-zinc-400 md:text-xl">
              FinansIQ ile gelir ve giderlerinizi takip edin, hedefler koyun ve
              yapay zekâ destekli önerilerle tasarruf edin.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="bg-[#22c55e] px-8 text-primary-foreground hover:bg-[#22c55e]/90"
              >
                <Link href="/register">
                  Ücretsiz Başla
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-[#2a2a2a]">
                <Link href="/login">Zaten hesabım var</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">
            Özellikler
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-400">
            Kişisel finansınız için ihtiyacınız olan araçlar.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-[#2a2a2a] bg-[#111111] text-white"
              >
                <CardHeader>
                  <f.icon className="h-8 w-8 text-[#22c55e]" />
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {f.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border/40 bg-background px-4 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <Card className="border-[#2a2a2a] bg-[#111111]">
              <CardHeader>
                <CardTitle className="text-white">Ücretsiz</CardTitle>
                <CardDescription className="text-zinc-400">
                  Temel takip ve raporlama
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold text-white">
                  ₺0
                  <span className="text-base font-normal text-zinc-500">
                    /ay
                  </span>
                </p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    Sınırsız işlem kaydı
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    Grafikler ve hedefler
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    Çoklu para birimi
                  </li>
                </ul>
                <Button asChild className="mt-4 w-full bg-zinc-800 text-white">
                  <Link href="/register">Başla</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-[#22c55e]/40 bg-[#111111] ring-1 ring-[#22c55e]/30">
              <CardHeader>
                <CardTitle className="text-white">Pro</CardTitle>
                <CardDescription className="text-zinc-400">
                  AI destekli derin analiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold text-white">
                  Yakında
                  <span className="ml-2 text-base font-normal text-zinc-500">
                    özel fiyat
                  </span>
                </p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    Ücretsiz plandaki her şey
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    Yapay zekâ ile kişiselleştirilmiş AI analizi
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    Öncelikli yeni özellikler
                  </li>
                </ul>
                <Button
                  asChild
                  className="mt-4 w-full bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90"
                >
                  <Link href="/register">Listeye katıl</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-[#0f0f0f] py-10 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} FinansIQ. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
