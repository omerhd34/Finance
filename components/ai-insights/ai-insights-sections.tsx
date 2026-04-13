import type { AiInsightSection } from "@/lib/ai-insights-parse";
import { AiInsightsSectionCard } from "@/components/ai-insights/ai-insights-section-card";

type Props = {
  sections: AiInsightSection[];
};

export function AiInsightsSections({ sections }: Props) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-5">
      {sections.map((section, i) => (
        <AiInsightsSectionCard
          key={`${section.title}-${i}`}
          section={section}
        />
      ))}
    </div>
  );
}
