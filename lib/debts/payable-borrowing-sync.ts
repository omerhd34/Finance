import type { Prisma } from "@prisma/client";
import { DEBT_EXPENSE_CATEGORY } from "@/lib/domain/categories";

const EPS = 1e-6;

export function formatPayableBorrowingDescription(
  counterparty: string,
): string {
  return `Kimden: ${counterparty}`;
}

export function isPayableBorrowingIncome(
  type: string,
  category: string,
): boolean {
  return type === "income" && category === DEBT_EXPENSE_CATEGORY;
}

export async function applyPayableTotalDelta(
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
        type: "income",
        amount: delta,
        category: DEBT_EXPENSE_CATEGORY,
        subcategory: null,
        description: formatPayableBorrowingDescription(args.counterparty),
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
      type: "income",
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
