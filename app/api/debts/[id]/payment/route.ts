import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { prisma } from "@/lib/db/prisma";
import { DEBT_EXPENSE_CATEGORY } from "@/lib/domain/categories";
import { isTryAssetUnit } from "@/lib/debts/debt-asset-units";
import { shouldSyncDebtTransactions } from "@/lib/debts/debt-transaction-sync";
import { debtAmountEventServerSchema } from "@/lib/debts/debts-schema";

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

    const remaining = existing.totalAmount - existing.paidAmount;
    const applied = Math.min(parsed.data.amount, remaining);
    if (applied <= 0) {
      return NextResponse.json(
        { error: { amount: ["Kalan tutar yok veya geçersiz tutar"] } },
        { status: 400 },
      );
    }

    const isTryUnit = isTryAssetUnit(existing.assetUnit);
    const syncTransactions = shouldSyncDebtTransactions(existing);
    let tryAmount = 0;
    if (syncTransactions && isTryUnit) {
      tryAmount = applied;
    } else if (
      syncTransactions &&
      parsed.data.tryValueDelta &&
      parsed.data.tryValueDelta > 0
    ) {
      const ratio = parsed.data.amount > 0 ? applied / parsed.data.amount : 0;
      tryAmount = parsed.data.tryValueDelta * ratio;
    }

    const userId = session.user.id;
    const paymentDate = new Date();
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.debt.update({
        where: { id },
        data: { paidAmount: existing.paidAmount + applied },
      });
      if (tryAmount > 0 && existing.direction === "RECEIVABLE") {
        await tx.transaction.create({
          data: {
            userId,
            type: "income",
            amount: tryAmount,
            category: "Alacak",
            subcategory: null,
            description: `Kimden: ${existing.counterparty}`,
            date: paymentDate,
            debtId: id,
          },
        });
      } else if (tryAmount > 0 && existing.direction === "PAYABLE") {
        await tx.transaction.create({
          data: {
            userId,
            type: "expense",
            amount: tryAmount,
            category: DEBT_EXPENSE_CATEGORY,
            subcategory: null,
            description: `Kime: ${existing.counterparty}`,
            date: paymentDate,
            debtId: id,
          },
        });
      }
      return updated;
    });

    if (tryAmount > 0 && existing.direction === "PAYABLE") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId,
        type: "expense",
        category: DEBT_EXPENSE_CATEGORY,
        date: paymentDate,
      });
    }

    return NextResponse.json(row, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Uygulanamadı" }, { status: 500 });
  }
}
