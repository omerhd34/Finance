import type { Prisma } from "@prisma/client";
import { DEBT_EXPENSE_CATEGORY } from "@/lib/domain/categories";

const EPS = 1e-6;

export function parseReceivableLendingCounterparty(
  description: string | null | undefined,
): string | null {
  const raw = description?.trim();
  if (!raw) return null;
  const kimeMatch = /^Kime:\s*(.+)$/i.exec(raw);
  const value = (kimeMatch?.[1] ?? raw).trim();
  return value || null;
}

export function formatReceivableLendingDescription(
  counterparty: string,
): string {
  return `Kime: ${counterparty}`;
}

export function formatReceivableLendingDeltaDescription(
  counterparty: string,
): string {
  return `Kime: ${counterparty}`;
}

export async function applyReceivableTotalDelta(
  tx: Prisma.TransactionClient,
  args: {
    userId: string;
    debtId: string;
    oldTotal: number;
    newTotal: number;
    counterparty: string;
  },
): Promise<void> {
  const delta = args.newTotal - args.oldTotal;
  if (Math.abs(delta) < EPS) return;

  if (delta > 0) {
    await tx.transaction.create({
      data: {
        userId: args.userId,
        type: "expense",
        amount: delta,
        category: DEBT_EXPENSE_CATEGORY,
        subcategory: null,
        description: formatReceivableLendingDeltaDescription(args.counterparty),
        date: new Date(),
        debtId: args.debtId,
      },
    });
    return;
  }

  let need = -delta;
  const rows = await tx.transaction.findMany({
    where: {
      debtId: args.debtId,
      userId: args.userId,
      type: "expense",
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  for (const row of rows) {
    if (need < EPS) break;
    if (row.amount <= need + EPS) {
      await tx.transaction.delete({ where: { id: row.id } });
      need -= row.amount;
    } else {
      await tx.transaction.update({
        where: { id: row.id },
        data: { amount: row.amount - need },
      });
      need = 0;
    }
  }
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

export async function applyReceivableLendingTransaction(
  tx: Prisma.TransactionClient,
  args: {
    userId: string;
    transactionId: string;
    amount: number;
    description: string | null;
  },
): Promise<void> {
  const counterparty = parseReceivableLendingCounterparty(args.description);
  if (!counterparty) {
    throw new Error("RECEIVABLE_LENDING_COUNTERPARTY_REQUIRED");
  }

  const existing = await findReceivableDebtByCounterparty(
    tx,
    args.userId,
    counterparty,
  );

  const debtId = existing
    ? (
        await tx.debt.update({
          where: { id: existing.id },
          data: { totalAmount: existing.totalAmount + args.amount },
        })
      ).id
    : (
        await tx.debt.create({
          data: {
            userId: args.userId,
            direction: "RECEIVABLE",
            counterparty,
            totalAmount: args.amount,
            paidAmount: 0,
          },
        })
      ).id;

  await tx.transaction.update({
    where: { id: args.transactionId },
    data: {
      debtId,
      description: formatReceivableLendingDescription(counterparty),
    },
  });
}

export async function reverseReceivableLendingTransaction(
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

  const nextTotal = debt.totalAmount - args.amount;
  if (nextTotal + EPS < debt.paidAmount) {
    throw new Error("RECEIVABLE_LENDING_TOTAL_BELOW_PAID");
  }

  if (nextTotal <= EPS) {
    await tx.debt.delete({ where: { id: debt.id } });
    return;
  }

  await tx.debt.update({
    where: { id: debt.id },
    data: { totalAmount: nextTotal },
  });
}

export function isReceivableLendingExpense(
  type: string,
  category: string,
): boolean {
  return type === "expense" && category === DEBT_EXPENSE_CATEGORY;
}
