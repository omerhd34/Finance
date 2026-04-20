import { type ReactElement, type ReactNode } from "react";
import type { Components } from "react-markdown";

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
};
