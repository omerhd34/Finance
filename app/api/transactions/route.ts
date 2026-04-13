import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dedupeTransactionRows } from "@/lib/dedupe-transactions-display";
import { prisma } from "@/lib/prisma";
import { transactionCreateSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

const transactionTotalDedupeSelect = {
  id: true,
  recurringSlotKey: true,
  date: true,
  amount: true,
  category: true,
  description: true,
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
      Math.max(1, Number(searchParams.get("pageSize") ?? "10")),
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
      where.OR = [
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }

    if (limit) {
      const cap = Math.min(2000, Math.max(1, Number(limit)));
      const fetchRaw = Math.min(8000, cap * 4);
      const raw = await prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        take: fetchRaw,
      });
      const deduped = dedupeTransactionRows(raw);
      const items = deduped.slice(0, cap);
      return NextResponse.json({
        items,
        total: deduped.length,
        page: 1,
        pageSize: cap,
      });
    }

    const rowsForTotal = await prisma.transaction.findMany({
      where,
      select: transactionTotalDedupeSelect,
    });
    const total = dedupeTransactionRows(rowsForTotal).length;

    const items = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return NextResponse.json({ items, total, page, pageSize });
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
    const body: unknown = await req.json();
    const parsed = transactionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { type, amount, category, description, date } = parsed.data;
    const tx = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        description: description ?? null,
        date,
        userId: session.user.id,
      },
    });
    return NextResponse.json(tx, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
