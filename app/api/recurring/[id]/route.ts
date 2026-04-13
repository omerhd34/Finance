import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recurringRule } from "@/lib/prisma";
import {
  alignNextDueToFuture,
  normalizeDueDate,
  type RecurringFrequency,
} from "@/lib/recurring-schedule";
import { recurringUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await context.params;
    const row = await recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!row) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await context.params;
    const existing = await recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const body: unknown = await req.json();
    const parsed = recurringUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const startDate = data.startDate ?? new Date(existing.startDate);
    const frequency = data.frequency ?? existing.frequency;
    const interval = data.interval ?? existing.interval;
    const endDate =
      data.endDate !== undefined ? data.endDate : existing.endDate;

    if (endDate && startDate > endDate) {
      return NextResponse.json(
        { error: "Bitiş tarihi başlangıçtan önce olamaz" },
        { status: 400 },
      );
    }

    let nextDueDate: Date = new Date(existing.nextDueDate);
    const scheduleChanged =
      (data.startDate !== undefined &&
        new Date(data.startDate).getTime() !==
          new Date(existing.startDate).getTime()) ||
      (data.frequency !== undefined && data.frequency !== existing.frequency) ||
      (data.interval !== undefined && data.interval !== existing.interval);
    if (scheduleChanged) {
      nextDueDate = alignNextDueToFuture(
        normalizeDueDate(startDate),
        frequency as RecurringFrequency,
        interval,
        new Date(),
      );
    }

    const row = await recurringRule.update({
      where: { id },
      data: {
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.description !== undefined
          ? {
              description: data.description?.trim()
                ? data.description.trim()
                : null,
            }
          : {}),
        ...(data.frequency !== undefined ? { frequency: data.frequency } : {}),
        ...(data.interval !== undefined ? { interval: data.interval } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
        ...(data.mode !== undefined ? { mode: data.mode } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        nextDueDate,
      },
    });
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
    const { id } = await context.params;
    const existing = await recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await recurringRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
