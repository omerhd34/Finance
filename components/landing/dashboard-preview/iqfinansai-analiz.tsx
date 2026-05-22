import { CheckCircle2, Download, FileText, Sparkles } from "lucide-react";
import {
  PreviewBadge,
  PreviewCard,
  PreviewDisabledButton,
  PreviewPageHeader,
} from "@/components/landing/dashboard-preview/shared";

const KEY_FINDINGS = [
  {
    id: "kf1",
    text: "Market harcamaların bu ay önceki 3 aylık ortalamaya göre %18 azaldı.",
    tone: "success" as const,
  },
  {
    id: "kf2",
    text: "Tasarruf oranın %60'a yükseldi; hedef bandın olan %55 üstünde.",
    tone: "success" as const,
  },
  {
    id: "kf3",
    text: "Abonelik kategorisinde tekrarlayan 2 küçük üyelik gereksiz görünüyor.",
    tone: "warning" as const,
  },
  {
    id: "kf4",
    text: "Konut kredisi taksiti, aylık gelirinin %26'sını tutuyor.",
    tone: "info" as const,
  },
];

const RECOMMENDATIONS = [
  "Abonelik kalemlerini gözden geçirerek aylık ~₺320 tasarruf sağlayabilirsin.",
  "Tasarruf oranını %60'tan %65'e çıkarmak için ulaşım giderini %10 daralt.",
  "Borçların 3 ay içinde kapatılabilir; ek ödeme yaparak faiz yükünü azalt.",
];

export function IQfinansAIAnalizPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={Sparkles}
        title="IQfinansAI Analiz Raporu"
        description="Yapay zekâ tüm gelir-gider verilerini analiz ederek kişiselleştirilmiş rapor hazırlar."
        badge={
          <PreviewDisabledButton>
            <Download className="h-3 w-3" aria-hidden />
            PDF Olarak Dışa Aktar
          </PreviewDisabledButton>
        }
      />

      <PreviewCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <PreviewBadge tone="success">Mali denge güçlü</PreviewBadge>
          <PreviewBadge tone="info">Tasarruf oranı %60</PreviewBadge>
          <PreviewBadge tone="warning">2 optimizasyon önerisi</PreviewBadge>
        </div>

        <h4 className="mt-4 text-sm font-semibold text-foreground sm:text-base">
          Yönetici Özeti
        </h4>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Son 6 aylık verilerine göre{" "}
          <strong className="text-foreground">finansal sağlık skorun 81</strong>{" "}
          ile iyi seviyede. Aylık ortalama tasarruf oranın %38&apos;den{" "}
          <strong className="text-foreground">%60&apos;a yükselmiş</strong>; bu
          olumlu trendi sürdürmek için harcama dağılımında küçük optimizasyonlar
          yapman yeterli. Borç yükün kontrollü görünüyor, yatırım portföyünde
          net pozitif yön sürmekte.
        </p>

        <h4 className="mt-5 text-sm font-semibold text-foreground sm:text-base">
          Öne Çıkan Bulgular
        </h4>
        <ul className="mt-2 space-y-2">
          {KEY_FINDINGS.map((kf) => (
            <li key={kf.id} className="flex items-start gap-2.5">
              <PreviewBadge tone={kf.tone}>
                <CheckCircle2 className="h-3 w-3" aria-hidden />
              </PreviewBadge>
              <p className="text-[13px] leading-relaxed text-foreground">
                {kf.text}
              </p>
            </li>
          ))}
        </ul>

        <h4 className="mt-5 text-sm font-semibold text-foreground sm:text-base">
          Eylem Önerileri
        </h4>
        <ol className="mt-2 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          {RECOMMENDATIONS.map((rec, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {i + 1}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <FileText
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <p className="text-[11px] text-muted-foreground">
            Rapor IQfinansAI tarafından{" "}
            <strong className="text-foreground">22 Mayıs 2026</strong> tarihinde
            oluşturuldu · 6 aylık veri penceresi.
          </p>
        </div>
      </PreviewCard>
    </div>
  );
}
