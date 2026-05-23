"use client";

import { useMemo, useState, type ReactNode } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { AiChatHistoryTurn } from "@/lib/ai/ai-chat-history-types";
import {
  groupChatTurns,
  type AiChatHistoryGroup,
} from "@/lib/ai/group-chat-turns";
import { cn } from "@/lib/common/utils";

export type { AiChatHistoryTurn };

type Props = {
  className?: string;
  turns: AiChatHistoryTurn[];
  loading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  disabled?: boolean;
  hasMoreHistory: boolean;
  loadingMoreHistory: boolean;
  onLoadMoreHistory: () => void;
  onNewQuestion: () => void;
  newQuestionDisabled?: boolean;
  usageBeforeNewQuestion?: ReactNode;
  onSelectGroup: (group: AiChatHistoryGroup) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
};

function previewLine(text: string, maxLen: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function formatListTime(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm", { locale: tr });
  if (isYesterday(d)) return "Dün";
  return format(d, "d MMM", { locale: tr });
}

export function AiChatHistorySidebar({
  className,
  turns,
  loading,
  error,
  selectedConversationId,
  disabled,
  hasMoreHistory,
  loadingMoreHistory,
  onLoadMoreHistory,
  onNewQuestion,
  newQuestionDisabled = false,
  usageBeforeNewQuestion,
  onSelectGroup,
  onDeleteConversation,
}: Props) {
  const [query, setQuery] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [pendingDeleteConversationId, setPendingDeleteConversationId] =
    useState<string | null>(null);
  const [expandedOnMobile, setExpandedOnMobile] = useState(false);

  const MOBILE_VISIBLE_LIMIT = 3;

  const groups = useMemo(() => groupChatTurns(turns), [turns]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) =>
      g.turns.some(
        (t) =>
          t.userMessage.toLowerCase().includes(q) ||
          t.assistantReply.toLowerCase().includes(q),
      ),
    );
  }, [groups, query]);

  async function confirmDelete() {
    if (!pendingDeleteConversationId) return;
    const cid = pendingDeleteConversationId;
    setDeletingConversationId(cid);
    try {
      await onDeleteConversation(cid);
      setPendingDeleteConversationId(null);
    } finally {
      setDeletingConversationId(null);
    }
  }

  return (
    <>
      <Dialog
        open={pendingDeleteConversationId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteConversationId(null);
        }}
      >
        <DialogContent
          className="max-w-md text-center sm:text-center"
          onPointerDownOutside={(e) => {
            if (deletingConversationId !== null) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (deletingConversationId !== null) e.preventDefault();
          }}
        >
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle>Konuşmayı sil</DialogTitle>
            <DialogDescription>
              Bu konuşmadaki tüm soru ve yanıtlar kalıcı olarak silinir. Bu
              işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer sm:min-w-28"
              disabled={deletingConversationId !== null}
              onClick={() => setPendingDeleteConversationId(null)}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer sm:min-w-28"
              disabled={deletingConversationId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingConversationId !== null ? "Siliniyor…" : "Evet, sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <aside
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border-border bg-muted/25 dark:bg-[#111b21]/90 dark:border-white/10",
          className,
        )}
      >
        <div className="shrink-0 border-b border-border px-3 py-3 dark:border-white/10">
          <div className="flex items-start justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-tight text-foreground">
                Mesajlar
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Kayıtlı soru–cevaplarınız
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {usageBeforeNewQuestion}
              <Button
                type="button"
                size="sm"
                aria-label="Yeni soru"
                className="h-9 w-9 shrink-0 cursor-pointer p-0 text-xs font-semibold disabled:cursor-not-allowed md:w-auto md:gap-1.5 md:px-3"
                disabled={disabled || newQuestionDisabled}
                title={
                  newQuestionDisabled
                    ? "Günlük yeni mesajlaşma limitine ulaştınız. Yarın tekrar deneyebilir veya mevcut sohbetlere devam edebilirsiniz."
                    : "Yeni soru"
                }
                onClick={() => onNewQuestion()}
              >
                <MessageSquarePlus className="size-4 shrink-0" aria-hidden />
                <span className="hidden md:inline">Yeni soru</span>
              </Button>
            </div>
          </div>
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mesajlarda ara…"
              className="h-9 border-border/80 bg-background/80 pl-9 dark:border-white/10 dark:bg-[#202c33]/80"
              disabled={disabled}
              aria-label="Mesajlarda ara"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-visible md:min-h-0 md:overflow-y-auto md:overscroll-contain">
          {loading ? (
            <div
              className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-12"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-muted-foreground">Yükleniyor…</p>
            </div>
          ) : error ? (
            <p className="px-4 py-6 text-sm text-destructive">{error}</p>
          ) : (
            <>
              {filteredGroups.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  {turns.length === 0
                    ? "Henüz kayıtlı soru yok. Her tamamlanan soru–cevap burada listelenir."
                    : "Aramanızla eşleşen sohbet yok."}
                </p>
              ) : (
                <ul className="py-1">
                  {filteredGroups.map((group, idx) => {
                    const last = group.turns[group.turns.length - 1];
                    const active =
                      group.conversationId === selectedConversationId;
                    const busy =
                      deletingConversationId === group.conversationId;
                    const isOverMobileLimit = idx >= MOBILE_VISIBLE_LIMIT;
                    const hiddenOnMobile =
                      isOverMobileLimit && !expandedOnMobile;
                    return (
                      <li
                        key={group.conversationId}
                        className={cn(hiddenOnMobile && "hidden md:block")}
                      >
                        <div
                          className={cn(
                            "group flex w-full items-stretch gap-0 border-b border-transparent transition-colors dark:border-white/5",
                            active
                              ? "bg-accent/55 dark:bg-[#2a3942]"
                              : "hover:bg-accent/35 dark:hover:bg-[#202c33]",
                          )}
                        >
                          <button
                            type="button"
                            disabled={disabled || busy}
                            onClick={() => onSelectGroup(group)}
                            className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 px-2 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span
                              className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary dark:bg-[#2a3942] dark:text-emerald-400/95"
                              aria-hidden
                            >
                              <IQfinansAiAssistantIcon className="size-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-medium leading-snug text-foreground">
                                {previewLine(last.userMessage, 64)}
                              </span>
                              <span className="mt-0.5 block truncate text-[13px] leading-snug text-muted-foreground dark:text-[#8696a0]">
                                {previewLine(last.assistantReply, 72)}
                              </span>
                            </span>
                          </button>
                          <div className="flex shrink-0 flex-col items-end gap-1 pr-1.5 pt-2">
                            <span className="text-[11px] tabular-nums text-muted-foreground dark:text-[#8696a0]">
                              {formatListTime(last.createdAt)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 cursor-pointer text-muted-foreground opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:data-[state=open]:opacity-100 dark:text-[#8696a0]"
                                  disabled={disabled || busy}
                                  aria-label="Sohbet seçenekleri"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-0 w-fit p-0.5"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 px-2 text-destructive focus:text-destructive"
                                  disabled={busy}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPendingDeleteConversationId(
                                      group.conversationId,
                                    );
                                  }}
                                >
                                  <Trash2
                                    className="size-4 shrink-0"
                                    aria-hidden
                                  />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {filteredGroups.length > MOBILE_VISIBLE_LIMIT ? (
                <div className="border-t border-border bg-muted/40 px-2 py-2 md:hidden dark:border-white/10 dark:bg-[#111b21]/95">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 w-full cursor-pointer gap-1.5 text-sm font-medium"
                    disabled={disabled}
                    onClick={() => setExpandedOnMobile((prev) => !prev)}
                    aria-expanded={expandedOnMobile}
                  >
                    {expandedOnMobile ? (
                      <>
                        <ChevronUp className="size-4" aria-hidden />
                        Daha az göster
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-4" aria-hidden />
                        Diğerleri (
                        {filteredGroups.length - MOBILE_VISIBLE_LIMIT})
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
              {hasMoreHistory && turns.length > 0 ? (
                <div
                  className={cn(
                    "border-t border-border bg-muted/40 px-2 py-2 dark:border-white/10 dark:bg-[#111b21]/95",
                    filteredGroups.length > MOBILE_VISIBLE_LIMIT &&
                      !expandedOnMobile &&
                      "hidden md:block",
                  )}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 w-full cursor-pointer text-sm font-medium"
                    disabled={disabled || loadingMoreHistory}
                    onClick={() => onLoadMoreHistory()}
                  >
                    {loadingMoreHistory ? "Yükleniyor…" : "Diğerleri"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
