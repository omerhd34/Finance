import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { prisma, recurringRule } from "@/lib/db/prisma";
import {
  addRecurringInterval,
  alignNextDueToFuture,
  normalizeDueDate,
  type RecurringFrequency,
} from "@/lib/recurring/recurring-schedule";
import { recurringCreateSchema } from "@/lib/schemas/validations";

type RouteContext = { params: Promise<{ id: string }> };

function isSameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function normalizeRecurringLabel(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function extractTekrarlayanSuffix(
  description: string | null | undefined,
): string | null {
  if (!description?.trim()) return null;
  const m = description.trim().match(/^\[\s*Tekrarlayan\s*\]\s*(.*)$/i);
  if (!m) return null;
  return m[1] ?? "";
}

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
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    const { id } = await context.params;
    const existing = await recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const raw: unknown = await req.json();
    const body =
      typeof raw === "object" && raw !== null
        ? (raw as Record<string, unknown>)
        : {};

    const merged = {
      type: (body.type as string | undefined) ?? existing.type,
      amount: (body.amount as number | undefined) ?? existing.amount,
      category: (body.category as string | undefined) ?? existing.category,
      subcategory:
        body.subcategory !== undefined
          ? (body.subcategory as string | null)
          : existing.subcategory,
      description:
        body.description !== undefined
          ? (body.description as string | null | undefined)
          : existing.description,
      frequency: (body.frequency as string | undefined) ?? existing.frequency,
      interval: (body.interval as number | undefined) ?? existing.interval,
      startDate:
        body.startDate !== undefined
          ? new Date(body.startDate as string)
          : new Date(existing.startDate),
      endDate:
        body.endDate !== undefined
          ? body.endDate === null
            ? null
            : new Date(body.endDate as string)
          : existing.endDate
            ? new Date(existing.endDate)
            : null,
      mode: (body.mode as string | undefined) ?? existing.mode,
      isActive:
        body.isActive !== undefined
          ? (body.isActive as boolean)
          : existing.isActive,
    };

    const parsed = recurringCreateSchema.safeParse({
      type: merged.type,
      amount: merged.amount,
      category: merged.category,
      subcategory: merged.subcategory ?? undefined,
      description: merged.description,
      frequency: merged.frequency,
      interval: merged.interval,
      startDate: merged.startDate,
      endDate: merged.endDate,
      mode: merged.mode,
      isActive: merged.isActive,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const startDate = data.startDate;
    const frequency = data.frequency;
    const interval = data.interval;
    const endDate = data.endDate ?? null;

    if (endDate && startDate > endDate) {
      return NextResponse.json(
        { error: "Bitiş tarihi başlangıçtan önce olamaz" },
        { status: 400 },
      );
    }

    let nextDueDate: Date = new Date(existing.nextDueDate);
    const scheduleChanged =
      !isSameCalendarDate(new Date(startDate), new Date(existing.startDate)) ||
      frequency !== existing.frequency ||
      interval !== existing.interval;
    if (scheduleChanged) {
      nextDueDate = alignNextDueToFuture(
        normalizeDueDate(startDate),
        frequency as RecurringFrequency,
        interval,
        new Date(),
      );
    } else if (data.mode === "AUTO") {
      const lastGenerated = await prisma.transaction.findFirst({
        where: {
          userId: session.user.id,
          recurringRuleId: id,
        },
        orderBy: { date: "desc" },
        select: { date: true },
      });
      const expectedNext = lastGenerated
        ? addRecurringInterval(
            normalizeDueDate(new Date(lastGenerated.date)),
            frequency as RecurringFrequency,
            interval,
          )
        : normalizeDueDate(startDate);
      if (normalizeDueDate(expectedNext) < normalizeDueDate(nextDueDate)) {
        nextDueDate = expectedNext;
      }
    }

    const sub =
      data.type === "expense"
        ? data.subcategory?.trim()
          ? data.subcategory.trim()
          : null
        : null;

    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.recurringRule.update({
        where: { id },
        data: {
          type: data.type,
          amount: data.amount,
          category: data.category,
          subcategory: sub,
          description: data.description?.trim()
            ? data.description.trim()
            : null,
          frequency: data.frequency,
          interval: data.interval,
          startDate: data.startDate,
          endDate: data.endDate ?? null,
          mode: data.mode,
          isActive: data.isActive,
          nextDueDate,
        },
      });
      await tx.transaction.updateMany({
        where: { userId: session.user.id, recurringRuleId: id },
        data: {
          category: data.category,
          subcategory: sub,
        },
      });

      const ruleNoteNorm = normalizeRecurringLabel(existing.description);
      if (ruleNoteNorm) {
        const orphans = await tx.transaction.findMany({
          where: {
            userId: session.user.id,
            recurringRuleId: null,
            description: { contains: "Tekrarlayan" },
          },
          select: { id: true, description: true },
        });
        const orphanIds = orphans
          .filter((row) => {
            const suffix = extractTekrarlayanSuffix(row.description);
            if (suffix === null) return false;
            return normalizeRecurringLabel(suffix) === ruleNoteNorm;
          })
          .map((r) => r.id);
        if (orphanIds.length > 0) {
          await tx.transaction.updateMany({
            where: { id: { in: orphanIds } },
            data: {
              category: data.category,
              subcategory: sub,
              recurringRuleId: id,
            },
          });
        }
      }
      return updated;
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
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    const { id } = await context.params;
    const existing = await recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.transaction.updateMany({
        where: { userId: session.user.id, recurringRuleId: id },
        data: { recurringRuleId: null },
      });
      await tx.recurringRule.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
