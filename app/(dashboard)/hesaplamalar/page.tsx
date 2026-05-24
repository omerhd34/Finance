import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Calculator,
  ChartNoAxesCombined,
  PiggyBank,
  ReceiptText,
  Target,
  WalletCards,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const calculationTools = [
  {
    title: "Faiz",
    description:
      "Basit faiz, bileşik faiz ve vadeli mevduat senaryolarını tek sayfada hesaplayın.",
    href: "/hesaplamalar/faiz",
    icon: BadgePercent,
  },
  {
    title: "Kredi Taksit",
    description:
      "İhtiyaç, konut ve taşıt kredileri için KKDF + BSMV dahil aylık taksiti hesaplayın.",
    href: "/hesaplamalar/kredi",
    icon: WalletCards,
  },
  {
    title: "KDV",
    description:
      "KDV dahil ve hariç tutarları farklı oranlara göre hızlıca hesaplayın.",
    href: "/hesaplamalar/kdv",
    icon: ReceiptText,
  },
  {
    title: "Birikim Hedefi",
    description:
      "Hedef tutara ulaşmak için aylık ne kadar birikim gerektiğini görün.",
    href: "/hesaplamalar/birikim",
    icon: Target,
  },
  {
    title: "Enflasyon",
    description:
      "İki dönem arasındaki tutar eşdeğerini resmi TÜFE endeksine göre hesaplayın.",
    href: "/hesaplamalar/enflasyon",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Bireysel Emeklilik",
    description:
      "BES katkı payı, %25 devlet katkısı ve stopaj dahil net birikiminizi hesaplayın.",
    href: "/hesaplamalar/bireysel-emeklilik",
    icon: PiggyBank,
  },
] as const;

export default function CalculationsPage() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-primary/[0.07] via-card to-card/90 p-6 shadow-sm md:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
            <Calculator className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Hesaplamalar
            </h1>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
              <p>
                Günlük finans kararlarında ihtiyaç duyduğunuz{" "}
                <span className="font-medium text-foreground/85">
                  faiz, kredi, vergi ve birikim
                </span>{" "}
                hesaplamalarını tek sayfadan başlatın; her araç bağımsız bir
                forma sahiptir.
              </p>
              <p>
                Tüm hesaplamalar anında çalışır. Banka kampanyaları ve mevzuat
                değişiklikleri nihai tutarı etkileyebilir.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {calculationTools.map(({ title, description, href, icon: Icon }) => {
          const content = (
            <Card className="h-full overflow-hidden border-emerald-600/15 bg-card/90 transition-all hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-[0_16px_40px_rgba(16,185,129,0.10)] dark:border-emerald-500/14 dark:hover:border-emerald-400/30">
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {href ? "Hesapla" : "Hazırlanıyor"}
                  {href && <ArrowRight className="h-4 w-4" />}
                </div>
              </CardContent>
            </Card>
          );

          if (!href) {
            return (
              <div key={title} className="opacity-75">
                {content}
              </div>
            );
          }

          return (
            <Link key={title} href={href} className="block">
              {content}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
