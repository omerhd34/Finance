import { differenceInCalendarDays, startOfDay } from "date-fns";
import {
  notification,
  prisma,
  recurringAlertLog,
  recurringRule,
} from "@/lib/db/prisma";
import { formatDateTR, formatMoney } from "@/lib/common/utils";
import { formatExpenseCategoryLabel } from "@/lib/domain/categories";
import { resolveResendFrom } from "@/lib/email/resend-sender";
import { RECURRING_FREQUENCY_LABEL } from "@/lib/recurring/recurring-labels";
import { normalizeDueDate } from "@/lib/recurring/recurring-schedule";
import type { RecurringRule } from "@/types/recurring";

const NOTIFICATION_TYPE = "recurring_reminder_due";
const AUTO_COMPLETED_TYPE = "recurring_auto_completed";

const TR_MORNING_CUTOFF_HOUR = 9;

function getTurkeyHour(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hourPart = parts.find((p) => p.type === "hour");
  const h = hourPart ? parseInt(hourPart.value, 10) : NaN;
  return Number.isFinite(h) ? h : 0;
}

export function isAfterRecurringMorningCutoff(now: Date = new Date()): boolean {
  return getTurkeyHour(now) >= TR_MORNING_CUTOFF_HOUR;
}

type AlertKind = "DUE_SOON_3" | "DUE_SOON_1" | "DUE_TODAY" | "OVERDUE";

const ALERT_KINDS: AlertKind[] = [
  "DUE_SOON_3",
  "DUE_SOON_1",
  "DUE_TODAY",
  "OVERDUE",
];

