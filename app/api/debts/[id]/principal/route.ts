import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { prisma } from "@/lib/db/prisma";
import { DEBT_EXPENSE_CATEGORY } from "@/lib/domain/categories";
import { isTryAssetUnit } from "@/lib/debts/debt-asset-units";
import { shouldSyncDebtTransactions } from "@/lib/debts/debt-transaction-sync";
import { debtAmountEventServerSchema } from "@/lib/debts/debts-schema";
import { applyReceivableTotalDelta } from "@/lib/debts/receivable-lending-sync";
import { applyPayableTotalDelta } from "@/lib/debts/payable-borrowing-sync";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;

    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = debtAmountEventServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.debt.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    const added = parsed.data.amount;
    const syncTransactions = shouldSyncDebtTransactions(existing);
    const tryDelta = syncTransactions && isTryAssetUnit(existing.assetUnit)
      ? added
      : syncTransactions &&
          parsed.data.tryValueDelta &&
          parsed.data.tryValueDelta > 0
        ? parsed.data.tryValueDelta
        : 0;
    const newTotal = existing.totalAmount + added;
    const userId = session.user.id;
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.debt.update({
        where: { id },
        data: { totalAmount: newTotal },
      });
      if (tryDelta > 0 && existing.direction === "RECEIVABLE") {
        await applyReceivableTotalDelta(tx, {
          userId,
          debtId: id,
          oldTotal: 0,
          newTotal: tryDelta,
          counterparty: existing.counterparty,
        });
      } else if (tryDelta > 0 && existing.direction === "PAYABLE") {
        await applyPayableTotalDelta(tx, {
          userId,
          debtId: id,
          oldTotal: 0,
          newTotal: tryDelta,
          counterparty: existing.counterparty,
        });
      }
      return updated;
    });

    if (tryDelta > 0 && existing.direction === "RECEIVABLE") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId,
        type: "expense",
        category: DEBT_EXPENSE_CATEGORY,
        date: new Date(),
      });
    }

    return NextResponse.json(row, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Uygulanamadı" }, { status: 500 });
  }
}
