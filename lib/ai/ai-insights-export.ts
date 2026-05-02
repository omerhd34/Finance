import type {
  Content,
  TableLayout,
  TDocumentDefinitions,
  TVirtualFileSystem,
} from "pdfmake/interfaces";
import type { AiInsightSection } from "@/lib/ai/ai-insights-parse";

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

const AI_INSIGHTS_TABLE_LAYOUT: TableLayout = {
  hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
    i === 0 || i === node.table.body.length ? 0.8 : 0.35,
  vLineWidth: () => 0.35,
  hLineColor: () => "#d1d5db",
  vLineColor: () => "#d1d5db",
  paddingLeft: () => 10,
  paddingRight: () => 10,
  paddingTop: () => 7,
  paddingBottom: () => 7,
  fillColor: (rowIndex: number) => {
    if (rowIndex === 0) return "#e5e7eb";
    return rowIndex % 2 === 0 ? "#f3f4f6" : "#ffffff";
  },
};

function splitTableRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split("|").map((c) => c.trim());
}

function isTableRowLine(line: string): boolean {
  const t = line.trim();
  return (
    t.startsWith("|") &&
    t.endsWith("|") &&
    t.length > 2 &&
    !isTableSeparatorLine(t)
  );
}

function isTableSeparatorLine(line: string): boolean {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return false;
  if (!/-{2,}/.test(t)) return false;
  const inner = t.replace(/\|/g, "").replace(/[\s:-]/g, "");
  return inner.length === 0;
}

function normalizeTableRows(rows: string[][]): string[][] {
  if (rows.length === 0) return rows;
  const n = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => {
    const copy = [...r];
    while (copy.length < n) copy.push("");
    return copy.slice(0, n);
  });
}

function tryParseMarkdownTable(
  lines: string[],
  start: number,
): { rows: string[][]; nextLine: number } | null {
  if (start >= lines.length || !isTableRowLine(lines[start])) return null;
  const header = splitTableRow(lines[start]);
  if (header.length === 0) return null;

  let i = start + 1;
  if (i < lines.length && isTableSeparatorLine(lines[i])) {
    i++;
  }

  const rows: string[][] = [header];
  while (i < lines.length && isTableRowLine(lines[i])) {
    rows.push(splitTableRow(lines[i]));
    i++;
  }

  return { rows: normalizeTableRows(rows), nextLine: i };
}

function markdownSectionBodyToPdfContent(body: string): Content[] {
  const raw = body.trim();
  if (!raw) return [{ text: "—", style: "sectionBody" }];

  const lines = raw.split(/\r?\n/);
  const out: Content[] = [];
  let i = 0;
  const paragraphLines: string[] = [];

  function flushParagraph() {
    const text = paragraphLines.join("\n").trim();
    paragraphLines.length = 0;
    if (!text) return;
    out.push({
      text: parseMarkdownBoldToPdfText(text),
      style: "sectionBody",
      margin: [0, 0, 0, 8],
    });
  }

  while (i < lines.length) {
    const line = lines[i];
    const tableTry = tryParseMarkdownTable(lines, i);
    if (tableTry && tableTry.rows.length >= 2) {
      flushParagraph();
      const colCount = tableTry.rows[0]?.length ?? 1;
      const bodyRows = tableTry.rows.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          text: parseMarkdownBoldToPdfText(cell || "—"),
          style: rowIndex === 0 ? "tableHeader" : "tableCell",
          alignment:
            colCount >= 3 && colIndex >= 1 ? ("right" as const) : undefined,
        })),
      );
      const widths =
        colCount <= 1
          ? ["*"]
          : colCount === 2
            ? ["*", "*"]
            : colCount === 3
              ? ["40%", "25%", "35%"]
              : Array.from({ length: colCount }, () => "*" as const);

      out.push({
        table: {
          headerRows: 1,
          widths,
          body: bodyRows,
        },
        layout: AI_INSIGHTS_TABLE_LAYOUT,
        margin: [0, 4, 0, 12],
      });
      i = tableTry.nextLine;
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      i++;
      continue;
    }

    paragraphLines.push(line);
    i++;
  }
  flushParagraph();
  return out.length > 0 ? out : [{ text: "—", style: "sectionBody" }];
}

export async function downloadAiInsightsPdf(
  sections: AiInsightSection[],
): Promise<void> {
  const pdfMake = (await import("pdfmake/build/pdfmake")).default;
  const vfsMod = await import("pdfmake/build/vfs_fonts");
  const vfs = (vfsMod as { default: TVirtualFileSystem }).default;
  pdfMake.addVirtualFileSystem(vfs);

  const content: TDocumentDefinitions["content"] = [
    {
      text: "IQfinansAI",
      style: "brand",
      alignment: "center",
      margin: [0, 0, 0, 6],
    },
    {
      text: "Yapay Zeka Analizi",
      style: "header",
      alignment: "center",
      margin: [0, 0, 0, 0],
    },
    {
      text: "Oluşturulma: " + new Date().toLocaleString("tr-TR"),
      style: "subheader",
      alignment: "center",
      margin: [0, 4, 0, 14],
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
        stack: markdownSectionBodyToPdfContent(section.body || ""),
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
      brand: { fontSize: 22, bold: true, color: "#2563eb" },
      header: { fontSize: 15, bold: true },
      subheader: { fontSize: 8, color: "#555555" },
      sectionTitle: { fontSize: 12, bold: true, color: "#111827" },
      sectionBody: { fontSize: 10, color: "#1f2937", lineHeight: 1.35 },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: "#111827",
        lineHeight: 1.25,
      },
      tableCell: { fontSize: 10, color: "#374151", lineHeight: 1.35 },
    },
  };

  const blob = await pdfMake.createPdf(docDefinition).getBlob();
  const name = `ai-analiz-${new Date().toISOString().slice(0, 10)}.pdf`;
  downloadBlob(blob, name);
}
