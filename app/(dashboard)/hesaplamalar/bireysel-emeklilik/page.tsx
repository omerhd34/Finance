import Link from "next/link";
import { ArrowLeft, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrivatePensionForm } from "@/components/calculations/private-pension-form";

export default function PrivatePensionCalculationPage() {
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
            <PiggyBank className="h-3.5 w-3.5" aria-hidden />
            Bireysel Emeklilik Hesa
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            BES birikiminizi ve net ele geçecek tutarı hesaplayın
          </h1>
          <p className="mt-2 max-w-6xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Aylık katkı paylarına otomatik{" "}
            <strong className="font-semibold text-foreground/85">
              %25 devlet katkısı
            </strong>{" "}
            eklenir (yıllık brüt asgari ücretin %25&apos;i ile sınırlı). Çıkış
            senaryosu girilen{" "}
            <strong className="font-semibold text-foreground/85">yaş</strong> ve{" "}
            <strong className="font-semibold text-foreground/85">
              emeklilik yaşına
            </strong>{" "}
            göre otomatik belirlenir; stopaj sadece fon getirisinden alınır (%15
            / %10 / %5).
          </p>
        </div>
      </div>

      <PrivatePensionForm />
    </div>
  );
}
