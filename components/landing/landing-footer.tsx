/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronUp, Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function FooterBackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Yukarı çık"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-xl md:right-8"
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
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
      <h3 className="text-xs font-bold uppercase leading-none tracking-[0.18em] text-zinc-200">
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
        className="inline-flex text-sm leading-snug text-zinc-400 transition hover:text-emerald-400"
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
    <footer className="relative border-t border-white/5 bg-[#0a0f1a] text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 md:pt-16">
        <div className="grid w-full grid-cols-1 gap-12 sm:gap-x-10 lg:grid-cols-3 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div className="min-w-0 lg:pt-0.5">
            <Link
              href="/"
              className="inline-flex items-baseline text-xl font-bold leading-none tracking-tight"
            >
              <span className="bg-linear-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                IQ
              </span>
              <span className="text-zinc-100">finans</span>
              <span className="ml-1.5 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-1.5 py-0.5 text-[0.55em] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
                AI
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-500 lg:max-w-none">
              Gelir ve giderlerinizi tek yerden yönetin; bütçe, borç ve
              hedeflerinizi izleyin. Yapay zekâ destekli özetlerle finansal
              resminizi netleştirin.
            </p>
          </div>

          <FooterColumn title="Kurumsal">
            <FooterLink href="/hakkimizda">Hakkımızda</FooterLink>
            <FooterLink href="/gizlilik-politikasi">
              Gizlilik Politikası
            </FooterLink>
            <FooterLink href="/kullanim-kosullari">
              Kullanım Koşulları
            </FooterLink>
            <FooterLink href="/mesafeli-satis-sozlesmesi">
              Mesafeli Satış Sözleşmesi
            </FooterLink>
            <FooterLink href="/cerez-politikasi">Çerez Politikası</FooterLink>
          </FooterColumn>

          <FooterColumn title="Hesabım ve Destek">
            <FooterLink href="/login">Giriş Yap</FooterLink>
            <FooterLink href="/register">Kayıt Ol</FooterLink>
            <FooterLink href="/destek">Destek</FooterLink>
            <FooterLink href="/destek#sss">Sık Sorulan Sorular</FooterLink>
          </FooterColumn>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-4">
          <p className="min-w-0 text-left text-xs text-zinc-500 sm:text-sm">
            © {year}{" "}
            <span className="font-semibold text-zinc-300">IQfinansAI</span>. Tüm
            hakları saklıdır.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!mounted}
              onClick={toggleTheme}
              className={cn(
                "h-9 w-9 rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100",
              )}
              aria-label="Tema değiştir"
              title="Tema değiştir"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <div className="h-4 w-4 rounded-full bg-zinc-600 animate-pulse" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <FooterBackToTop />
    </footer>
  );
}
