"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, LogIn, Menu } from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { landingHeaderNavItems } from "./landing-header-nav-items";

export function LandingHeaderMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Menüyü aç"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-accent hover:text-foreground max-lg:sm:h-10 max-lg:sm:w-10 xl:hidden"
        >
          <Menu className="h-5 w-5 max-lg:sm:h-6 max-lg:sm:w-6" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="landing-mobile-nav-sheet w-[88vw] max-w-sm gap-0 border-l border-border/60 bg-background/95 p-0 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-500/12" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-emerald-600/10 blur-3xl dark:bg-emerald-600/8" />
        </div>

        <SheetHeader className="border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
          <SheetTitle asChild>
            <SheetClose asChild>
              <Link
                href="/"
                className="inline-flex w-fit items-center"
                aria-label="Anasayfa"
              >
                <BrandLockup variant="landing" />
              </Link>
            </SheetClose>
          </SheetTitle>
          <SheetDescription className="text-xs">
            Sayfa bölümlerine hızlı erişim
          </SheetDescription>
        </SheetHeader>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4 sm:px-4"
          aria-label="Bölüm navigasyonu"
        >
          <ul className="flex flex-col gap-1">
            {landingHeaderNavItems.map(({ Icon, ...item }) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:hover:bg-emerald-500/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-emerald-700 transition-colors group-hover:border-emerald-500/40 group-hover:bg-emerald-500/12 group-hover:text-emerald-700 dark:text-emerald-300 dark:group-hover:text-emerald-200">
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-300"
                      aria-hidden
                    />
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-border/60 bg-muted/30 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-2.5">
            <SheetClose asChild>
              <Link
                href="/kayit"
                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-600 dark:shadow-emerald-950/50"
              >
                10 Gün Premium Dene
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/giris"
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-4 text-sm font-semibold text-foreground transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                <LogIn className="h-4 w-4 opacity-80" aria-hidden />
                Giriş yap
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
