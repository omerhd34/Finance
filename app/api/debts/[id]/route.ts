import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { debt } from "@/lib/db/prisma";
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
    const existing = await debt.findFirst({
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
    if (nextPaid > nextTotal) {
      return NextResponse.json(
        { error: { paidAmount: ["Ödenen tutar toplamı aşamaz"] } },
        { status: 400 },
      );
    }
    const row = await debt.update({
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
    const existing = await debt.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await debt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
