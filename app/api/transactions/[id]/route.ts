import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget-alerts";
import { prisma } from "@/lib/prisma";
import { transactionCreateSchema } from "@/lib/validations";

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
        ? (data.subcategory?.trim() ? data.subcategory.trim() : null)
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
