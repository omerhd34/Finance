export type AiInsightSection = { title: string; body: string };

export function normalizeMarkdownBody(raw: string): string {
  return raw
    .trim()
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n+$/g, "");
}

export function sectionsFromMarkdown(md: string): AiInsightSection[] {
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
