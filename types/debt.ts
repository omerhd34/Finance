export type Debt = {
  id: string;
  direction: "RECEIVABLE" | "PAYABLE";
  counterparty: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string | null;
  note: string | null;
  userId: string;
  createdAt: string;
};
