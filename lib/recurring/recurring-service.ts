import { format } from "date-fns";
import { Prisma } from "@prisma/client";
import { evaluateCategoryBudgetsForTransactionContext } from "@/lib/budget/budget-alerts";
import { prisma, recurringRule } from "@/lib/db/prisma";
import {
  isAfterRecurringMorningCutoff,
  sendRecurringAutoCompletedAlert,
} from "@/lib/recurring/recurring-reminder-alerts";
import {
  addRecurringInterval,
  endOfToday,
  isDueOrOverdue,
  isWithinRuleEnd,
  normalizeDueDate,
  type RecurringFrequency,
} from "@/lib/recurring/recurring-schedule";
import type { RecurringRule as RecurringRuleType } from "@/types/recurring";

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
  options: { sendAlerts?: boolean } = {},
): Promise<{ created: number }> {
  const sendAlerts = options.sendAlerts !== false;
  const cacheKey = `${userId}|${sendAlerts ? "1" : "0"}`;
  const existing = processDueInFlight.get(cacheKey);
  if (existing) return existing;

  let resolve!: (v: { created: number }) => void;
  let reject!: (e: unknown) => void;
  const p = new Promise<{ created: number }>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  processDueInFlight.set(cacheKey, p);

  void (async () => {
    try {
      resolve(await runProcessAutoRecurringForUser(userId, sendAlerts));
    } catch (e) {
      reject(e);
    } finally {
      if (processDueInFlight.get(cacheKey) === p) {
        processDueInFlight.delete(cacheKey);
      }
    }
  })();

  return p;
}

async function runProcessAutoRecurringForUser(
  userId: string,
  sendAlerts: boolean,
): Promise<{ created: number }> {
  if (!isAfterRecurringMorningCutoff()) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[recurring-service] Türkiye saati 09:00 öncesi; AUTO işleme ertelendi.",
      );
    }
    return { created: 0 };
  }

  const [user, rules] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        currency: true,
        notificationsEnabled: true,
      } as { email: true; currency: true; notificationsEnabled: true },
    }),
    recurringRule.findMany({
      where: { userId, isActive: true, mode: "AUTO" },
    }),
  ]);
  const userEmail = user?.email ?? null;
  const userCurrency = user?.currency ?? "TL";
  const notificationsEnabled = user?.notificationsEnabled !== false;
  const nowEnd = endOfToday();
  let created = 0;

  for (const rule of rules) {
    const fallbackCursor = normalizeDueDate(new Date(rule.nextDueDate));
    const lastGenerated = await prisma.transaction.findFirst({
      where: {
        userId,
        recurringRuleId: rule.id,
      },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    const expectedCursor = lastGenerated
      ? addRecurringInterval(
          normalizeDueDate(new Date(lastGenerated.date)),
          rule.frequency as RecurringFrequency,
          rule.interval,
        )
      : normalizeDueDate(new Date(rule.startDate));
    let cursor =
      normalizeDueDate(expectedCursor) < normalizeDueDate(fallbackCursor)
        ? expectedCursor
        : fallbackCursor;
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
            subcategory:
              rule.type === "expense"
                ? rule.subcategory?.trim()
                  ? rule.subcategory.trim()
                  : null
                : null,
            description: txDescription(rule.description, true),
            date: cursor,
            userId,
            recurringRuleId: rule.id,
            recurringSlotKey: slotKey,
          } as Prisma.TransactionUncheckedCreateInput,
        });
        if (rule.type === "expense") {
          await evaluateCategoryBudgetsForTransactionContext({
            userId,
            type: "expense",
            category: rule.category,
            date: cursor,
          });
        }
        if (sendAlerts) {
          try {
            await sendRecurringAutoCompletedAlert({
              userId,
              userEmail,
              notificationsEnabled,
              currency: userCurrency,
              rule: rule as unknown as RecurringRuleType,
              occurredOn: cursor,
              slotKey,
            });
          } catch {}
        }
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
        subcategory:
          rule.type === "expense"
            ? rule.subcategory?.trim()
              ? rule.subcategory.trim()
              : null
            : null,
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

  if (rule.type === "expense") {
    await evaluateCategoryBudgetsForTransactionContext({
      userId,
      type: "expense",
      category: rule.category,
      date: due,
    });
  }

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
