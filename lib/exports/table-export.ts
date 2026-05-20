export type ExportColumn<T extends Record<string, unknown>> = {
  header: string;
  key: keyof T & string;
  align?: "left" | "right" | "center";
  width?: number | "auto" | "*";
  format?: (value: T[keyof T], row: T) => string;
};

export type ExportMetaItem = { label: string; value: string };

export type ExportTableData<T extends Record<string, unknown>> = {
  title: string;
  filename: string;
  sheetName?: string;
  columns: ExportColumn<T>[];
  rows: T[];
  meta?: ExportMetaItem[];
};

function renderCell<T extends Record<string, unknown>>(
  column: ExportColumn<T>,
  row: T,
): string {
  const raw = row[column.key];
  if (column.format) return column.format(raw, row);
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "number") return String(raw);
  return String(raw);
}

export async function exportTableToExcel<T extends Record<string, unknown>>(
  data: ExportTableData<T>,
): Promise<void> {
  const XLSX = await import("xlsx");

  const sheetRows: (string | number)[][] = [];

  if (data.title) sheetRows.push([data.title]);
  if (data.meta?.length) {
    for (const m of data.meta) sheetRows.push([m.label, m.value]);
  }
  if (data.title || data.meta?.length) sheetRows.push([]);

  sheetRows.push(data.columns.map((c) => c.header));
  for (const row of data.rows) {
    sheetRows.push(
      data.columns.map((c) => {
        const text = renderCell(c, row);
        const numeric = Number(
          text.replace(/[^0-9,.-]/g, "").replace(",", "."),
        );
        return Number.isFinite(numeric) && text.trim() !== "" && /\d/.test(text)
          ? numeric
          : text;
      }),
    );
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet["!cols"] = data.columns.map((c) => ({
    wch: Math.max(c.header.length + 2, 14),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, data.sheetName ?? "Plan");
  XLSX.writeFile(workbook, `${data.filename}.xlsx`);
}

type PdfCell = {
  text: string;
  alignment?: "left" | "right" | "center";
  bold?: boolean;
  color?: string;
  fillColor?: string;
  margin?: [number, number, number, number];
};

export async function exportTableToPdf<T extends Record<string, unknown>>(
  data: ExportTableData<T>,
): Promise<void> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = (await import("pdfmake/build/vfs_fonts")) as Record<
    string,
    unknown
  >;

  const pdfMake = (pdfMakeModule.default ??
    pdfMakeModule) as typeof import("pdfmake/build/pdfmake");

  const vfs =
    (pdfFontsModule.vfs as Record<string, string> | undefined) ??
    (pdfFontsModule.default as { vfs?: Record<string, string> } | undefined)
      ?.vfs ??
    (pdfFontsModule.pdfMake as { vfs?: Record<string, string> } | undefined)
      ?.vfs;
  if (vfs) {
    (pdfMake as unknown as { vfs: Record<string, string> }).vfs = vfs;
  }

  const headerRow: PdfCell[] = data.columns.map((c) => ({
    text: c.header,
    bold: true,
    color: "#ffffff",
    fillColor: "#059669",
    alignment: c.align ?? "left",
    margin: [4, 4, 4, 4],
  }));

  const bodyRows: PdfCell[][] = data.rows.map((row) =>
    data.columns.map((c) => ({
      text: renderCell(c, row),
      alignment: c.align ?? "left",
      margin: [4, 3, 4, 3],
    })),
  );

  const widths = data.columns.map((c) => c.width ?? "*");

  const content: Record<string, unknown>[] = [
    {
      text: data.title,
      fontSize: 14,
      bold: true,
      color: "#0f172a",
      margin: [0, 0, 0, 8],
    },
  ];

  if (data.meta?.length) {
    content.push({
      columns: data.meta.map((m) => ({
        width: "*",
        stack: [
          { text: m.label, fontSize: 8, color: "#64748b" },
          { text: m.value, fontSize: 10, bold: true, color: "#0f172a" },
        ],
      })),
      columnGap: 12,
      margin: [0, 0, 0, 12],
    });
  }

  content.push({
    table: {
      headerRows: 1,
      widths,
      body: [headerRow, ...bodyRows],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => "#e2e8f0",
      vLineColor: () => "#e2e8f0",
      fillColor: (rowIndex: number) =>
        rowIndex === 0 ? null : rowIndex % 2 === 0 ? "#f8fafc" : null,
    },
    fontSize: 9,
  });

  const isWide = data.columns.length > 5;

  (
    pdfMake as unknown as {
      createPdf: (def: Record<string, unknown>) => {
        download: (filename: string) => void;
      };
    }
  )
    .createPdf({
      content,
      defaultStyle: { fontSize: 10 },
      pageMargins: [28, 36, 28, 36],
      pageOrientation: isWide ? "landscape" : "portrait",
      info: { title: data.title, creator: "finance" },
    })
    .download(`${data.filename}.pdf`);
}