function matchesKind(kind: AlertKind, daysLeft: number): boolean {
  switch (kind) {
    case "DUE_SOON_3":
      return daysLeft >= 2 && daysLeft <= 3;
    case "DUE_SOON_1":
      return daysLeft === 1;
    case "DUE_TODAY":
      return daysLeft === 0;
    case "OVERDUE":
      return daysLeft < 0;
    default:
      return false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appBaseUrl(): string {
  const u = process.env.NEXTAUTH_URL?.trim() || "https://iqfinansai.com";
  return u.replace(/\/$/, "");
}

function buildReminderSlotKey(opts: {
  mode: string;
  kind: AlertKind;
  dueDateIso: string;
  daysLeft: number;
}): string {
  const prefix = opts.mode === "AUTO" ? "AUTO" : "REMINDER";
  if (opts.kind === "OVERDUE") {
    return `${prefix}:OVERDUE:${opts.dueDateIso}:${opts.daysLeft}`;
  }
  return `${prefix}:${opts.kind}:${opts.dueDateIso}`;
}

async function hasReminderLogged(opts: {
  ruleId: string;
  slotKey: string;
}): Promise<boolean> {
  const row = await recurringAlertLog.findFirst({
    where: { ruleId: opts.ruleId, slotKey: opts.slotKey },
    select: { id: true },
  });
  return Boolean(row);
}

async function tryInsertReminderLog(opts: {
  ruleId: string;
  slotKey: string;
}): Promise<boolean> {
  try {
    await recurringAlertLog.create({
      data: { ruleId: opts.ruleId, slotKey: opts.slotKey },
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearRecurringReminderNotificationsForRule(
  userId: string,
  ruleId: string,
): Promise<void> {
  await prisma.notification.deleteMany({
    where: {
      userId,
      type: { in: [NOTIFICATION_TYPE, AUTO_COMPLETED_TYPE] },
      metadata: { path: "$.ruleId", equals: ruleId },
    },
  });
  await recurringAlertLog.deleteMany({ where: { ruleId } });
}

function buildTitleAndBody(params: {
  rule: RecurringRule;
  currency: string;
  dueDateLabel: string;
  kind: AlertKind;
  daysLeft: number;
}): { title: string; body: string } {
  const { rule, kind, daysLeft } = params;
  const typeLabel = rule.type === "income" ? "gelir" : "gider";
  const isAuto = rule.mode === "AUTO";
  const desc = rule.description?.trim();
  const itemLabel =
    desc ?? formatExpenseCategoryLabel(rule.category, rule.subcategory);

  if (kind === "OVERDUE") {
    const overdueDays = Math.max(1, Math.abs(daysLeft));
    return {
      title: `Tekrarlayan ${typeLabel} vadesi geçti.`,
      body: `${itemLabel} — ${overdueDays} gündür gecikmede.`,
    };
  }
  if (kind === "DUE_TODAY") {
    return {
      title: `Tekrarlayan ${typeLabel} bugün vadede.`,
      body: itemLabel,
    };
  }
  if (kind === "DUE_SOON_1") {
    if (isAuto) {
      return {
        title: `Otomatik tekrarlayan ${typeLabel} yarın oluşturulacak.`,
        body: itemLabel,
      };
    }
    return {
      title: `Tekrarlayan ${typeLabel} vadesine 1 gün kaldı.`,
      body: itemLabel,
    };
  }
  const safeDaysLeft = Math.max(1, daysLeft);
  return {
    title: `Tekrarlayan ${typeLabel} vadesine ${safeDaysLeft} gün kaldı.`,
    body: itemLabel,
  };
}

function emailAccentForKind(kind: AlertKind): {
  accent: string;
  accentSoft: string;
  borderSoft: string;
} {
  if (kind === "OVERDUE") {
    return {
      accent: "#dc2626",
      accentSoft: "#fef2f2",
      borderSoft: "#fecaca",
    };
  }
  if (kind === "DUE_TODAY") {
    return {
      accent: "#d97706",
      accentSoft: "#fffbeb",
      borderSoft: "#fde68a",
    };
  }
  return {
    accent: "#2563eb",
    accentSoft: "#eff6ff",
    borderSoft: "#bfdbfe",
  };
}

function buildEmailHtml(params: {
  title: string;
  body: string;
  dueDateLabel: string;
  amountLabel: string;
  categoryLabel: string;
  frequencyLabel: string;
  description?: string | null;
  kind: AlertKind;
}): string {
  const {
    title,
    body,
    dueDateLabel,
    amountLabel,
    categoryLabel,
    frequencyLabel,
    description,
    kind,
  } = params;
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeDueDate = escapeHtml(dueDateLabel);
  const safeAmount = escapeHtml(amountLabel);
  const safeCategory = escapeHtml(categoryLabel);
  const safeFrequency = escapeHtml(frequencyLabel);
  const trimmedDesc = description?.trim();
  const safeDescription = trimmedDesc ? escapeHtml(trimmedDesc) : null;
  const base = appBaseUrl();
  const url = `${base}/tekrarlayanlar`;
  const { accent, accentSoft, borderSoft } = emailAccentForKind(kind);
  const ctaLabel = "Hatırlatıcıları aç";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">IQfinansAI</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:28px 28px 8px 28px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${accent};">
                      Tekrarlayan hatırlatıcı
                    </p>
                    <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;">
                      ${safeTitle}
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.55;color:#475569;">
                      ${safeBody}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 20px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${accentSoft};border-radius:10px;border:1px solid ${borderSoft};">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">
                            Özet
                          </p>
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Kategori: <strong style="color:#0f172a;">${safeCategory}</strong>
                          </p>${
                            safeDescription
                              ? `
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Açıklama: <strong style="color:#0f172a;">${safeDescription}</strong>
                          </p>`
                              : ""
                          }
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Vade: <strong style="color:#0f172a;">${safeDueDate}</strong>
                          </p>
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Tutar: <strong style="color:#0f172a;">${safeAmount}</strong>
                          </p>
                          <p style="margin:0;font-size:14px;line-height:1.5;color:#334155;">
                            Sıklık: <strong style="color:#0f172a;">${safeFrequency}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px 28px;text-align:center;">
                    <a href="${url}" style="display:inline-block;padding:12px 28px;background:${accent};color:#ffffff !important;-webkit-text-fill-color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;mso-text-color:#ffffff;">
                      <font color="#ffffff" style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;text-decoration:none;"><span style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;text-decoration:none;">${escapeHtml(ctaLabel)}</span></font>
                    </a>
                    <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      Tekrarlayanlar ekranından kaydı oluşturabilir veya bir sonraki vadeye erteleyebilirsiniz.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">
                © ${new Date().getFullYear()} IQfinansAI · Tekrarlayan hatırlatıcı
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendReminderEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[recurring-reminder-email] RESEND_API_KEY tanımlı değil; e-posta gönderilmedi.",
      );
    }
    return false;
  }

  const from = resolveResendFrom();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok && process.env.NODE_ENV === "development") {
    const body = await res.text().catch(() => "");
    console.warn(
      "[recurring-reminder-email] Resend yanıtı:",
      res.status,
      body.slice(0, 500),
    );
  }

  return res.ok;
}

const AUTO_ALERT_KINDS: AlertKind[] = ["DUE_SOON_1"];

const evaluatorInFlight = new Map<string, Promise<void>>();

export function evaluateRecurringReminderAlerts(userId: string): Promise<void> {
  if (!isAfterRecurringMorningCutoff()) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[recurring-reminder-alerts] Türkiye saati 09:00 öncesi; bildirim değerlendirmesi ertelendi.",
      );
    }
    return Promise.resolve();
  }

  const existing = evaluatorInFlight.get(userId);
  if (existing) return existing;

  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const p = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  evaluatorInFlight.set(userId, p);

  void (async () => {
    try {
      await runEvaluateRecurringReminderAlerts(userId);
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      if (evaluatorInFlight.get(userId) === p) {
        evaluatorInFlight.delete(userId);
      }
    }
  })();

  return p;
}

