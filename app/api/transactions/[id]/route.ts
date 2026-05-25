import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { prisma } from "@/lib/db/prisma";
import { transactionCreateSchema } from "@/lib/schemas/validations";
import {
  isReceivableLendingExpense,
  reverseReceivableLendingTransaction,
} from "@/lib/debts/receivable-lending-sync";
import {
  isReceivableCollectionIncome,
  reverseReceivableCollectionTransaction,
} from "@/lib/debts/receivable-collection-sync";

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
    const raw =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const merged = {
      type: (raw.type as string | undefined) ?? existing.type,
      amount: (raw.amount as number | undefined) ?? existing.amount,
      category: (raw.category as string | undefined) ?? existing.category,
      subcategory:
        raw.subcategory !== undefined
          ? (raw.subcategory as string | null)
          : existing.subcategory,
      description:
        raw.description !== undefined
          ? (raw.description as string | null | undefined)
          : existing.description,
      date:
        raw.date !== undefined
          ? new Date(raw.date as string)
          : new Date(existing.date),
    };
    const parsed = transactionCreateSchema.safeParse({
      type: merged.type,
      amount: merged.amount,
      category: merged.category,
      subcategory: merged.subcategory ?? undefined,
      description: merged.description ?? undefined,
      date: merged.date,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const data = parsed.data;
    const sub =
      data.type === "expense"
        ? data.subcategory?.trim()
          ? data.subcategory.trim()
          : null
        : null;
    const tx = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount,
        category: data.category,
        subcategory: sub,
        description: data.description ?? null,
        date: data.date,
      },
    });
    if (existing.type === "expense") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId: session.user.id,
        type: "expense",
        category: existing.category,
        date: new Date(existing.date),
      });
    }
    if (tx.type === "expense") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId: session.user.id,
        type: "expense",
        category: tx.category,
        date: tx.date,
      });
    }
    return NextResponse.json(tx);
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
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await prisma.$transaction(async (txClient) => {
      if (existing.debtId) {
        const linkedDebt = await txClient.debt.findFirst({
          where: { id: existing.debtId, userId: session.user.id },
          select: { assetUnit: true },
        });
        const isTryDebt =
          !linkedDebt?.assetUnit || linkedDebt.assetUnit === "TL";
        if (
          isTryDebt &&
          isReceivableLendingExpense(existing.type, existing.category)
        ) {
          await reverseReceivableLendingTransaction(txClient, {
            userId: session.user.id,
            debtId: existing.debtId,
            amount: existing.amount,
          });
        } else if (
          isTryDebt &&
          isReceivableCollectionIncome(existing.type, existing.category)
        ) {
          await reverseReceivableCollectionTransaction(txClient, {
            userId: session.user.id,
            debtId: existing.debtId,
            amount: existing.amount,
          });
        }
      }
      if (existing.recurringRuleId && existing.recurringSlotKey) {
        await (
          txClient as unknown as {
            recurringSkippedSlot: {
              upsert(args: {
                where: object;
                create: object;
                update: object;
              }): Promise<unknown>;
            };
          }
        ).recurringSkippedSlot.upsert({
          where: {
            ruleId_slotKey: {
              ruleId: existing.recurringRuleId,
              slotKey: existing.recurringSlotKey,
            },
          },
          create: {
            ruleId: existing.recurringRuleId,
            slotKey: existing.recurringSlotKey,
          },
          update: {},
        });
      }
      await txClient.transaction.delete({ where: { id } });
    });
    if (existing.type === "expense") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId: session.user.id,
        type: "expense",
        category: existing.category,
        date: new Date(existing.date),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (
      e instanceof Error &&
      e.message === "RECEIVABLE_LENDING_TOTAL_BELOW_PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "Bu borç verme kaydı silinirse alacak toplamı ödenen tutarın altına düşer.",
        },
        { status: 400 },
      );
    }
    if (
      e instanceof Error &&
      e.message === "RECEIVABLE_COLLECTION_PAID_BELOW_ZERO"
    ) {
      return NextResponse.json(
        {
          error: "Bu alacak kaydı silinirse ödenen tutar geçersiz hale gelir.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
