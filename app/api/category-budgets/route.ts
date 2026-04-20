import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import {
  evaluateCategoryBudgetForMonth,
  getExpenseTotalForCategoryMonth,
} from "@/lib/budget-alerts";
import { categoryBudget } from "@/lib/prisma";
import { categoryBudgetCreateSchema } from "@/lib/validations";
import { format } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const now = new Date();
    const monthKey = format(now, "yyyy-MM");
    const rows = await categoryBudget.findMany({
      where: { userId: session.user.id },
      orderBy: { category: "asc" },
    });
    const items = await Promise.all(
      rows.map(async (b) => {
        const spentThisMonth = await getExpenseTotalForCategoryMonth(
          session.user!.id,
          b.category,
          now,
        );
        return {
          id: b.id,
          category: b.category,
          monthlyLimit: b.monthlyLimit,
          alertThresholdPercent: b.alertThresholdPercent,
          emailAlertsEnabled: b.emailAlertsEnabled,
          spentThisMonth,
          monthKey,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        };
      }),
    );
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
    const parsed = categoryBudgetCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const {
      category,
      monthlyLimit,
      alertThresholdPercent,
      emailAlertsEnabled,
    } = parsed.data;
    const row = await categoryBudget.create({
      data: {
        userId: session.user.id,
        category: category.trim(),
        monthlyLimit,
        alertThresholdPercent,
        emailAlertsEnabled,
      },
    });
    const now = new Date();
    await evaluateCategoryBudgetForMonth(session.user.id, row.category, now);
    const spentThisMonth = await getExpenseTotalForCategoryMonth(
      session.user.id,
      row.category,
      now,
    );
    return NextResponse.json(
      {
        id: row.id,
        category: row.category,
        monthlyLimit: row.monthlyLimit,
        alertThresholdPercent: row.alertThresholdPercent,
        emailAlertsEnabled: row.emailAlertsEnabled,
        spentThisMonth,
        monthKey: format(now, "yyyy-MM"),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e
        ? (e as { code?: string }).code
        : undefined;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Bu kategori için zaten bir bütçe tanımlı" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
