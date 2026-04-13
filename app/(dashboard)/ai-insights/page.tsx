"use client";

import { useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { sectionsFromMarkdown } from "@/lib/ai-insights-parse";
import { messageFromAiAnalyzeError } from "@/lib/ai-insights-errors";
import { AiInsightsHero } from "@/components/ai-insights/ai-insights-hero";
import { AiInsightsRunControls } from "@/components/ai-insights/ai-insights-run-controls";
import { AiInsightsLoadingSkeleton } from "@/components/ai-insights/ai-insights-loading-skeleton";
import { AiInsightsSections } from "@/components/ai-insights/ai-insights-sections";

export default function AiInsightsPage() {
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <AiInsightsHero />

      <AiInsightsRunControls
        hasResult={markdown != null}
        loading={loading}
        error={error}
        onRun={run}
      />

      {loading ? <AiInsightsLoadingSkeleton /> : null}

      {!loading && sections.length > 0 ? (
        <AiInsightsSections sections={sections} />
      ) : null}
    </div>
  );
}
