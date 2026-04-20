"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { History } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AnalysisRow = { id: string; markdown: string; createdAt: string };

type Props = {
  disabled?: boolean;
  onSelect: (markdown: string) => void;
};

export function AiInsightsHistoryDialog({ disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AnalysisRow[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<{ analyses: AnalysisRow[] }>(
        "/api/ai/analyze",
      );
      setRows(data.analyses);
    } catch {
      setError("Geçmiş analizler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void load();
  }

  function pick(markdown: string) {
    onSelect(markdown);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="cursor-pointer"
        >
          <History className="mr-2 h-4 w-4" aria-hidden />
          Son 5 Analiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Son 5 analiz</DialogTitle>
          <DialogDescription>
            Tarihe göre sıralanır; bir kayda tıklayınca rapor bu sayfada açılır.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto border-t border-border px-6 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Yükleniyor…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz kayıtlı analiz yok. &quot;Analiz Başlat&quot; ile ürettiğiniz
              raporlar burada listelenir.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full cursor-pointer rounded-lg border border-border/80 bg-card/60 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50"
                    onClick={() => pick(r.markdown)}
                  >
                    <span className="font-medium text-foreground">
                      {format(new Date(r.createdAt), "d MMMM yyyy, HH:mm", {
                        locale: tr,
                      })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
