import { type ReactElement, type ReactNode } from "react";
import type { Components } from "react-markdown";
import { cn } from "@/lib/common/utils";

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
  if (/Kampanyası|Alışkanlığı\s+Edin/i.test(t)) return true;
  return false;
}

export const aiInsightsMarkdownComponents: Components = {
  p({ children }) {
    const t = textFromNodes(children);
    if (!t.trim()) return null;
    return <p>{children}</p>;
  },
  strong({ children }) {
    const label = textFromNodes(children);
    const base = "font-semibold text-foreground";
    if (!isBlockLikeStrong(label)) {
      return <strong className={base}>{children}</strong>;
    }
    return (
      <strong className={`mt-5 block scroll-mt-4 ${base}`}>{children}</strong>
    );
  },
  ul({ children }) {
    return (
      <ul className="my-3 list-none space-y-2 pl-0 [&>li]:relative [&>li]:pl-5 [&>li>p]:font-normal [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.55em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li>p>strong]:font-semibold [&>li>p>strong]:text-foreground">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="my-3 list-decimal space-y-3 pl-5 marker:font-semibold marker:text-foreground [&>li>p]:font-normal [&>li>p>strong]:font-semibold [&>li>p>strong]:text-foreground">
        {children}
      </ol>
    );
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  table({ children }) {
    return (
      <div className="not-prose my-6 w-full overflow-x-auto rounded-xl border border-border/60 bg-muted/15 shadow-sm ring-1 ring-border/30">
        <table
          className={cn(
            "w-full min-w-[min(100%,480px)] table-fixed border-collapse text-[0.9375rem] leading-relaxed",
            "[&:has(thead_tr_th:nth-child(4))]:min-w-[min(100%,720px)]",
            "[&:has(thead_tr_th:nth-child(3)):not(:has(thead_tr_th:nth-child(4)))_th:nth-child(1)]:w-[30%]",
            "[&:has(thead_tr_th:nth-child(3)):not(:has(thead_tr_th:nth-child(4)))_th:nth-child(2)]:w-[26%]",
            "[&:has(thead_tr_th:nth-child(3)):not(:has(thead_tr_th:nth-child(4)))_th:nth-child(3)]:w-[44%]",
            "[&:has(thead_tr_th:nth-child(3)):not(:has(thead_tr_th:nth-child(4)))_td:nth-child(1)]:w-[30%]",
            "[&:has(thead_tr_th:nth-child(3)):not(:has(thead_tr_th:nth-child(4)))_td:nth-child(2)]:w-[26%]",
            "[&:has(thead_tr_th:nth-child(3)):not(:has(thead_tr_th:nth-child(4)))_td:nth-child(3)]:w-[44%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_th:nth-child(1)]:w-[22%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_th:nth-child(2)]:w-[15%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_th:nth-child(3)]:w-[15%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_th:nth-child(4)]:w-[48%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_td:nth-child(1)]:w-[22%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_td:nth-child(2)]:w-[15%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_td:nth-child(3)]:w-[15%]",
            "[&:has(thead_tr_th:nth-child(4)):not(:has(thead_tr_th:nth-child(5)))_td:nth-child(4)]:w-[48%]",
          )}
        >
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return (
      <thead className="border-b border-border/80 bg-muted/40">
        {children}
      </thead>
    );
  },
  tbody({ children }) {
    return (
      <tbody className="[&>tr]:border-b [&>tr]:border-border/40 [&>tr:last-child]:border-b-0">
        {children}
      </tbody>
    );
  },
  tr({ children }) {
    return <tr className="transition-colors hover:bg-muted/25">{children}</tr>;
  },
  th({ children }) {
    return (
      <th className="whitespace-normal px-5 py-4 text-left align-bottom text-sm font-semibold leading-snug tracking-tight text-foreground md:px-6 md:py-4.5">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="whitespace-normal px-5 py-4 align-middle text-sm leading-relaxed text-muted-foreground md:px-6 md:py-4.5 [&>strong]:font-semibold [&>strong]:text-foreground">
        {children}
      </td>
    );
  },
  tfoot({ children }) {
    return (
      <tfoot className="border-t border-border/70 bg-muted/30 font-medium text-foreground">
        {children}
      </tfoot>
    );
  },
};
