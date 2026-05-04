import type { Prisma } from "@prisma/client";

const EPS = 1e-6;

export const PAYABLE_DEBT_CATEGORY = "Borç";
export const PAYABLE_DEBT_SUBCATEGORY = "Kişi borcu ödemesi";

export async function applyPayablePaidDelta(
  tx: Prisma.TransactionClient,
  args: {
    userId: string;
    debtId: string;
    oldPaid: number;
    newPaid: number;
    counterparty: string;
  },
): Promise<void> {
  const delta = args.newPaid - args.oldPaid;
  if (Math.abs(delta) < EPS) return;

  if (delta > 0) {
    await tx.transaction.create({
      data: {
        userId: args.userId,
        type: "expense",
        amount: delta,
        category: PAYABLE_DEBT_CATEGORY,
        subcategory: PAYABLE_DEBT_SUBCATEGORY,
        description: `Kime: ${args.counterparty}`,
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
