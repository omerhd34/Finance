import Link from "next/link";
import { LogIn } from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { LandingHeaderThemeToggle } from "@/components/landing/landing-header-theme-toggle";
import { LandingHeaderMobileNav } from "@/components/landing/landing-header-mobile-nav";
import { landingHeaderNavItems } from "./landing-header-nav-items";

const loginLinkClass =
  "hidden h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-slate-300/90 bg-white/50 px-2.5 text-xs font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-emerald-500/65 hover:bg-emerald-500/15 hover:text-emerald-900 sm:gap-1.5 sm:px-4 sm:text-sm lg:inline-flex lg:h-9 dark:border-white/50 dark:bg-white/95 dark:text-zinc-900 dark:hover:border-emerald-400/60 dark:hover:bg-emerald-50 dark:hover:text-emerald-950";

const signupLinkClass =
  "hidden h-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 px-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-600 sm:px-5 sm:text-sm lg:inline-flex lg:h-9 dark:shadow-emerald-950/50";

const sectionLinkClass =
  "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-700 xl:px-4 dark:hover:text-emerald-300";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/60 bg-slate-100/95 backdrop-blur-xl dark:bg-[#050507]/95">
      <div className="mx-auto flex h-14 w-full max-w-7xl flex-col items-center justify-between px-4 sm:h-16 sm:flex-row xl:px-0">
        <div className="flex h-full w-full items-center justify-between gap-3 lg:gap-6">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            <BrandLockup variant="landing" />
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-2 lg:flex xl:gap-4"
            aria-label="Bölüm navigasyonu"
          >
            {landingHeaderNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={sectionLinkClass}
                title={item.label}
              >
                {item.shortLabel}
              </Link>
            ))}
          </nav>

          <nav
            className="flex items-center gap-2.25 sm:gap-3"
            aria-label="Giriş navigasyonu"
          >
            <Link href="/giris" className={loginLinkClass}>
              <LogIn
                className="hidden h-3.5 w-3.5 opacity-80 sm:block sm:h-4 sm:w-4"
                aria-hidden
              />
              Giriş
            </Link>
            <Link href="/kayit" className={signupLinkClass}>
              Kayıt ol
            </Link>
            <LandingHeaderThemeToggle />
            <LandingHeaderMobileNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
