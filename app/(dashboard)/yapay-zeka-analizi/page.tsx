"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/client/api-client";
import { downloadAiInsightsPdf } from "@/lib/ai/ai-insights-export";
import { sectionsFromMarkdown } from "@/lib/ai/ai-insights-parse";
import { messageFromAiAnalyzeError } from "@/lib/ai/ai-insights-errors";
import { AI_ASSISTANT_PAGE_PATH } from "@/lib/ai/ai-insights-tabs";
import { AiAnalizHero } from "@/components/ai-insights/ai-insights-hero";
import { AiInsightsExportDropdown } from "@/components/ai-insights/ai-insights-export-dropdown";
import { AiInsightsHistoryDialog } from "@/components/ai-insights/ai-insights-history-dialog";
import { AiInsightsRunControls } from "@/components/ai-insights/ai-insights-run-controls";
import { AiInsightsLoadingSkeleton } from "@/components/ai-insights/ai-insights-loading-skeleton";
import { AiRemainingUsageChip } from "@/components/ai-insights/ai-remaining-usage-chip";
import { AiInsightsSections } from "@/components/ai-insights/ai-insights-sections";
import { PremiumPlanNotice } from "@/components/premium/premium-plan-notice";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { normalizePlanTier } from "@/lib/premium/plan-tier";

function LegacyAssistantTabRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("tab") === "sohbet") {
      router.replace(AI_ASSISTANT_PAGE_PATH);
    }
  }, [router, searchParams]);
  return null;
}

function AiAnalizPage() {
  const { data: session, status } = useSession();
  const planPremium = normalizePlanTier(session?.user?.planTier) === "premium";

  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(
    null,
  );
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!planPremium) {
      setUsageLoading(false);
      return () => {
        mounted = false;
      };
    }
    async function loadUsage() {
      setUsageLoading(true);
      try {
        const { data } = await apiClient.get<{
          remainingQuestions: number;
          remainingAnalyses: number;
        }>("/api/ai/usage");
        if (!mounted) return;
        setRemainingAnalyses(data.remainingAnalyses);
      } catch {
        if (!mounted) return;
        setRemainingAnalyses(0);
      } finally {
        if (mounted) setUsageLoading(false);
      }
    }
    void loadUsage();
    return () => {
      mounted = false;
    };
  }, [planPremium]);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<{ markdown: string }>(
        "/api/ai/analyze",
      );
      setMarkdown(data.markdown);
      setRemainingAnalyses((prev) =>
        prev == null ? prev : Math.max(0, prev - 1),
      );
    } catch (err) {
      setError(messageFromAiAnalyzeError(err));
    } finally {
      setLoading(false);
    }
  }

  const sections = useMemo(
    () => (markdown ? sectionsFromMarkdown(markdown) : []),
    [markdown],
  );

  async function exportPdf() {
    if (sections.length === 0) return;
    setExporting("pdf");
    try {
      await downloadAiInsightsPdf(sections);
    } finally {
      setExporting(null);
    }
  }

  const premiumAiPerks = [
    "Son 30 günlük işlemlerinizin kategori ve tutar bazında yapay zekâ ile yorumlanması",
    "Kayıtlı borç ve alacaklarınızın aynı raporda özetlenmesi ve ödeme / tahsilat önceliği önerileri",
    "Somut tasarruf maddeleri ve bir sonraki ay için bütçe çerçevesi metni",
    "Tek tıkla yeni analiz; sonuçlar başlıklar ve paragraflar halinde Markdown olarak sunulur.",
    "Ayrı menüden IQfinansAI Asistanı ile serbest soru–cevap (finans sorularında kayıtlarınıza dayanır)",
    "Yeni işlem formunda Premium ile sesli açıklama (tarayıcı destekliyse)",
  ];

  const pageReady = status !== "loading" && (!planPremium || !usageLoading);

  return (
    <DataLoadingShell ready={pageReady}>
      {!planPremium ? (
        <div className="space-y-6">
          <AiAnalizHero />
          <div className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              Premium ile neler kazanırsınız?
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {premiumAiPerks.map((line) => (
                <li key={line} className="flex gap-3">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/90"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <PremiumPlanNotice title="IQfinansAI Analiz Premium plandadır." />
        </div>
      ) : (
        <div className="space-y-8">
          <AiAnalizHero />

          <AiInsightsRunControls
            hasResult={markdown != null}
            loading={loading}
            error={error}
            onRun={run}
            planLocked={false}
            secondaryAction={
              <>
                {sections.length > 0 ? (
                  <AiInsightsExportDropdown
                    exporting={exporting}
                    onExportPdf={exportPdf}
                  />
                ) : null}
                <AiInsightsHistoryDialog
                  disabled={loading || exporting !== null}
                  onSelect={(md) => {
                    setMarkdown(md);
                    setError(null);
                  }}
                />
                <AiRemainingUsageChip
                  mode="analyses"
                  remaining={remainingAnalyses}
                  loading={usageLoading}
                />
              </>
            }
          />

          {loading ? <AiInsightsLoadingSkeleton /> : null}

          {!loading && sections.length > 0 ? (
            <AiInsightsSections sections={sections} />
          ) : null}
        </div>
      )}
    </DataLoadingShell>
  );
}

export default function AiAnalizPageWithLegacyRedirect() {
  return (
    <>
      <Suspense fallback={null}>
        <LegacyAssistantTabRedirect />
      </Suspense>
      <AiAnalizPage />
    </>
  );
}
