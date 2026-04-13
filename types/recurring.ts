export type RecurringRule = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  frequency: string;
  interval: number;
  startDate: string;
  endDate: string | null;
  mode: string;
  isActive: boolean;
  nextDueDate: string;
  createdAt: string;
  updatedAt: string;
};
