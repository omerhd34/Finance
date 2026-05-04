import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { prisma } from "@/lib/db/prisma";
import {
  PAYABLE_DEBT_CATEGORY,
  PAYABLE_DEBT_SUBCATEGORY,
} from "@/lib/debts/payable-expense-sync";
import { payDebtSchema } from "@/lib/debts/debts-schema";

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
    const parsed = payDebtSchema.safeParse(body);
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

    const userId = session.user.id;
    const paymentDate = new Date();
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.debt.update({
        where: { id },
        data: { paidAmount: existing.paidAmount + applied },
      });
      if (existing.direction === "RECEIVABLE") {
        await tx.transaction.create({
          data: {
            userId,
            type: "income",
            amount: applied,
            category: "Alacak",
            subcategory: null,
            description: `Kimden: ${existing.counterparty}`,
            date: paymentDate,
            debtId: id,
          },
        });
      } else if (existing.direction === "PAYABLE") {
        await tx.transaction.create({
          data: {
            userId,
            type: "expense",
            amount: applied,
            category: PAYABLE_DEBT_CATEGORY,
            subcategory: PAYABLE_DEBT_SUBCATEGORY,
            description: `Kime: ${existing.counterparty}`,
            date: paymentDate,
            debtId: id,
          },
        });
      }
      return updated;
    });

    if (existing.direction === "PAYABLE") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId,
        type: "expense",
        category: PAYABLE_DEBT_CATEGORY,
        date: paymentDate,
      });
    }

    return NextResponse.json(row, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Uygulanamadı" }, { status: 500 });
  }
}
