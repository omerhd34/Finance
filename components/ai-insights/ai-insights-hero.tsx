import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import {
  AI_ASSISTANT_MAX_MESSAGES_PER_DAY,
  AI_ASSISTANT_STORED_QA_COUNT,
  AI_LONG_REPORT_MAX_PER_DAY,
} from "@/lib/ai/ai-insights-limits";
import {
  AI_ANALIZ_PATH,
  AI_ASSISTANT_PAGE_PATH,
} from "@/lib/ai/ai-insights-tabs";

export function AiAnalizHero() {
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
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            IQfinansAI Analiz
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
            <p>
              Son <span className="font-medium text-foreground/85">30 gün</span>{" "}
              giderleriniz ile güncel{" "}
              <span className="font-medium text-foreground/85">
                borç ve alacak
              </span>{" "}
              kayıtlarınız birlikte okunur; rapor tek bir Türkçe metinde
              özetlenir.
            </p>
            <p>
              Çıktıda genel değerlendirme, kategori yorumları, tasarruf
              önerileri, bir sonraki dönem için bütçe çerçevesi ve borç/alacak
              özeti yer alır. Premium planda geçmiş raporlara dönüp PDF olarak
              dışa aktarabilirsiniz. Günde en fazla{" "}
              <span className="font-medium text-foreground/85">
                {AI_LONG_REPORT_MAX_PER_DAY}
              </span>{" "}
              kez yeni analiz başlatabilirsiniz.
            </p>
            <p>
              Soru–cevap ve günlük sohbet için{" "}
              <Link
                href={AI_ASSISTANT_PAGE_PATH}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                IQfinansAI Asistanı
              </Link>{" "}
              sayfasına geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiAssistantHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-primary/[0.07] via-card to-card/90 p-6 shadow-sm md:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
          <MessageCircle className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            IQfinansAI Asistanı
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
            <p>
              Kayıtlı verilerinize göre serbest sorular sorarsınız; her cevapta
              sunucu güncel işlem ve borç/alacak özetinizi yeniden yükler.
            </p>
            <p>
              Günde en fazla{" "}
              <span className="font-medium text-foreground/85">
                {AI_ASSISTANT_MAX_MESSAGES_PER_DAY}
              </span>{" "}
              mesaj gönderebilirsiniz. Aynı ekrandan{" "}
              <span className="font-semibold text-foreground/90">
                Özeti kopyala
              </span>{" "}
              ile kısa finans özetini panoya alabilirsiniz;{" "}
              <span className="font-medium text-foreground/85">
                Son {AI_ASSISTANT_STORED_QA_COUNT} Soru
              </span>{" "}
              ile son tamamlanmış soru–cevaplarınıza dönebilirsiniz.
            </p>
            <p>
              Başlıklı tam analiz raporu için{" "}
              <Link
                href={AI_ANALIZ_PATH}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                IQfinansAI Analiz
              </Link>{" "}
              sayfasını kullanın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
