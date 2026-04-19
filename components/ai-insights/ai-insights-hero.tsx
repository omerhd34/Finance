import { Sparkles } from "lucide-react";

export function AiInsightsHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-primary/[0.07] via-card to-card/90 p-6 shadow-sm md:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
          <Sparkles className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            AI finans analizi
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Son 30 günlük gider işlemleriniz ile defterinizdeki borç ve alacak
            kayıtları birlikte değerlendirilir. Analiz tamamlandığında yapay
            zekâ; genel değerlendirme, kategori yorumları, tasarruf önerileri,
            gelecek ay için bütçe çerçevesi ve borç/alacak özeti içeren tek bir
            Türkçe Markdown rapor üretir.
          </p>
        </div>
      </div>
    </div>
  );
}
