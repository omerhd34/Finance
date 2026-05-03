"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { History } from "lucide-react";
import { apiClient } from "@/lib/client/api-client";
import { AI_ASSISTANT_STORED_QA_COUNT } from "@/lib/ai/ai-insights-limits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TurnRow = {
  id: string;
  userMessage: string;
  assistantReply: string;
  createdAt: string;
};

type Props = {
  disabled?: boolean;
  onSelect: (pair: { userMessage: string; assistantReply: string }) => void;
};

function previewQuestion(text: string, maxLen: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

export function AiChatHistoryDialog({ disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TurnRow[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<{ turns: TurnRow[] }>(
        "/api/ai/chat",
      );
      setRows(data.turns);
    } catch {
      setError("Geçmiş sorular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void load();
  }

  function pick(row: TurnRow) {
    onSelect({
      userMessage: row.userMessage,
      assistantReply: row.assistantReply,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-9 shrink-0 cursor-pointer gap-2"
        >
          <History className="h-4 w-4 shrink-0" aria-hidden />
          Son {AI_ASSISTANT_STORED_QA_COUNT} Soru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Son {AI_ASSISTANT_STORED_QA_COUNT} soru</DialogTitle>
          <DialogDescription>
            Tarihe göre sıralanır; bir kayda tıklayınca o soru ve yanıtı sohbet
            alanında gösterilir (mevcut sohbet yerine geçer).
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto border-t border-border px-6 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Yükleniyor…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz kayıtlı soru yok. Asistana gönderdiğiniz her tamamlanmış
              soru–yanıt çifti burada listelenir.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full cursor-pointer rounded-lg border border-border/80 bg-card/60 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50"
                    onClick={() => pick(r)}
                  >
                    <span className="block font-medium text-foreground">
                      {format(new Date(r.createdAt), "d MMMM yyyy, HH:mm", {
                        locale: tr,
                      })}
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      {previewQuestion(r.userMessage, 140)}
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
