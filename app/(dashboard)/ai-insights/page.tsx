"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import axios from "axios";
import {
  type LucideIcon,
  BarChart3,
  CalendarRange,
  HandCoins,
  Lightbulb,
  MessageCircle,
  PieChart,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function textFromNodes(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNodes).join("");
  if (typeof node === "object" && "props" in node) {
    return textFromNodes(
      (node as ReactElement<{ children?: ReactNode }>).props.children,
    );
  }
  return "";
}

function isBlockLikeStrong(label: string): boolean {
  const t = label.trim();
  if (/\(\s*\d[\d.,\s]*\s*TL\s*\)/i.test(t)) return true;
  if (/^[\u201c"]/.test(t) && t.length > 4) return true;
  if (/Kampanyası|Gözden Geçir|Alışkanlığı\s+Edin/i.test(t)) return true;
  return false;
}

const markdownComponents: Components = {
  p({ children }) {
    const t = textFromNodes(children);
    if (!t.trim()) return null;
    return <p>{children}</p>;
  },
  strong({ children }) {
    const label = textFromNodes(children);
    if (!isBlockLikeStrong(label)) {
      return <strong>{children}</strong>;
    }
    return (
      <strong className="mt-5 block scroll-mt-4 font-semibold text-foreground">
        {children}
      </strong>
    );
  },
  ul({ children }) {
    return (
      <ul className="my-3 list-none space-y-2 pl-0 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.55em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-primary/80">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="my-3 list-decimal space-y-2 pl-5 marker:font-medium marker:text-primary">
        {children}
      </ol>
    );
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
};

function normalizeMarkdownBody(raw: string): string {
  return raw
    .trim()
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n+$/g, "");
}

function sectionsFromMarkdown(md: string): { title: string; body: string }[] {
  const trimmed = md.trim();
  if (!trimmed.includes("\n## ") && !trimmed.startsWith("## ")) {
    return [{ title: "AI Analizi", body: normalizeMarkdownBody(trimmed) }];
  }
  const blocks = trimmed.split(/^##\s+/m).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n");
    const title = lines[0]?.trim() ?? "Bölüm";
    const body = normalizeMarkdownBody(lines.slice(1).join("\n"));
    return { title, body };
  });
}

function sectionIconAndAccent(title: string): {
  Icon: LucideIcon;
  accent: string;
  iconWrap: string;
} {
  const t = title.toLowerCase();
  if (/karşılama|merhaba|giriş/.test(t)) {
    return {
      Icon: MessageCircle,
      accent: "border-l-emerald-500/70",
      iconWrap: "bg-emerald-500/15 text-emerald-400",
    };
  }
  if (/genel\s+değerlendirme|özet/.test(t)) {
    return {
      Icon: BarChart3,
      accent: "border-l-sky-500/70",
      iconWrap: "bg-sky-500/15 text-sky-400",
    };
  }
  if (/harcama|kategori/.test(t)) {
    return {
      Icon: PieChart,
      accent: "border-l-violet-500/70",
      iconWrap: "bg-violet-500/15 text-violet-400",
    };
  }
  if (/tasarruf|öneri/.test(t)) {
    return {
      Icon: Lightbulb,
      accent: "border-l-amber-500/70",
      iconWrap: "bg-amber-500/15 text-amber-400",
    };
  }
  if (/bütçe|gelecek\s+ay/.test(t)) {
    return {
      Icon: CalendarRange,
      accent: "border-l-cyan-500/70",
      iconWrap: "bg-cyan-500/15 text-cyan-400",
    };
  }
  if (/borç|alacak/.test(t)) {
    return {
      Icon: HandCoins,
      accent: "border-l-rose-500/70",
      iconWrap: "bg-rose-500/15 text-rose-400",
    };
  }
  return {
    Icon: Sparkles,
    accent: "border-l-primary/70",
    iconWrap: "bg-primary/15 text-primary",
  };
}

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
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error;
        setError(
          typeof msg === "string"
            ? msg
            : "Analiz alınamadı. API anahtarını ve bağlantıyı kontrol edin.",
        );
      } else {
        setError(
          "Analiz alınamadı. API anahtarını ve bağlantıyı kontrol edin.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const sections = markdown ? sectionsFromMarkdown(markdown) : [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
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
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Son 30 günlük giderleriniz ve kayıtlı borç/alacaklarınız yapay
              zekâ ile yorumlanır; aşağıda bölümler halinde özet ve öneriler
              bulunur.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!markdown ? (
          <Button onClick={run} disabled={loading} className="cursor-pointer">
            {loading ? "Analiz ediliyor..." : "Analiz Başlat"}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={run}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Analiz ediliyor..." : "Yeniden Analiz Et"}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="space-y-5">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      )}

      {!loading && sections.length > 0 && (
        <div className="space-y-5">
          {sections.map((s, i) => {
            const { Icon, accent, iconWrap } = sectionIconAndAccent(s.title);
            return (
              <Card
                key={`${s.title}-${i}`}
                className={cn(
                  "overflow-hidden border-border/60 bg-card/95 shadow-md transition-shadow duration-300 hover:shadow-lg",
                  "border-l-4 bg-linear-to-br from-card to-card/80",
                  accent,
                )}
              >
                <CardHeader
                  className={cn(
                    "flex flex-row items-center gap-4 space-y-0",
                    s.body.trim() !== "" ? "pb-3" : "pb-4",
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
                      {s.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                {s.body.trim() !== "" && (
                  <CardContent className="px-6 pb-5 pt-0 prose prose-invert max-w-none prose-sm leading-7 text-muted-foreground md:prose-base prose-headings:text-foreground prose-strong:text-foreground prose-p:mb-3 prose-p:mt-0 prose-p:last:mb-0 prose-headings:mb-3 prose-headings:mt-6 first:prose-headings:mt-0 prose-hr:my-6 prose-hr:border-border [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={markdownComponents}
                    >
                      {s.body}
                    </ReactMarkdown>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
