import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { DEBT_EXPENSE_CATEGORY } from "@/lib/domain/categories";
import { applyReceivableTotalDelta } from "@/lib/debts/receivable-lending-sync";
import { applyPayableTotalDelta } from "@/lib/debts/payable-borrowing-sync";
import {
  DEFAULT_DEBT_ASSET_UNIT,
  debtAssetUnitNeedsSymbol,
  isTryAssetUnit,
  normalizeDebtAssetSymbol,
} from "@/lib/debts/debt-asset-units";
import { debt, prisma } from "@/lib/db/prisma";
import { evaluateDebtDueAlerts } from "@/lib/debts/debt-due-alerts";
import { debtCreateSchema } from "@/lib/schemas/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await evaluateDebtDueAlerts(session.user.id);
    const items = await debt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    const body: unknown = await req.json();
    const parsed = debtCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const {
      direction,
      counterparty,
      totalAmount,
      paidAmount,
      assetUnit,
      assetSymbol,
      tryValueAtCreation,
      dueDate,
      note,
    } = parsed.data;
    const unit = assetUnit ?? DEFAULT_DEBT_ASSET_UNIT;
    const symbol = debtAssetUnitNeedsSymbol(unit)
      ? normalizeDebtAssetSymbol(assetSymbol)
      : null;
    if (debtAssetUnitNeedsSymbol(unit) && !symbol) {
      return NextResponse.json(
        { error: { assetSymbol: ["Sembol seçin"] } },
        { status: 400 },
      );
    }
    const isTryUnit = isTryAssetUnit(unit);
    const tryDelta = isTryUnit
      ? totalAmount
      : tryValueAtCreation && tryValueAtCreation > 0
        ? tryValueAtCreation
        : 0;
    const userId = session.user.id;
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.debt.create({
        data: {
          direction,
          counterparty,
          totalAmount,
          paidAmount,
          assetUnit: unit,
          assetSymbol: symbol,
          dueDate: dueDate ?? null,
          note: note ?? null,
          userId,
        },
      });
      if (direction === "RECEIVABLE" && tryDelta > 0) {
        await applyReceivableTotalDelta(tx, {
          userId,
          debtId: created.id,
          oldTotal: 0,
          newTotal: tryDelta,
          counterparty,
        });
      }
      if (direction === "PAYABLE" && tryDelta > 0) {
        await applyPayableTotalDelta(tx, {
          userId,
          debtId: created.id,
          oldTotal: 0,
          newTotal: tryDelta,
          counterparty,
        });
      }
      return created;
    });
    if (direction === "RECEIVABLE" && tryDelta > 0) {
      await evaluateCategoryBudgetsForTransactionContext({
        userId,
        type: "expense",
        category: DEBT_EXPENSE_CATEGORY,
        date: new Date(),
      });
    }
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
