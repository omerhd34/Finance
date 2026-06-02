import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getBudgetPeriodForDate } from "@/lib/budget/budget-alerts";
import { prisma } from "@/lib/db/prisma";
import {
  DEBT_EXPENSE_CATEGORY,
  RECEIVABLE_INCOME_CATEGORY,
} from "@/lib/domain/categories";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const userId = session.user.id;
    const monthStartDay = session.user.monthStartDay ?? 1;
    const now = new Date();
    const { start, end, monthKey } = getBudgetPeriodForDate(now, monthStartDay);

    const [collected, paid] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: "income",
          category: RECEIVABLE_INCOME_CATEGORY,
          debtId: { not: null },
          date: { gte: start, lte: end },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: "expense",
          category: DEBT_EXPENSE_CATEGORY,
          debtId: { not: null },
          date: { gte: start, lte: end },
          debt: { direction: "PAYABLE" },
        },
      }),
    ]);

    return NextResponse.json({
      monthKey,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      paidThisPeriod: {
        receivableTry: collected._sum.amount ?? 0,
        payableTry: paid._sum.amount ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
