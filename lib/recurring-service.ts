import { format } from "date-fns";
import { Prisma } from "@prisma/client";
import { prisma, recurringRule } from "@/lib/prisma";
import {
  addRecurringInterval,
  endOfToday,
  isDueOrOverdue,
  isWithinRuleEnd,
  normalizeDueDate,
  type RecurringFrequency,
} from "@/lib/recurring-schedule";

export function recurringSlotKeyFor(ruleId: string, on: Date): string {
  return `${ruleId}|${format(on, "yyyy-MM-dd")}`;
}

const MAX_AUTO_PER_RULE = 120;

const processDueInFlight = new Map<string, Promise<{ created: number }>>();

function isUniqueConstraintError(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

function txDescription(
  base: string | null | undefined,
  recurring: boolean,
): string | null {
  const tag = recurring ? "[Tekrarlayan]" : "";
  const trimmed = base?.trim();
  if (trimmed) return `${tag} ${trimmed}`.trim();
  return tag || null;
}

export function processAutoRecurringForUser(
  userId: string,
): Promise<{ created: number }> {
  const existing = processDueInFlight.get(userId);
  if (existing) return existing;

  let resolve!: (v: { created: number }) => void;
  let reject!: (e: unknown) => void;
  const p = new Promise<{ created: number }>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  processDueInFlight.set(userId, p);

  void (async () => {
    try {
      resolve(await runProcessAutoRecurringForUser(userId));
    } catch (e) {
      reject(e);
    } finally {
      if (processDueInFlight.get(userId) === p) {
        processDueInFlight.delete(userId);
      }
    }
  })();

  return p;
}

async function runProcessAutoRecurringForUser(
  userId: string,
): Promise<{ created: number }> {
  const rules = await recurringRule.findMany({
    where: { userId, isActive: true, mode: "AUTO" },
  });
  const nowEnd = endOfToday();
  let created = 0;

  for (const rule of rules) {
    let cursor = normalizeDueDate(new Date(rule.nextDueDate));
    let safety = 0;
    let any = false;

    while (
      safety < MAX_AUTO_PER_RULE &&
      isDueOrOverdue(cursor, nowEnd) &&
      isWithinRuleEnd(cursor, rule.endDate ? new Date(rule.endDate) : null)
    ) {
      const slotKey = recurringSlotKeyFor(rule.id, cursor);
      try {
        await prisma.transaction.create({
          data: {
            type: rule.type,
            amount: rule.amount,
            category: rule.category,
            description: txDescription(rule.description, true),
            date: cursor,
            userId,
            recurringRuleId: rule.id,
            recurringSlotKey: slotKey,
          } as Prisma.TransactionUncheckedCreateInput,
        });
        created++;
      } catch (e) {
        if (!isUniqueConstraintError(e)) throw e;
        /* recurringSlotKey veya yarış: bu yuva zaten dolu. */
      }
      any = true;
      cursor = addRecurringInterval(
        cursor,
        rule.frequency as RecurringFrequency,
        rule.interval,
      );
      safety++;
    }

    if (any) {
      const pastEnd =
        rule.endDate != null &&
        !isWithinRuleEnd(cursor, new Date(rule.endDate));
      await recurringRule.update({
        where: { id: rule.id },
        data: {
          nextDueDate: cursor,
          ...(pastEnd ? { isActive: false } : {}),
        },
      });
    }
  }

  return { created };
}

export async function fulfillRecurringReminder(
  userId: string,
  ruleId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rule = await recurringRule.findFirst({
    where: { id: ruleId, userId, isActive: true, mode: "REMINDER" },
  });
  if (!rule) {
    return { ok: false, error: "Kayıt bulunamadı" };
  }
  const nowEnd = endOfToday();
  const due = normalizeDueDate(new Date(rule.nextDueDate));
  if (!isDueOrOverdue(due, nowEnd)) {
    return { ok: false, error: "Henüz vade gelmedi" };
  }
  if (!isWithinRuleEnd(due, rule.endDate ? new Date(rule.endDate) : null)) {
    return { ok: false, error: "İşlem bitiş tarihi geçti" };
  }

  const next = addRecurringInterval(
    due,
    rule.frequency as RecurringFrequency,
    rule.interval,
  );

  const pastEnd =
    rule.endDate != null && !isWithinRuleEnd(next, new Date(rule.endDate));

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        description: txDescription(rule.description, true),
        date: due,
        userId,
        recurringRuleId: rule.id,
        recurringSlotKey: recurringSlotKeyFor(rule.id, due),
      } as Prisma.TransactionUncheckedCreateInput,
    });
    await (
      tx as unknown as { recurringRule: typeof recurringRule }
    ).recurringRule.update({
      where: { id: rule.id },
      data: {
        nextDueDate: next,
        ...(pastEnd ? { isActive: false } : {}),
      },
    });
  });

  return { ok: true };
}

export async function skipRecurringReminder(
  userId: string,
  ruleId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rule = await recurringRule.findFirst({
    where: { id: ruleId, userId, isActive: true, mode: "REMINDER" },
  });
  if (!rule) {
    return { ok: false, error: "Kayıt bulunamadı" };
  }
  const nowEnd = endOfToday();
  const due = normalizeDueDate(new Date(rule.nextDueDate));
  if (!isDueOrOverdue(due, nowEnd)) {
    return { ok: false, error: "Atlanacak vade yok" };
  }

  const next = addRecurringInterval(
    due,
    rule.frequency as RecurringFrequency,
    rule.interval,
  );

  const pastEnd =
    rule.endDate != null && !isWithinRuleEnd(next, new Date(rule.endDate));

  await recurringRule.update({
    where: { id: rule.id },
    data: {
      nextDueDate: next,
      ...(pastEnd ? { isActive: false } : {}),
    },
  });

  return { ok: true };
}
