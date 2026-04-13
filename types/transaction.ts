export type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  userId: string;
  recurringRuleId?: string | null;
  recurringSlotKey?: string | null;
  createdAt: string;
};
