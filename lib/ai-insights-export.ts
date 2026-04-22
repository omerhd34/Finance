import type {
  TDocumentDefinitions,
  TVirtualFileSystem,
} from "pdfmake/interfaces";
import type { AiInsightSection } from "@/lib/ai-insights-parse";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseMarkdownBoldToPdfText(
  input: string,
): string | Array<string | { text: string; bold: true }> {
  const parts: Array<string | { text: string; bold: true }> = [];
  const regex = /\*\*(.+?)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null = regex.exec(input);

  while (match) {
    const [fullMatch, boldText] = match;
    const start = match.index;
    if (start > cursor) {
      parts.push(input.slice(cursor, start));
    }
    parts.push({ text: boldText, bold: true });
    cursor = start + fullMatch.length;
    match = regex.exec(input);
  }

  if (cursor < input.length) {
    parts.push(input.slice(cursor));
  }

  return parts.length > 0 ? parts : input;
}

export async function downloadAiInsightsPdf(
  sections: AiInsightSection[],
): Promise<void> {
  const pdfMake = (await import("pdfmake/build/pdfmake")).default;
  const vfsMod = await import("pdfmake/build/vfs_fonts");
  const vfs = (vfsMod as { default: TVirtualFileSystem }).default;
  pdfMake.addVirtualFileSystem(vfs);

  const content: TDocumentDefinitions["content"] = [
    { text: "IQfinansAI", style: "brand" },
    { text: "Yapay Zeka Analizi", style: "header", margin: [0, 6, 0, 0] },
    {
      text: "Oluşturulma: " + new Date().toLocaleString("tr-TR"),
      style: "subheader",
      margin: [0, 0, 0, 14],
    },
  ];

  sections.forEach((section, index) => {
    content.push(
      {
        text: `${index + 1}. ${section.title}`,
        style: "sectionTitle",
        margin: [0, index === 0 ? 0 : 10, 0, 4],
      },
      {
        text: parseMarkdownBoldToPdfText(section.body || "—"),
        style: "sectionBody",
        margin: [0, 0, 0, 6],
      },
    );
  });

  const docDefinition: TDocumentDefinitions = {
    pageMargins: [40, 50, 40, 50],
    content,
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
    },
    styles: {
      brand: { fontSize: 10, bold: true, color: "#2563eb" },
      header: { fontSize: 15, bold: true },
      subheader: { fontSize: 8, color: "#555555" },
      sectionTitle: { fontSize: 12, bold: true, color: "#111827" },
      sectionBody: { fontSize: 10, color: "#1f2937", lineHeight: 1.35 },
    },
  };

  const blob = await pdfMake.createPdf(docDefinition).getBlob();
  const name = `ai-analiz-${new Date().toISOString().slice(0, 10)}.pdf`;
  downloadBlob(blob, name);
}
