"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { sectionsFromMarkdown } from "@/lib/ai-insights-parse";
import { messageFromAiAnalyzeError } from "@/lib/ai-insights-errors";
import { AiInsightsHero } from "@/components/ai-insights/ai-insights-hero";
import { AiInsightsRunControls } from "@/components/ai-insights/ai-insights-run-controls";
import { AiInsightsLoadingSkeleton } from "@/components/ai-insights/ai-insights-loading-skeleton";
import { AiInsightsSections } from "@/components/ai-insights/ai-insights-sections";
import { PremiumPlanNotice } from "@/components/premium/premium-plan-notice";
import { normalizePlanTier } from "@/lib/plan-tier";

export default function AiInsightsPage() {
  const { data: session } = useSession();
  const planPremium = normalizePlanTier(session?.user?.planTier) === "premium";

  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<{ markdown: string }>(
        "/api/ai/analyze",
      );
      setMarkdown(data.markdown);
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

  if (!planPremium) {
    const premiumAiPerks = [
      "Son 30 günlük işlemlerinizin kategori ve tutar bazında yapay zekâ ile yorumlanması",
      "Kayıtlı borç ve alacaklarınızın aynı raporda özetlenmesi ve ödeme / tahsilat önceliği önerileri",
      "Somut tasarruf maddeleri ve bir sonraki ay için bütçe çerçevesi metni",
      "Tek tıkla yeni analiz; sonuçlar başlıklar ve paragraflar halinde Markdown olarak sunulur.",
    ];

    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <AiInsightsHero />
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
        <PremiumPlanNotice title="AI Analiz Premium plandadır." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <AiInsightsHero />

      <AiInsightsRunControls
        hasResult={markdown != null}
        loading={loading}
        error={error}
        onRun={run}
        planLocked={false}
      />

      {loading ? <AiInsightsLoadingSkeleton /> : null}

      {!loading && sections.length > 0 ? (
        <AiInsightsSections sections={sections} />
      ) : null}
    </div>
  );
}
