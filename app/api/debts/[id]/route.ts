import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { prisma } from "@/lib/db/prisma";
import { DEBT_EXPENSE_CATEGORY } from "@/lib/domain/categories";
import { applyPayablePaidDelta } from "@/lib/debts/payable-expense-sync";
import { applyPayableTotalDelta } from "@/lib/debts/payable-borrowing-sync";
import { applyReceivablePaidDelta } from "@/lib/debts/receivable-income-sync";
import { applyReceivableTotalDelta } from "@/lib/debts/receivable-lending-sync";
import { clearDebtDueAlertHistoryForDebt } from "@/lib/debts/debt-due-alerts";
import { debtUpdateSchema } from "@/lib/schemas/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = debtUpdateSchema.safeParse(body);
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
    const data = parsed.data;
    let dueDateChanged = false;
    if (data.dueDate !== undefined) {
      const existingDue = existing.dueDate ? new Date(existing.dueDate) : null;
      const nextDue = data.dueDate ? new Date(data.dueDate) : null;
      dueDateChanged = existingDue?.getTime() !== nextDue?.getTime();
    }

    const nextTotal =
      data.totalAmount !== undefined ? data.totalAmount : existing.totalAmount;
    const nextPaid =
      data.paidAmount !== undefined ? data.paidAmount : existing.paidAmount;
    const nextDirection =
      data.direction !== undefined ? data.direction : existing.direction;
    const nextCounterparty =
      data.counterparty !== undefined
        ? data.counterparty
        : existing.counterparty;
    if (nextPaid > nextTotal) {
      return NextResponse.json(
        { error: { paidAmount: ["Ödenen tutar toplamı aşamaz"] } },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    let payablePaidAdjusted = false;
    let receivableTotalAdjusted = false;
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.debt.update({
        where: { id },
        data: {
          ...(data.direction !== undefined && { direction: data.direction }),
          ...(data.counterparty !== undefined && {
            counterparty: data.counterparty,
          }),
          ...(data.totalAmount !== undefined && {
            totalAmount: data.totalAmount,
          }),
          ...(data.paidAmount !== undefined && { paidAmount: data.paidAmount }),
          ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
          ...(data.note !== undefined && { note: data.note }),
        },
      });

      if (
        existing.direction === "RECEIVABLE" &&
        nextDirection !== "RECEIVABLE"
      ) {
        await tx.transaction.deleteMany({
          where: { debtId: id, userId, type: "income" },
        });
        await tx.transaction.deleteMany({
          where: { debtId: id, userId, type: "expense" },
        });
      }

      if (existing.direction === "PAYABLE" && nextDirection !== "PAYABLE") {
        await tx.transaction.deleteMany({
          where: { debtId: id, userId, type: "expense" },
        });
        await tx.transaction.deleteMany({
          where: { debtId: id, userId, type: "income" },
        });
      }

      if (
        nextDirection === "RECEIVABLE" &&
        existing.direction === "RECEIVABLE"
      ) {
        if (data.paidAmount !== undefined && nextPaid !== existing.paidAmount) {
          await applyReceivablePaidDelta(tx, {
            userId,
            debtId: id,
            oldPaid: existing.paidAmount,
            newPaid: nextPaid,
            counterparty: nextCounterparty,
          });
        }
        if (
          data.totalAmount !== undefined &&
          nextTotal !== existing.totalAmount
        ) {
          receivableTotalAdjusted = true;
          await applyReceivableTotalDelta(tx, {
            userId,
            debtId: id,
            oldTotal: existing.totalAmount,
            newTotal: nextTotal,
            counterparty: nextCounterparty,
          });
        }
        if (
          data.counterparty !== undefined &&
          nextCounterparty !== existing.counterparty
        ) {
          await tx.transaction.updateMany({
            where: { debtId: id, userId, type: "income" },
            data: { description: `Kimden: ${nextCounterparty}` },
          });
          await tx.transaction.updateMany({
            where: { debtId: id, userId, type: "expense" },
            data: {
              description: `Kime: ${nextCounterparty}`,
            },
          });
        }
      }

      if (nextDirection === "PAYABLE" && existing.direction === "PAYABLE") {
        if (data.paidAmount !== undefined && nextPaid !== existing.paidAmount) {
          payablePaidAdjusted = true;
          await applyPayablePaidDelta(tx, {
            userId,
            debtId: id,
            oldPaid: existing.paidAmount,
            newPaid: nextPaid,
            counterparty: nextCounterparty,
          });
        }
        if (
          data.totalAmount !== undefined &&
          nextTotal !== existing.totalAmount
        ) {
          await applyPayableTotalDelta(tx, {
            userId,
            debtId: id,
            oldTotal: existing.totalAmount,
            newTotal: nextTotal,
            counterparty: nextCounterparty,
          });
        }
        if (
          data.counterparty !== undefined &&
          nextCounterparty !== existing.counterparty
        ) {
          await tx.transaction.updateMany({
            where: {
              debtId: id,
              userId,
              type: "expense",
              category: DEBT_EXPENSE_CATEGORY,
            },
            data: { description: `Kime: ${nextCounterparty}` },
          });
          await tx.transaction.updateMany({
            where: { debtId: id, userId, type: "income" },
            data: { description: `Kimden: ${nextCounterparty}` },
          });
        }
      }

      return updated;
    });

    if (payablePaidAdjusted || receivableTotalAdjusted) {
      await evaluateCategoryBudgetsForTransactionContext({
        userId,
        type: "expense",
        category: DEBT_EXPENSE_CATEGORY,
        date: new Date(),
      });
    }

    if (dueDateChanged) {
      await clearDebtDueAlertHistoryForDebt(session.user.id, id);
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    const { id } = await context.params;
    const existing = await prisma.debt.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await prisma.debt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
