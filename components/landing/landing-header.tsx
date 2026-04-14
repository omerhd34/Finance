import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#09090b]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-tight text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400/20 to-emerald-600/10 ring-1 ring-emerald-500/20 transition group-hover:ring-emerald-500/40">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden />
          </span>
          FinansIQ
        </Link>
        <nav
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Ana navigasyon"
        >
          <Button
            variant="ghost"
            asChild
            className="text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <Link href="/login">Giriş</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="landing-cta-primary rounded-full px-5 font-semibold"
          >
            <Link href="/register">Ücretsiz Başla</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
