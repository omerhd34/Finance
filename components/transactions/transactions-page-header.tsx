"use client";

import { NewTransactionDialog } from "./new-transaction-dialog";
import { TransactionsExportDropdown } from "./transactions-export-dropdown";

type Props = {
  exporting: "csv" | "pdf" | null;
  onExportCsv: () => void;
  onExportPdf: () => void;
  newTransactionOpen: boolean;
  onNewTransactionOpenChange: (open: boolean) => void;
  onTransactionCreated: () => void | Promise<void>;
};

export function TransactionsPageHeader({
  exporting,
  onExportCsv,
  onExportPdf,
  newTransactionOpen,
  onNewTransactionOpenChange,
  onTransactionCreated,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
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
        <NewTransactionDialog
          open={newTransactionOpen}
          onOpenChange={onNewTransactionOpenChange}
          onCreated={onTransactionCreated}
        />
      </div>
    </div>
  );
}
