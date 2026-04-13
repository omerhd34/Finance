"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransactionsExportDropdown } from "./transactions-export-dropdown";

type Props = {
  exporting: "csv" | "pdf" | null;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export function TransactionsPageHeader({
  exporting,
  onExportCsv,
  onExportPdf,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">İşlem listesi</h2>
        <p className="text-sm text-muted-foreground">
          Filtreleyin, düzenleyin veya dışa aktar menüsünden format seçin.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <TransactionsExportDropdown
          exporting={exporting}
          onExportCsv={onExportCsv}
          onExportPdf={onExportPdf}
        />
        <Button asChild className="cursor-pointer">
          <Link href="/transactions/new">Yeni İşlem Ekle</Link>
        </Button>
      </div>
    </div>
  );
}
