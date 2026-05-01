import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget-alerts";
import { prisma } from "@/lib/prisma";
import { transactionBatchCreateSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;

    const body: unknown = await req.json();
    const parsed = transactionBatchCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { items } = parsed.data;
    const userId = session.user.id;

    const created = await prisma.$transaction(
      items.map((item) =>
        prisma.transaction.create({
          data: {
            type: item.type,
            amount: item.amount,
            category: item.category,
            description: item.description ?? null,
            date: item.date,
            userId,
          },
        }),
      ),
    );

    for (const tx of created) {
      await evaluateCategoryBudgetsForTransactionContext({
        userId,
        type: tx.type,
        category: tx.category,
        date: tx.date,
      });
    }

    return NextResponse.json({ items: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
