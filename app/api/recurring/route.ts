import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recurringRule } from "@/lib/prisma";
import { normalizeDueDate } from "@/lib/recurring-schedule";
import { recurringCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const items = await recurringRule.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isActive: "desc" }, { nextDueDate: "asc" }],
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
    const body: unknown = await req.json();
    const parsed = recurringCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const {
      type,
      amount,
      category,
      description,
      frequency,
      interval,
      startDate,
      endDate,
      mode,
      isActive,
    } = parsed.data;

    const nextDueDate = normalizeDueDate(startDate);

    const row = await recurringRule.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        category,
        description: description?.trim() ? description.trim() : null,
        frequency,
        interval,
        startDate,
        endDate: endDate ?? null,
        mode,
        isActive,
        nextDueDate,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
