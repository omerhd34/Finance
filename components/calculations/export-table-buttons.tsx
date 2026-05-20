"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/common/utils";
import {
  exportTableToExcel,
  exportTableToPdf,
  type ExportTableData,
} from "@/lib/exports/table-export";

type Props<T extends Record<string, unknown>> = {
  data: ExportTableData<T>;
  className?: string;
  disabled?: boolean;
};

export function ExportTableButtons<T extends Record<string, unknown>>({
  data,
  className,
  disabled,
}: Props<T>) {
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);

  const noData = data.rows.length === 0;
  const isDisabled = disabled || noData;

  const handle = async (kind: "pdf" | "excel") => {
    if (isDisabled) return;
    setLoading(kind);
    try {
      if (kind === "pdf") await exportTableToPdf(data);
      else await exportTableToExcel(data);
    } catch (error) {
      console.error("Tablo dışa aktarılamadı:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isDisabled || loading !== null}
        onClick={() => handle("excel")}
        className="h-8 cursor-pointer gap-1.5 border-emerald-500/30 bg-emerald-500/5 px-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:border-emerald-500/25 dark:text-emerald-300 dark:hover:text-emerald-200"
      >
        {loading === "excel" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3.5 w-3.5" />
        )}
        Excel
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isDisabled || loading !== null}
        onClick={() => handle("pdf")}
        className="h-8 cursor-pointer gap-1.5 border-rose-500/30 bg-rose-500/5 px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-500/10 hover:text-rose-800 dark:border-rose-500/25 dark:text-rose-300 dark:hover:text-rose-200"
      >
        {loading === "pdf" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        PDF
      </Button>
    </div>
  );
}
