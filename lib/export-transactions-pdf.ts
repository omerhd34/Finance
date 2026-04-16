import type {
  TDocumentDefinitions,
  TVirtualFileSystem,
} from "pdfmake/interfaces";
import type { Transaction } from "@/types/transaction";
import {
  currencySymbolLabel,
  formatDateShort,
  formatMoneyAmount,
} from "@/lib/utils";

export async function downloadTransactionsPdf(
  rows: Transaction[],
  currency: string,
  filename: string,
): Promise<void> {
  const pdfMake = (await import("pdfmake/build/pdfmake")).default;
  const vfsMod = await import("pdfmake/build/vfs_fonts");
  const vfs = (vfsMod as { default: TVirtualFileSystem }).default;
  pdfMake.addVirtualFileSystem(vfs);

  const sym = currencySymbolLabel(currency);
  const body: string[][] = [
    ["Tarih", "Kategori", "Açıklama", "Tutar (" + sym + ")", "Tür"],
    ...rows.map((t) => [
      formatDateShort(t.date),
      t.category,
      t.description ?? "—",
      formatMoneyAmount(t.amount, currency),
      t.type === "income" ? "Gelir" : "Gider",
    ]),
  ];

  const docDefinition: TDocumentDefinitions = {
    pageOrientation: "landscape",
    pageMargins: [40, 50, 40, 50],
    content: [
      { text: "IQfinansAI", style: "brand" },
      { text: "İşlemler", style: "header", margin: [0, 6, 0, 0] },
      {
        text: "Oluşturulma: " + new Date().toLocaleString("tr-TR"),
        style: "subheader",
        margin: [0, 0, 0, 14],
      },
      {
        table: {
          headerRows: 1,
          widths: [72, "*", "*", 72, 56],
          body,
        },
        layout: "lightHorizontalLines",
      },
    ],
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
    },
    styles: {
      brand: { fontSize: 10, bold: true, color: "#2563eb" },
      header: { fontSize: 15, bold: true },
      subheader: { fontSize: 8, color: "#555555" },
    },
  };

  const blob = await pdfMake.createPdf(docDefinition).getBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
