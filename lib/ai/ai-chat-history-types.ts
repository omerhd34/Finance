export type AiChatHistoryTurn = {
  id: string;
  conversationId?: string | null;
  userMessage: string;
  assistantReply: string;
  createdAt: string;
};
