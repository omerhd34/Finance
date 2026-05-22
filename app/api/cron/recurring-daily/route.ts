import { NextResponse } from "next/server";
import { recurringRule } from "@/lib/db/prisma";
import {
  evaluateRecurringReminderAlerts,
  isAfterRecurringMorningCutoff,
} from "@/lib/recurring/recurring-reminder-alerts";
import { processAutoRecurringForUser } from "@/lib/recurring/recurring-service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!isAfterRecurringMorningCutoff()) {
    return NextResponse.json({
      ok: true,
      skipped: "before-tr-morning-cutoff",
      processedAt: new Date().toISOString(),
    });
  }

  const started = Date.now();

  const rules = await recurringRule.findMany({
    where: { isActive: true, mode: { in: ["REMINDER", "AUTO"] } },
  });
  const userIds = Array.from(new Set(rules.map((r) => r.userId)));

  let autoCreated = 0;
  let userErrors = 0;
  const errors: {
    userId: string;
    step: "auto" | "reminder";
    message: string;
  }[] = [];

  const BATCH = 5;
  for (let i = 0; i < userIds.length; i += BATCH) {
    const slice = userIds.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (userId) => {
        try {
          const { created } = await processAutoRecurringForUser(userId);
          autoCreated += created;
        } catch (e) {
          userErrors++;
          errors.push({
            userId,
            step: "auto",
            message: e instanceof Error ? e.message : String(e),
          });
        }
        try {
          await evaluateRecurringReminderAlerts(userId);
        } catch (e) {
          userErrors++;
          errors.push({
            userId,
            step: "reminder",
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }),
    );
  }

  return NextResponse.json({
    ok: true,
    processedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    userCount: userIds.length,
    autoTransactionsCreated: autoCreated,
    userErrors,
    errors: errors.slice(0, 20),
  });
}
