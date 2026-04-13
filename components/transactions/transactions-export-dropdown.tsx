"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, ChevronDown } from "lucide-react";

type Props = {
  exporting: "csv" | "pdf" | null;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export function TransactionsExportDropdown({
  exporting,
  onExportCsv,
  onExportPdf,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={exporting !== null}
          className="cursor-pointer"
        >
          <Download className="h-4 w-4" />
          {exporting !== null ? "İndiriliyor..." : "Dışa aktar"}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-(--radix-dropdown-menu-trigger-width) w-(--radix-dropdown-menu-trigger-width)"
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => {
            void onExportCsv();
          }}
        >
          <Download className="h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => {
            void onExportPdf();
          }}
        >
          <FileText className="h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
