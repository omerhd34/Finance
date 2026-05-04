/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronUp, Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/common/utils";
import { BrandLockup } from "../branding/brand-lockup";

const BACK_TO_TOP_REVEAL_AFTER_PX = 72;

function getDocumentScrollTop() {
  if (typeof window === "undefined") return 0;
  return (
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

function FooterBackToTop() {
  const [show, setShow] = useState(false);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
  }, []);

  useEffect(() => {
    const onScroll = () =>
      setShow(getDocumentScrollTop() > BACK_TO_TOP_REVEAL_AFTER_PX);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show || !domReady) return null;

  return createPortal(
    <button
      type="button"
      aria-label="Yukarı çık"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-10 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-xl md:right-8"
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
    </button>,
    document.body,
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col lg:pt-0.5">
      <h3 className="text-xs font-bold uppercase leading-none tracking-[0.18em] text-foreground">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex text-sm leading-snug text-muted-foreground transition hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        {children}
      </Link>
    </li>
  );
}

export function LandingFooter() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-slate-100/95 text-muted-foreground backdrop-blur-xl dark:bg-[#050507]/95">
      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0 pb-10 pt-14 md:pt-16">
        <div className="grid w-full grid-cols-1 gap-12 sm:gap-x-10 lg:grid-cols-5 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div className="min-w-0 lg:col-span-2 lg:pt-0.5">
            <BrandLockup variant="landing" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:max-w-lg lg:max-w-none">
              Gelir ve giderlerinizi tek yerden yönetin; bütçe, borç ve
              hedeflerinizi izleyin. Yapay zekâ destekli özetlerle finansal
              resminizi netleştirin.
            </p>
          </div>

          <FooterColumn title="Kurumsal">
            <FooterLink href="/hakkimizda">Hakkımızda</FooterLink>
            <FooterLink href="/yasal-bilgiler">Yasal bilgiler</FooterLink>
          </FooterColumn>

          <FooterColumn title="Kaynaklar">
            <FooterLink href="/destek">Destek</FooterLink>
            <FooterLink href="/sss">SSS</FooterLink>
          </FooterColumn>

          <FooterColumn title="Üyelik">
            <FooterLink href="/giris">Giriş Yap</FooterLink>
            <FooterLink href="/kayit">Kayıt Ol</FooterLink>
          </FooterColumn>
        </div>

        <Separator className="my-10 bg-border/60" />

        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-4">
          <p className="min-w-0 text-left text-xs text-muted-foreground sm:text-sm">
            © {year}{" "}
            <span className="font-semibold text-foreground">IQfinansAI</span>.
            Tüm hakları saklıdır.
          </p>
          <div className="flex h-11 shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!mounted}
              onClick={toggleTheme}
              className={cn(
                "h-11 w-11 rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer",
              )}
              aria-label="Tema değiştir"
              title="Tema değiştir"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5 rounded-full bg-muted-foreground/30 animate-pulse" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <FooterBackToTop />
    </footer>
  );
}
