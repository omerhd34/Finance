export type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  userId: string;
  createdAt: string;
};
