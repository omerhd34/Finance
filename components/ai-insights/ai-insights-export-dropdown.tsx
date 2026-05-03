"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

type Props = {
  exporting: "pdf" | null;
  onExportPdf: () => void;
};

export function AiInsightsExportDropdown({
  exporting,
  onExportPdf,
}: Props) {
  return (
    <Button
      variant="outline"
      disabled={exporting !== null}
      className="h-9 shrink-0 cursor-pointer"
      onClick={() => {
        void onExportPdf();
      }}
    >
      <FileText className="h-4 w-4 shrink-0" aria-hidden />
      {exporting !== null ? "İndiriliyor..." : "PDF Olarak Dışa Aktar"}
    </Button>
  );
}
