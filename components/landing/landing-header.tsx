import Link from "next/link";
import { LogIn } from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { LandingHeaderThemeToggle } from "@/components/landing/landing-header-theme-toggle";

const loginLinkClass =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-slate-300/90 bg-white/50 px-2.5 text-xs font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-emerald-500/65 hover:bg-emerald-500/15 hover:text-emerald-900 sm:h-9 sm:gap-1.5 sm:px-4 sm:text-sm dark:border-white/50 dark:bg-white/95 dark:text-zinc-900 dark:hover:border-emerald-400/60 dark:hover:bg-emerald-50 dark:hover:text-emerald-950";

const signupLinkClass =
  "inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 px-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-600 sm:h-9 sm:px-5 sm:text-sm dark:shadow-emerald-950/50";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/60 bg-slate-100/95 backdrop-blur-xl dark:bg-[#050507]/95">
      <div className="mx-auto flex h-14 w-full max-w-7xl flex-col items-center justify-between px-4 sm:h-16 sm:flex-row xl:px-0">
        <div className="flex h-full w-full items-center justify-between">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            <BrandLockup variant="landing" />
          </Link>
          <nav
            className="flex items-center gap-2.25 sm:gap-3"
            aria-label="Giriş navigasyonu"
          >
            <LandingHeaderThemeToggle />
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
          </nav>
        </div>
      </div>
    </header>
  );
}
