import Link from "next/link";
import {
  ArrowRightLeft,
  Bell,
  Brain,
  HandCoins,
  LineChart,
  Repeat,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { LandingHeaderThemeToggle } from "@/components/landing/landing-header-theme-toggle";

const ASIDE_HIGHLIGHTS = [
  {
    icon: Wallet,
    title: "Tek bakışta finans",
    description: "Gelir, gider ve net bakiyeni anında gör.",
  },
  {
    icon: LineChart,
    title: "Yatırım takibi",
    description: "Altın, döviz ve kripto fiyatları canlı.",
  },
  {
    icon: Repeat,
    title: "Tekrarlayan hareketler",
    description: "Kira, fatura ve abonelikler otomatik.",
  },
  {
    icon: Brain,
    title: "IQfinansAI asistan",
    description: "Yapay zekâ destekli akıllı analiz.",
  },
  {
    icon: HandCoins,
    title: "Borç & alacak",
    description: "Kime borçlusun, kim sana borçlu — net.",
  },
  {
    icon: Target,
    title: "Bütçe & hedefler",
    description: "Aylık limit koy, hedefine bilinçli ilerle.",
  },
  {
    icon: Bell,
    title: "Akıllı bildirimler",
    description: "Yaklaşan ödeme ve uyarıları kaçırma.",
  },
  {
    icon: ArrowRightLeft,
    title: "Kur dönüşüm",
    description: "TL, USD, EUR ve altın hesabı saniyede.",
  },
] as const;

type AuthSplitStep = {
  number: number;
  label: string;
  active?: boolean;
};

type AuthSplitShellProps = {
  children: React.ReactNode;
  asideTitle: string;
  asideDescription: React.ReactNode;
  asideSteps: AuthSplitStep[];
  asideBadge?: string;
};

export function AuthSplitShell({
  children,
  asideTitle,
  asideDescription,
  asideSteps,
  asideBadge,
}: AuthSplitShellProps) {
  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-background">
      <div className="flex h-full w-full min-h-0 flex-col overflow-y-auto lg:w-1/2">
        <header className="flex shrink-0 items-center justify-between gap-3 px-6 pt-6 sm:px-10 sm:pt-8">
          <Link href="/" aria-label="IQfinansAI anasayfa" className="shrink-0">
            <BrandLockup variant="landing" />
          </Link>
          <LandingHeaderThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10 sm:py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      <aside
        aria-hidden
        className="relative hidden h-full w-1/2 overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-800 to-emerald-950 lg:block"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
        </div>

        <div className="relative flex h-full min-h-0 flex-col px-12 py-10 text-white xl:px-16 xl:py-12">
          <div className="space-y-6 shrink-0">
            {asideBadge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                {asideBadge}
              </span>
            )}

            <div className="space-y-4">
              <h2 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight xl:text-4xl">
                {asideTitle}
              </h2>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/85 xl:text-base">
                {asideDescription}
              </p>
            </div>

            <ol className="space-y-3">
              {asideSteps.map((step) => (
                <li
                  key={step.number}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      step.active
                        ? "bg-white text-emerald-800"
                        : "border border-white/30 bg-white/10 text-white/80"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={
                      step.active ? "font-medium text-white" : "text-white/70"
                    }
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <ul className="mt-8 grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2">
            {ASIDE_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/6 p-3.5 backdrop-blur-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12 text-white">
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
