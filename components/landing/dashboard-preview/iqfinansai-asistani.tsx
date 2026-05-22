import { Bot, Send, User } from "lucide-react";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import {
  PreviewBadge,
  PreviewCard,
  PreviewPageHeader,
} from "@/components/landing/dashboard-preview/shared";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const MESSAGES: Message[] = [
  {
    id: "m1",
    role: "user",
    text: "Bu ay market harcamalarımı nasıl azaltabilirim?",
  },
  {
    id: "m2",
    role: "assistant",
    text: "Son 6 ayda market giderin ortalama ₺8.450. Mayıs ayında ₺9.100'e çıkmış. Hafta sonu yapılan alışverişlerin %22'si işlenmiş gıdadan. Toplu (büyük marketten) haftalık alışverişe geçersen ortalama %15 tasarruf sağlayabilirsin.",
  },
  {
    id: "m3",
    role: "user",
    text: "Aylık net tasarrufum hedeflediğim seviyede mi?",
  },
  {
    id: "m4",
    role: "assistant",
    text: "Hedef tasarruf oranın %55. Bu ay %60'a ulaştın — hedefin üstündesin. Son 3 aylık ortalama da %52 ile yakın bir yerde. Bu trendi sürdürebilirsen yıl sonu birikim hedefine 2 ay erken ulaşman muhtemel.",
  },
];

const SUGGESTIONS = [
  "En yüksek 3 harcama kategorimi göster",
  "Borçlarımı kapatmak ne kadar sürer?",
  "Yatırım portföyümü değerlendir",
  "Bütçemi optimize et",
];

export function IQfinansAIAsistaniPreview() {
  return (
    <div className="space-y-4">
      <PreviewPageHeader
        icon={Bot}
        title="IQfinansAI Asistanı"
        description="Bütçen, harcamaların ve hedeflerin hakkında sor; cevaplar gerçek verilerine dayanır."
        badge={
          <PreviewBadge tone="success">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden
            />
            Çevrimiçi
          </PreviewBadge>
        }
      />

      <PreviewCard className="flex h-[440px] flex-col">
        <div className="flex-1 space-y-4 overflow-hidden p-4 sm:p-5">
          {MESSAGES.map((msg) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAssistant ? "" : "flex-row-reverse"}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isAssistant
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isAssistant ? (
                    <IQfinansAiAssistantIcon className="h-4 w-4" aria-hidden />
                  ) : (
                    <User className="h-3.5 w-3.5" aria-hidden />
                  )}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    isAssistant
                      ? "bg-muted/40 text-foreground"
                      : "bg-emerald-500/15 text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border/60 p-3 sm:p-4">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <span
                key={s}
                className="cursor-not-allowed rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
            <span className="flex-1 text-[12px] text-muted-foreground">
              IQfinansAI&apos;a sor…
            </span>
            <button
              type="button"
              disabled
              className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              aria-label="Gönder"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </PreviewCard>
    </div>
  );
}
