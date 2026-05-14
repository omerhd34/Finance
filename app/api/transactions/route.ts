import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { dedupeTransactionRows } from "@/lib/transactions/dedupe-transactions-display";
import { prisma } from "@/lib/db/prisma";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { transactionCreateSchema } from "@/lib/schemas/validations";
import type { Prisma } from "@prisma/client";

function finiteAmount(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function signedTotalFromRows(
  rows: { type: string; amount: unknown }[],
): number {
  let s = 0;
  for (const t of rows) {
    const a = finiteAmount(t.amount);
    s += t.type === "income" ? a : -a;
  }
  return Number.isFinite(s) ? s : 0;
}

function transactionListOrderBy(
  searchParams: URLSearchParams,
): Prisma.TransactionOrderByWithRelationInput[] {
  const sortBy = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder");
  const ord: "asc" | "desc" = sortOrderRaw === "asc" ? "asc" : "desc";
  if (sortBy === "amount") {
    return [{ amount: ord }, { date: ord }, { id: ord }];
  }
  if (sortBy === "date") {
    return [{ date: ord }, { id: ord }];
  }
  return [{ date: "desc" }, { id: "desc" }];
}

const transactionTotalDedupeSelect = {
  id: true,
  recurringSlotKey: true,
  date: true,
  amount: true,
  category: true,
  description: true,
  type: true,
} as Prisma.TransactionSelect;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") ?? "5")),
    );
    const limit = searchParams.get("limit");

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
    };
    if (type === "income" || type === "expense") {
      where.type = type;
    }
    if (category) {
      where.category = category;
    }
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    if (search?.trim()) {
      const q = search.trim();
      where.description = { contains: q };
    }

    if (limit) {
      const cap = Math.min(2000, Math.max(1, Number(limit)));
      const fetchRaw = Math.min(8000, cap * 4);
      const raw = await prisma.transaction.findMany({
        where,
        orderBy: transactionListOrderBy(searchParams),
        take: fetchRaw,
      });
      const deduped = dedupeTransactionRows(raw);
      const items = deduped.slice(0, cap);
      const signedTotalTry = signedTotalFromRows(deduped);
      return NextResponse.json({
        items,
        total: deduped.length,
        page: 1,
        pageSize: cap,
        signedTotalTry,
      });
    }

    const rowsForTotal = await prisma.transaction.findMany({
      where,
      select: transactionTotalDedupeSelect,
    });
    const dedupedForTotal = dedupeTransactionRows(rowsForTotal);
    const total = dedupedForTotal.length;
    const signedTotalTry = signedTotalFromRows(dedupedForTotal);

    const items = await prisma.transaction.findMany({
      where,
      orderBy: transactionListOrderBy(searchParams),
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      signedTotalTry,
    });
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
    const parsed = transactionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { type, amount, category, subcategory, description, date } =
      parsed.data;
    const sub =
      type === "expense"
        ? subcategory?.trim()
          ? subcategory.trim()
          : null
        : null;
    const tx = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        subcategory: sub,
        description: description ?? null,
        date,
        userId: session.user.id,
      },
    });
    await evaluateCategoryBudgetsForTransactionContext({
      userId: session.user.id,
      type: tx.type,
      category: tx.category,
      date: tx.date,
    });
    return NextResponse.json(tx, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
