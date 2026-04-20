import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import {
  evaluateCategoryBudgetForMonth,
  getExpenseTotalForCategoryMonth,
} from "@/lib/budget-alerts";
import { categoryBudget } from "@/lib/prisma";
import { categoryBudgetUpdateSchema } from "@/lib/validations";
import { format } from "date-fns";

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
    const parsed = categoryBudgetUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const existing = await categoryBudget.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const data = parsed.data;
    const row = await categoryBudget.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category.trim() }),
        ...(data.monthlyLimit !== undefined && {
          monthlyLimit: data.monthlyLimit,
        }),
        ...(data.alertThresholdPercent !== undefined && {
          alertThresholdPercent: data.alertThresholdPercent,
        }),
        ...(data.emailAlertsEnabled !== undefined && {
          emailAlertsEnabled: data.emailAlertsEnabled,
        }),
      },
    });
    const now = new Date();
    if (existing.category !== row.category) {
      await evaluateCategoryBudgetForMonth(
        session.user.id,
        existing.category,
        now,
      );
    }
    await evaluateCategoryBudgetForMonth(session.user.id, row.category, now);
    const spentThisMonth = await getExpenseTotalForCategoryMonth(
      session.user.id,
      row.category,
      now,
    );
    return NextResponse.json({
      id: row.id,
      category: row.category,
      monthlyLimit: row.monthlyLimit,
      alertThresholdPercent: row.alertThresholdPercent,
      emailAlertsEnabled: row.emailAlertsEnabled,
      spentThisMonth,
      monthKey: format(now, "yyyy-MM"),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
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
    const existing = await categoryBudget.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await categoryBudget.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
