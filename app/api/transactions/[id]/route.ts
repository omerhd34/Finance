import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget-alerts";
import { prisma } from "@/lib/prisma";
import { transactionUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = transactionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const data = parsed.data;
    const tx = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.date !== undefined && { date: data.date }),
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
    const { id } = await context.params;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await prisma.transaction.delete({ where: { id } });
    if (existing.type === "expense") {
      await evaluateCategoryBudgetsForTransactionContext({
        userId: session.user.id,
        type: "expense",
        category: existing.category,
        date: new Date(existing.date),
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
