"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { apiClient } from "@/lib/client/api-client";
import { messageFromAiAnalyzeError } from "@/lib/ai/ai-insights-errors";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiChatHistoryDialog } from "@/components/ai-insights/ai-chat-history-dialog";
import { AiRemainingUsageChip } from "@/components/ai-insights/ai-remaining-usage-chip";
import { VoiceToTextButton } from "@/components/ai-insights/voice-to-text-button";
import { cn } from "@/lib/common/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiFinanceChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(
    null,
  );
  const [usageLoading, setUsageLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

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
          remainingQuestions: number;
          remainingAnalyses: number;
        }>("/api/ai/usage");
        if (!mounted) return;
        setRemainingQuestions(data.remainingQuestions);
      } catch {
        if (!mounted) return;
        setRemainingQuestions(0);
      } finally {
        if (mounted) setUsageLoading(false);
      }
    }
    void loadUsage();
    return () => {
      mounted = false;
    };
  }, []);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setError(null);
    const prev = messages;
    const snapshot: ChatMessage[] = [...prev, { role: "user", content: q }];
    setMessages(snapshot);
    setLoading(true);
    try {
      const { data } = await apiClient.post<{ reply: string }>("/api/ai/chat", {
        messages: snapshot,
      });
      setMessages([...snapshot, { role: "assistant", content: data.reply }]);
      setRemainingQuestions((prev) =>
        prev == null ? prev : Math.max(0, prev - 1),
      );
    } catch (err) {
      setError(messageFromAiAnalyzeError(err));
      setMessages(prev);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const historyDialog = (
    <AiChatHistoryDialog
      disabled={loading}
      onSelect={({ userMessage, assistantReply }) => {
        setMessages([
          { role: "user", content: userMessage },
          { role: "assistant", content: assistantReply },
        ]);
        setError(null);
      }}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {historyDialog}
        <AiRemainingUsageChip
          mode="questions"
          remaining={remainingQuestions}
          loading={usageLoading}
        />
      </div>

      <div className="flex max-h-[min(520px,70vh)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
        <div className="min-h-[220px] flex-1 space-y-4 overflow-y-auto p-4 md:p-5">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aşağıdan istediğiniz soruyu yazın veya mikrofonla konuşun. Sohbet
              bu oturum için tarayıcınızda tutulur; sayfayı yenilerseniz
              sıfırlanır.
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
          {loading ? (
            <p className="text-sm text-muted-foreground">Yanıt hazırlanıyor…</p>
          ) : null}
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
              placeholder="Örneğin: Bu ay en çok hangi kategoriye harcadım? veya günlük bir soru…"
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
            Enter gönderir; Shift+Enter satır ekler.
          </p>
        </div>
      </div>
    </div>
  );
}
