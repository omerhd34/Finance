"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import { apiClient } from "@/lib/client/api-client";
import { messageFromAiAnalyzeError } from "@/lib/ai/ai-insights-errors";
import {
  AI_ASSISTANT_HISTORY_INITIAL_FETCH,
  AI_ASSISTANT_HISTORY_PAGE_SIZE,
} from "@/lib/ai/ai-insights-limits";
import {
  chatTurnThreadKey,
  type AiChatHistoryGroup,
} from "@/lib/ai/group-chat-turns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AiChatHistorySidebar,
  type AiChatHistoryTurn,
} from "@/components/ai-insights/ai-chat-history-sidebar";
import { AiRemainingUsageChip } from "@/components/ai-insights/ai-remaining-usage-chip";
import { VoiceToTextButton } from "@/components/ai-insights/voice-to-text-button";
import { cn } from "@/lib/common/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

function AiChatReplyLoading() {
  return (
    <div
      className="flex justify-start py-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Yanıt hazırlanıyor</span>
      <div className="relative flex size-12 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-violet-500 border-b-amber-400 border-l-transparent opacity-90 animate-spin shadow-sm dark:border-t-emerald-400 dark:border-r-teal-400 dark:border-b-cyan-400 dark:border-l-transparent"
          aria-hidden
        />
        <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-muted/70 ring-1 ring-border/70 dark:bg-[#2a3942] dark:ring-white/10">
          <IQfinansAiAssistantIcon className="size-[1.35rem] text-primary dark:text-emerald-400/95" />
        </div>
      </div>
    </div>
  );
}

function flattenGroupToMessages(group: AiChatHistoryGroup): ChatMessage[] {
  return group.turns.flatMap((t) => [
    { role: "user" as const, content: t.userMessage },
    { role: "assistant" as const, content: t.assistantReply },
  ]);
}

export function AiFinanceChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingConversations, setRemainingConversations] = useState<
    number | null
  >(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [historyTurns, setHistoryTurns] = useState<AiChatHistoryTurn[]>([]);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const selectedConversationIdRef = useRef<string | null>(null);
  selectedConversationIdRef.current = selectedConversationId;

  const activeConversationIdRef = useRef<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const { data } = await apiClient.get<{
        turns: AiChatHistoryTurn[];
        hasMore: boolean;
        distinctConversationCount: number;
      }>(
        `/api/ai/chat?offset=0&limit=${String(AI_ASSISTANT_HISTORY_INITIAL_FETCH)}`,
      );
      setHistoryTurns(data.turns);
      const distinctInPayload = new Set(
        data.turns.map((t) => chatTurnThreadKey(t)),
      ).size;
      const distinctTotal = Math.max(
        Number(data.distinctConversationCount) || 0,
        distinctInPayload,
      );
      setHistoryHasMore(data.hasMore && distinctTotal > 1);
    } catch {
      setHistoryError("Geçmiş yüklenemedi.");
      setHistoryTurns([]);
      setHistoryHasMore(false);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadMoreHistory = useCallback(async () => {
    if (historyLoadingMore || !historyHasMore) return;
    setHistoryLoadingMore(true);
    setHistoryError(null);
    try {
      const offset = historyTurns.length;
      const { data } = await apiClient.get<{
        turns: AiChatHistoryTurn[];
        hasMore: boolean;
        distinctConversationCount: number;
      }>(
        `/api/ai/chat?offset=${String(offset)}&limit=${String(AI_ASSISTANT_HISTORY_PAGE_SIZE)}`,
      );
      setHistoryTurns((prev) => {
        const merged = [...prev, ...data.turns];
        const distinctInPayload = new Set(
          merged.map((t) => chatTurnThreadKey(t)),
        ).size;
        const distinctTotal = Math.max(
          Number(data.distinctConversationCount) || 0,
          distinctInPayload,
        );
        setHistoryHasMore(data.hasMore && distinctTotal > 1);
        return merged;
      });
    } catch {
      setHistoryError("Diğer kayıtlar yüklenemedi.");
    } finally {
      setHistoryLoadingMore(false);
    }
  }, [historyHasMore, historyLoadingMore, historyTurns.length]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    if (messages.length === 0 && !loading) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  useEffect(() => {
    let mounted = true;
    async function loadUsage() {
      setUsageLoading(true);
      try {
        const { data } = await apiClient.get<{
          remainingConversations: number;
          remainingAnalyses: number;
        }>("/api/ai/usage");
        if (!mounted) return;
        setRemainingConversations(data.remainingConversations);
      } catch {
        if (!mounted) return;
        setRemainingConversations(0);
      } finally {
        if (mounted) setUsageLoading(false);
      }
    }
    void loadUsage();
    return () => {
      mounted = false;
    };
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await apiClient.delete(
          `/api/ai/chat/conversation/${encodeURIComponent(conversationId)}`,
        );
        setError(null);
        if (selectedConversationIdRef.current === conversationId) {
          setMessages([]);
          setSelectedConversationId(null);
          activeConversationIdRef.current = null;
        }
        await refreshHistory();
      } catch (err) {
        setError(messageFromAiAnalyzeError(err));
      }
    },
    [refreshHistory],
  );

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setError(null);
    const prev = messages;
    const isFirstMessageInConversation = prev.length === 0;
    const snapshot: ChatMessage[] = [...prev, { role: "user", content: q }];
    setMessages(snapshot);
    setLoading(true);
    try {
      if (!activeConversationIdRef.current) {
        activeConversationIdRef.current = globalThis.crypto.randomUUID();
      }
      const conversationId = activeConversationIdRef.current;
      const { data } = await apiClient.post<{ reply: string }>("/api/ai/chat", {
        messages: snapshot,
        conversationId,
      });
      setMessages([...snapshot, { role: "assistant", content: data.reply }]);
      setSelectedConversationId(conversationId);
      if (isFirstMessageInConversation) {
        setRemainingConversations((p) => (p == null ? p : Math.max(0, p - 1)));
      }
      void refreshHistory();
    } catch (err) {
      setError(messageFromAiAnalyzeError(err));
      setMessages(prev);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, refreshHistory]);

  const selectHistoryGroup = useCallback(async (group: AiChatHistoryGroup) => {
    setSelectedConversationId(group.conversationId);
    activeConversationIdRef.current = group.conversationId;
    setError(null);
    try {
      const { data } = await apiClient.get<{ turns: AiChatHistoryTurn[] }>(
        `/api/ai/chat/conversation/${encodeURIComponent(group.conversationId)}`,
      );
      setMessages(
        flattenGroupToMessages({
          conversationId: group.conversationId,
          turns: data.turns,
        }),
      );
    } catch {
      setMessages(flattenGroupToMessages(group));
      setError("Bu sohbetin tam geçmişi yüklenemedi.");
    }
  }, []);

  function startNewQuestion() {
    if (
      !usageLoading &&
      remainingConversations !== null &&
      remainingConversations <= 0
    ) {
      return;
    }
    setMessages([]);
    setSelectedConversationId(null);
    activeConversationIdRef.current = null;
    setInput("");
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex h-[min(560px,72vh)] min-h-[300px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm md:flex-row">
        <AiChatHistorySidebar
          className="h-[min(220px,36vh)] w-full shrink-0 overflow-hidden border-b md:h-full md:min-h-0 md:w-[clamp(300px,36vw,460px)] md:shrink-0 md:border-b-0 md:border-r"
          turns={historyTurns}
          loading={historyLoading}
          error={historyError}
          selectedConversationId={selectedConversationId}
          disabled={loading}
          hasMoreHistory={historyHasMore}
          loadingMoreHistory={historyLoadingMore}
          onLoadMoreHistory={() => void loadMoreHistory()}
          onNewQuestion={startNewQuestion}
          newQuestionDisabled={
            !usageLoading &&
            remainingConversations !== null &&
            remainingConversations <= 0
          }
          usageBeforeNewQuestion={
            <AiRemainingUsageChip
              mode="conversations"
              remaining={remainingConversations}
              loading={usageLoading}
              dense
            />
          }
          onSelectGroup={selectHistoryGroup}
          onDeleteConversation={deleteConversation}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 md:p-5">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground md:text-base">
                Merhabalar, ben <strong>IQfinansAI</strong> Asistanıyım. Finans
                kayıtlarınız veya istediğiniz her konuda sorabilirsiniz.
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[min(100%,34rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted/40",
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-headings:my-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading ? <AiChatReplyLoading /> : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border bg-card/30 p-3 md:p-4">
            {error ? (
              <p className="mb-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Bu ay en çok hangi kategoriye harcadım?"
                rows={2}
                className="min-h-[72px] flex-1 resize-none"
                disabled={loading}
                maxLength={1500}
              />
              <div className="flex shrink-0 flex-col gap-2">
                <VoiceToTextButton
                  append
                  currentText={input}
                  onTranscript={setInput}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <Button
                  type="button"
                  size="icon"
                  className="cursor-pointer"
                  disabled={loading || !input.trim()}
                  onClick={() => void send()}
                  aria-label="Gönder"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Shift+Enter satır ekler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
