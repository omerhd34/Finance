import type { DebtAssetUnit } from "@/lib/debts/debt-asset-units";

export type Debt = {
  id: string;
  direction: "RECEIVABLE" | "PAYABLE";
  counterparty: string;
  totalAmount: number;
  paidAmount: number;
  assetUnit: DebtAssetUnit;
  assetSymbol: string | null;
  dueDate: string | null;
  note: string | null;
  userId: string;
  createdAt: string;
};
