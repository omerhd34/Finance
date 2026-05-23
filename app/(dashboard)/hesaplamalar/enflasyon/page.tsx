import Link from "next/link";
import { ArrowLeft, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InflationForm } from "@/components/calculations/inflation-form";

export default function InflationCalculationPage() {
  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-2/5 bg-linear-to-l from-emerald-500/8 via-emerald-500/3 to-transparent md:block"
          aria-hidden
        />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground md:right-6 md:top-6"
        >
          <Link href="/hesaplamalar">
            <ArrowLeft className="h-3.5 w-3.5" />
            Hesaplamalara dön
          </Link>
        </Button>
        <div className="relative p-6 pl-7 md:p-8 md:pl-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            <LineChart className="h-3.5 w-3.5" aria-hidden />
            Enflasyon
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            İki dönem arasında tutarın eşdeğerini hesaplayın
          </h1>
          <p className="mt-2 max-w-6xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Başlangıç ve bitiş dönemini seçtiğinizde TÜFE endeksine göre tutarın
            günümüz veya başka bir dönemdeki eşdeğeri hesaplanır. Veriler
            statiktir, canlı çekim yapılmaz.
          </p>
        </div>
      </div>

      <InflationForm />
    </div>
  );
}
