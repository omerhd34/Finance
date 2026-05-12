import type { Prisma } from "@prisma/client";
import { RECEIVABLE_INCOME_CATEGORY } from "@/lib/domain/categories";

const EPS = 1e-6;

export function parseReceivableCollectionCounterparty(
  description: string | null | undefined,
): string | null {
  const raw = description?.trim();
  if (!raw) return null;
  const kimdenMatch = /^Kimden:\s*(.+)$/i.exec(raw);
  const value = (kimdenMatch?.[1] ?? raw).trim();
  return value || null;
}

export function formatReceivableCollectionDescription(
  counterparty: string,
): string {
  return `Kimden: ${counterparty}`;
}

function counterpartyKey(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

async function findReceivableDebtByCounterparty(
  tx: Prisma.TransactionClient,
  userId: string,
  counterparty: string,
) {
  const debts = await tx.debt.findMany({
    where: { userId, direction: "RECEIVABLE" },
  });
  const key = counterpartyKey(counterparty);
  return debts.find((d) => counterpartyKey(d.counterparty) === key) ?? null;
}

export async function applyReceivableCollectionTransaction(
  tx: Prisma.TransactionClient,
  args: {
    userId: string;
    transactionId: string;
    amount: number;
    description: string | null;
  },
): Promise<void> {
  const counterparty = parseReceivableCollectionCounterparty(args.description);
  if (!counterparty) {
    throw new Error("RECEIVABLE_COLLECTION_COUNTERPARTY_REQUIRED");
  }

  const debt = await findReceivableDebtByCounterparty(
    tx,
    args.userId,
    counterparty,
  );
  if (!debt) {
    throw new Error("RECEIVABLE_COLLECTION_DEBT_NOT_FOUND");
  }

  const remaining = debt.totalAmount - debt.paidAmount;
  const applied = Math.min(args.amount, remaining);
  if (applied <= EPS) {
    throw new Error("RECEIVABLE_COLLECTION_NO_REMAINING");
  }

  await tx.debt.update({
    where: { id: debt.id },
    data: { paidAmount: debt.paidAmount + applied },
  });

  await tx.transaction.update({
    where: { id: args.transactionId },
    data: {
      debtId: debt.id,
      amount: applied,
      description: formatReceivableCollectionDescription(counterparty),
    },
  });
}

export async function reverseReceivableCollectionTransaction(
  tx: Prisma.TransactionClient,
  args: {
    userId: string;
    debtId: string;
    amount: number;
  },
): Promise<void> {
  const debt = await tx.debt.findFirst({
    where: { id: args.debtId, userId: args.userId, direction: "RECEIVABLE" },
  });
  if (!debt) return;

  const nextPaid = debt.paidAmount - args.amount;
  if (nextPaid < -EPS) {
    throw new Error("RECEIVABLE_COLLECTION_PAID_BELOW_ZERO");
  }

  await tx.debt.update({
    where: { id: debt.id },
    data: { paidAmount: Math.max(0, nextPaid) },
  });
}

export function isReceivableCollectionIncome(
  type: string,
  category: string,
): boolean {
  return type === "income" && category === RECEIVABLE_INCOME_CATEGORY;
}
