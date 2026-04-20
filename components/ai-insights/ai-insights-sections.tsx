import { useMemo } from "react";
import type { AiInsightSection } from "@/lib/ai-insights-parse";
import { AiInsightsSectionCard } from "@/components/ai-insights/ai-insights-section-card";
import {
  accentVariantAt,
  type AiInsightAccentVariant,
  sectionIcon,
} from "@/components/ai-insights/ai-insights-section-style";

type Props = {
  sections: AiInsightSection[];
};

export function AiInsightsSections({ sections }: Props) {
  const variants = useMemo(
    () =>
      sections.reduce<AiInsightAccentVariant[]>((acc, _, i) => {
        const prevKey = i === 0 ? null : acc[i - 1]!.key;
        acc.push(accentVariantAt(i, prevKey));
        return acc;
      }, []),
    [sections],
  );

  if (sections.length === 0) return null;

  return (
    <div className="space-y-5">
      {sections.map((section, i) => (
        <AiInsightsSectionCard
          key={`${section.title}-${i}`}
          listIndex={i}
          section={section}
          variant={variants[i]!}
          Icon={sectionIcon(section.title)}
        />
      ))}
    </div>
  );
}
