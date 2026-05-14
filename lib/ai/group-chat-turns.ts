import type { AiChatHistoryTurn } from "@/lib/ai/ai-chat-history-types";

export function chatTurnThreadKey(t: {
  id: string;
  conversationId?: string | null;
}): string {
  const cid = t.conversationId;
  if (typeof cid === "string") {
    const trimmed = cid.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return t.id;
}

export type AiChatHistoryGroup = {
  conversationId: string;
  turns: AiChatHistoryTurn[];
};

export function groupChatTurns(
  turns: AiChatHistoryTurn[],
): AiChatHistoryGroup[] {
  const byKey = new Map<string, AiChatHistoryTurn[]>();
  for (const t of turns) {
    const key = chatTurnThreadKey(t);
    const list = byKey.get(key);
    if (list) list.push(t);
    else byKey.set(key, [t]);
  }
  const groups: AiChatHistoryGroup[] = [];
  for (const [conversationId, list] of byKey) {
    const sorted = [...list].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    groups.push({ conversationId, turns: sorted });
  }
  groups.sort((a, b) => {
    const ta = a.turns[a.turns.length - 1]?.createdAt ?? "";
    const tb = b.turns[b.turns.length - 1]?.createdAt ?? "";
    return new Date(tb).getTime() - new Date(ta).getTime();
  });
  return groups;
}