const backfilledUsers = new Set<string>();

async function backfillReminderLogsForUser(userId: string): Promise<void> {
  if (backfilledUsers.has(userId)) return;

  const oldNotifs = await notification.findMany({
    where: {
      userId,
      type: { in: [NOTIFICATION_TYPE, AUTO_COMPLETED_TYPE] },
    },
    select: { type: true, metadata: true },
  });

  if (oldNotifs.length === 0) {
    backfilledUsers.add(userId);
    return;
  }

  const ruleIds = Array.from(
    new Set(
      oldNotifs
        .map((n) => {
          const meta = (n.metadata ?? null) as { ruleId?: string } | null;
          return meta?.ruleId ?? null;
        })
        .filter((v): v is string => Boolean(v)),
    ),
  );

  const rules = ruleIds.length
    ? ((await recurringRule.findMany({
        where: { id: { in: ruleIds } },
      })) as RecurringRule[])
    : [];
  const ruleById = new Map(rules.map((r) => [r.id, r]));

  for (const n of oldNotifs) {
    const meta = (n.metadata ?? null) as {
      ruleId?: string;
      dueDate?: string;
      alertKind?: AlertKind;
      daysLeft?: number;
      slotKey?: string;
    } | null;
    const ruleId = meta?.ruleId;
    if (!ruleId) continue;

    let slotKey: string | null = null;
    if (n.type === AUTO_COMPLETED_TYPE) {
      if (meta?.slotKey) slotKey = `AUTO_COMPLETED:${meta.slotKey}`;
    } else if (n.type === NOTIFICATION_TYPE) {
      const rule = ruleById.get(ruleId);
      if (!rule || !meta?.dueDate || !meta?.alertKind) continue;
      slotKey = buildReminderSlotKey({
        mode: rule.mode,
        kind: meta.alertKind,
        dueDateIso: meta.dueDate,
        daysLeft: meta.daysLeft ?? 0,
      });
    }
    if (!slotKey) continue;

    await tryInsertReminderLog({ ruleId, slotKey });
  }

  backfilledUsers.add(userId);
}

async function runEvaluateRecurringReminderAlerts(
  userId: string,
): Promise<void> {
  await backfillReminderLogsForUser(userId);

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
      where: { userId, isActive: true, mode: { in: ["REMINDER", "AUTO"] } },
    }),
  ]);

  if (!user) return;

  const currency = user.currency ?? "TL";
  const emailEnabled = user.notificationsEnabled !== false;
  const today = startOfDay(new Date());

  for (const rule of rules as RecurringRule[]) {
    const due = normalizeDueDate(new Date(rule.nextDueDate));
    const daysLeft = differenceInCalendarDays(due, today);

    const dueIso = due.toISOString();
    const dueDateLabel = formatDateTR(due);
    const amountLabel = formatMoney(rule.amount, currency);
    const categoryLabel = formatExpenseCategoryLabel(
      rule.category,
      rule.subcategory,
    );
    const frequencyLabel =
      RECURRING_FREQUENCY_LABEL[rule.frequency] ?? rule.frequency;
    const kindsForRule = rule.mode === "AUTO" ? AUTO_ALERT_KINDS : ALERT_KINDS;

    for (const kind of kindsForRule) {
      if (!matchesKind(kind, daysLeft)) continue;

      const slotKey = buildReminderSlotKey({
        mode: rule.mode,
        kind,
        dueDateIso: dueIso,
        daysLeft,
      });

      if (await hasReminderLogged({ ruleId: rule.id, slotKey })) continue;

      const inserted = await tryInsertReminderLog({
        ruleId: rule.id,
        slotKey,
      });
      if (!inserted) continue;

      const { title, body } = buildTitleAndBody({
        rule,
        currency,
        dueDateLabel,
        kind,
        daysLeft,
      });

      await notification.create({
        data: {
          userId,
          type: NOTIFICATION_TYPE,
          title,
          body,
          metadata: {
            ruleId: rule.id,
            dueDate: dueIso,
            alertKind: kind,
            daysLeft,
            slotKey,
            type: rule.type,
            category: rule.category,
            subcategory: rule.subcategory ?? null,
            amount: rule.amount,
          },
        },
      });

      if (emailEnabled && user.email) {
        const html = buildEmailHtml({
          title,
          body,
          dueDateLabel,
          amountLabel,
          categoryLabel,
          frequencyLabel,
          description: rule.description,
          kind,
        });
        await sendReminderEmail({
          to: user.email,
          subject: title,
          html,
        });
      }
    }
  }
}

