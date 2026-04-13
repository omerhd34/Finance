import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AiInsightSection } from "@/lib/ai-insights-parse";
import { sectionIconAndAccent } from "@/components/ai-insights/ai-insights-section-style";
import { aiInsightsMarkdownComponents } from "@/components/ai-insights/ai-insights-markdown-components";

type Props = {
  section: AiInsightSection;
};

export function AiInsightsSectionCard({ section }: Props) {
  const { Icon, accent, iconWrap } = sectionIconAndAccent(section.title);
  const hasBody = section.body.trim() !== "";

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-card/95 shadow-md transition-shadow duration-300 hover:shadow-lg",
        "border-l-4 bg-linear-to-br from-card to-card/80",
        accent,
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center gap-4 space-y-0",
          hasBody ? "pb-3" : "pb-4",
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconWrap,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold leading-snug md:text-lg">
            {section.title}
          </CardTitle>
        </div>
      </CardHeader>
      {hasBody && (
        <CardContent className="px-6 pb-5 pt-0 prose prose-invert max-w-none prose-sm leading-7 text-muted-foreground md:prose-base prose-headings:text-foreground prose-strong:text-foreground prose-p:mb-3 prose-p:mt-0 prose-p:last:mb-0 prose-headings:mb-3 prose-headings:mt-6 first:prose-headings:mt-0 prose-hr:my-6 prose-hr:border-border [&>*:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={aiInsightsMarkdownComponents}
          >
            {section.body}
          </ReactMarkdown>
        </CardContent>
      )}
    </Card>
  );
}
