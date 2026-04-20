import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { AiInsightSection } from "@/lib/ai-insights-parse";
import type { AiInsightAccentVariant } from "@/components/ai-insights/ai-insights-section-style";
import { aiInsightsMarkdownComponents } from "@/components/ai-insights/ai-insights-markdown-components";

type Props = {
  section: AiInsightSection;
  variant: AiInsightAccentVariant;
  Icon: LucideIcon;
  listIndex: number;
};

export function AiInsightsSectionCard({
  section,
  variant,
  Icon,
  listIndex,
}: Props) {
  const hasBody = section.body.trim() !== "";
  const [open, setOpen] = useState(false);
  const triggerId = `ai-insight-trigger-${listIndex}`;
  const panelId = `ai-insight-body-${listIndex}`;

  const titleClass =
    "min-w-0 flex-1 text-left text-base font-semibold leading-snug tracking-tight md:text-lg";

  const headerInnerButton = (
    <>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          variant.iconWrap,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span className={titleClass}>{section.title}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
          open && "rotate-180",
        )}
        aria-hidden
      />
    </>
  );

  const headerInnerStatic = (
    <>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          variant.iconWrap,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <CardTitle className="min-w-0 flex-1 text-base font-semibold leading-snug md:text-lg">
        {section.title}
      </CardTitle>
    </>
  );

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-card/95 shadow-md transition-shadow duration-300 hover:shadow-lg",
        "border-l-4 bg-linear-to-br from-card to-card/80",
        variant.accent,
      )}
    >
      {hasBody ? (
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-4 p-6 text-left outline-none transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          id={triggerId}
        >
          {headerInnerButton}
        </button>
      ) : (
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          {headerInnerStatic}
        </CardHeader>
      )}
      {hasBody && open ? (
        <CardContent
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className={cn(
            "border-t border-border/40 px-6 pb-5 pt-4 prose prose-invert max-w-none prose-sm leading-7 text-muted-foreground md:prose-base prose-headings:font-semibold prose-headings:text-foreground prose-strong:font-semibold prose-strong:text-foreground prose-p:mb-3 prose-p:mt-0 prose-p:last:mb-0 prose-headings:mb-3 prose-headings:mt-6 first:prose-headings:mt-0 prose-hr:my-6 prose-hr:border-border [&>*:last-child]:mb-0",
            variant.proseMarkers,
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={aiInsightsMarkdownComponents}
          >
            {section.body}
          </ReactMarkdown>
        </CardContent>
      ) : null}
    </Card>
  );
}