function buildAutoCompletedEmailHtml(params: {
  title: string;
  body: string;
  dateLabel: string;
  amountLabel: string;
  categoryLabel: string;
  frequencyLabel: string;
  description?: string | null;
}): string {
  const {
    title,
    body,
    dateLabel,
    amountLabel,
    categoryLabel,
    frequencyLabel,
    description,
  } = params;
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeDate = escapeHtml(dateLabel);
  const safeAmount = escapeHtml(amountLabel);
  const safeCategory = escapeHtml(categoryLabel);
  const safeFrequency = escapeHtml(frequencyLabel);
  const trimmedDesc = description?.trim();
  const safeDescription = trimmedDesc ? escapeHtml(trimmedDesc) : null;
  const base = appBaseUrl();
  const url = `${base}/islemler`;
  const accent = "#16a34a";
  const accentSoft = "#f0fdf4";
  const borderSoft = "#bbf7d0";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">IQfinansAI</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:28px 28px 8px 28px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${accent};">
                      Otomatik tekrarlayan işlem
                    </p>
                    <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;">
                      ${safeTitle}
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.55;color:#475569;">
                      ${safeBody}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 20px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${accentSoft};border-radius:10px;border:1px solid ${borderSoft};">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">
                            Özet
                          </p>
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Kategori: <strong style="color:#0f172a;">${safeCategory}</strong>
                          </p>${
                            safeDescription
                              ? `
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Açıklama: <strong style="color:#0f172a;">${safeDescription}</strong>
                          </p>`
                              : ""
                          }
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Tarih: <strong style="color:#0f172a;">${safeDate}</strong>
                          </p>
                          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Tutar: <strong style="color:#0f172a;">${safeAmount}</strong>
                          </p>
                          <p style="margin:0;font-size:14px;line-height:1.5;color:#334155;">
                            Sıklık: <strong style="color:#0f172a;">${safeFrequency}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px 28px;text-align:center;">
                    <a href="${url}" style="display:inline-block;padding:12px 28px;background:${accent};color:#ffffff !important;-webkit-text-fill-color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;mso-text-color:#ffffff;">
                      <font color="#ffffff" style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;text-decoration:none;"><span style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;text-decoration:none;">İşlemleri aç</span></font>
                    </a>
                    <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      Bu işlem, otomatik moddaki tekrarlayan kural tarafından oluşturuldu.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">
                © ${new Date().getFullYear()} IQfinansAI · Otomatik tekrarlayan işlem
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendRecurringAutoCompletedAlert(opts: {
  userId: string;
  userEmail: string | null;
  notificationsEnabled: boolean;
  currency: string;
  rule: RecurringRule;
  occurredOn: Date;
  slotKey: string;
}): Promise<void> {
  const logSlotKey = `AUTO_COMPLETED:${opts.slotKey}`;

  if (await hasReminderLogged({ ruleId: opts.rule.id, slotKey: logSlotKey })) {
    return;
  }

  const inserted = await tryInsertReminderLog({
    ruleId: opts.rule.id,
    slotKey: logSlotKey,
  });
  if (!inserted) return;

  const typeLabel = opts.rule.type === "income" ? "gelir" : "gider";
  const categoryLabel = formatExpenseCategoryLabel(
    opts.rule.category,
    opts.rule.subcategory,
  );
  const amountLabel = formatMoney(opts.rule.amount, opts.currency);
  const dateLabel = formatDateTR(opts.occurredOn);
  const frequencyLabel =
    RECURRING_FREQUENCY_LABEL[opts.rule.frequency] ?? opts.rule.frequency;

  const desc = opts.rule.description?.trim();
  const itemLabel = desc ?? categoryLabel;
  const title = `Otomatik tekrarlayan ${typeLabel} işlemi oluşturuldu.`;
  const body = itemLabel;

  await notification.create({
    data: {
      userId: opts.userId,
      type: AUTO_COMPLETED_TYPE,
      title,
      body,
      metadata: {
        ruleId: opts.rule.id,
        slotKey: opts.slotKey,
        occurredOn: opts.occurredOn.toISOString(),
        type: opts.rule.type,
        category: opts.rule.category,
        subcategory: opts.rule.subcategory ?? null,
        amount: opts.rule.amount,
      },
    },
  });

  if (opts.notificationsEnabled && opts.userEmail) {
    const html = buildAutoCompletedEmailHtml({
      title,
      body,
      dateLabel,
      amountLabel,
      categoryLabel,
      frequencyLabel,
      description: opts.rule.description,
    });
    await sendReminderEmail({
      to: opts.userEmail,
      subject: title,
      html,
    });
  }
}
