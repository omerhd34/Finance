import { differenceInCalendarDays, startOfDay } from "date-fns";
import { notification, prisma } from "@/lib/prisma";
import { debtRemaining } from "@/lib/debt-remaining";
import { formatDateTR, formatMoney } from "@/lib/utils";

type DebtDirection = "RECEIVABLE" | "PAYABLE";

type DebtRow = {
  id: string;
  direction: DebtDirection;
  counterparty: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date | string | null;
};

type AlertKind = "DUE_SOON_3" | "DUE_TODAY" | "OVERDUE";

function debtLabel(direction: DebtDirection): string {
  return direction === "RECEIVABLE" ? "Alacak" : "Borç";
}

function alertTypeForKind(kind: AlertKind): string {
  if (kind === "DUE_SOON_3") return "debt_due_soon";
  if (kind === "DUE_TODAY") return "debt_due_today";
  return "debt_overdue";
}

async function hasDebtDueNotification(opts: {
  userId: string;
  debtId: string;
  kind: AlertKind;
}): Promise<boolean> {
  const row = await notification.findFirst({
    where: {
      userId: opts.userId,
      type: alertTypeForKind(opts.kind),
      AND: [
        { metadata: { path: "$.debtId", equals: opts.debtId } },
        { metadata: { path: "$.alertKind", equals: opts.kind } },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
}

function buildDebtDueEmailHtml(params: {
  title: string;
  body: string;
  dueDateLabel: string;
  amountLabel: string;
}): string {
  const { title, body, dueDateLabel, amountLabel } = params;
  return `
  <div style="background:#0b0f14;padding:24px;font-family:Inter,Arial,sans-serif;color:#e5e7eb;">
    <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;">
      <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;">IQfinansAI bildirim</p>
      <h2 style="margin:0 0 10px 0;font-size:20px;color:#f9fafb;">${title}</h2>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#d1d5db;">${body}</p>
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px 14px;">
        <p style="margin:0 0 6px 0;font-size:13px;color:#cbd5e1;">Vade: <strong style="color:#f8fafc;">${dueDateLabel}</strong></p>
        <p style="margin:0;font-size:13px;color:#cbd5e1;">Kalan tutar: <strong style="color:#f8fafc;">${amountLabel}</strong></p>
      </div>
      <p style="margin:14px 0 0 0;font-size:12px;color:#94a3b8;">Borç ve Alacak ekranından kaydı güncelleyebilirsiniz.</p>
    </div>
  </div>
  `;
}

async function sendDebtAlertEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[debt-due-alert-email] RESEND_API_KEY tanımlı değil; e-posta gönderilmedi.",
      );
    }
    return false;
  }

  const from =
    process.env.RESEND_FROM?.trim() ?? "IQfinansAI <onboarding@resend.dev>";

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
      "[debt-due-alert-email] Resend yanıtı:",
      res.status,
      body.slice(0, 500),
    );
  }

  return res.ok;
}

function buildTitleAndBody(params: {
  kind: AlertKind;
  direction: DebtDirection;
  counterparty: string;
  dueDateLabel: string;
  remainingLabel: string;
  overdueDays: number;
}): { title: string; body: string } {
  const {
    kind,
    direction,
    counterparty,
    dueDateLabel,
    remainingLabel,
    overdueDays,
  } = params;
  const label = debtLabel(direction);

  if (kind === "DUE_SOON_3") {
    return {
      title: `${label} vadesi 3 gün kaldı`,
      body: `${counterparty} kaydı için vade ${dueDateLabel}. Kalan tutar ${remainingLabel}.`,
    };
  }
  if (kind === "DUE_TODAY") {
    return {
      title: `${label} bugün vadede`,
      body: `${counterparty} kaydı bugün vadede (${dueDateLabel}). Kalan tutar ${remainingLabel}.`,
    };
  }
  return {
    title: `${label} vadesi geçti`,
    body: `${counterparty} kaydı ${overdueDays} gündür gecikmede. Vade ${dueDateLabel}, kalan tutar ${remainingLabel}.`,
  };
}

export async function evaluateDebtDueAlerts(userId: string): Promise<void> {
  const [user, debts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        currency: true,
        notificationsEnabled: true,
      } as { email: true; currency: true; notificationsEnabled: true },
    }),
    prisma.debt.findMany({
      where: { userId, dueDate: { not: null } },
      select: {
        id: true,
        direction: true,
        counterparty: true,
        totalAmount: true,
        paidAmount: true,
        dueDate: true,
      },
    }),
  ]);

  if (!user) return;

  const now = startOfDay(new Date());
  const currency = user.currency ?? "TL";
  const emailEnabled = user.notificationsEnabled !== false;

  for (const d of debts as DebtRow[]) {
    if (!d.dueDate) continue;
    if (debtRemaining(d) <= 0) continue;

    const due = startOfDay(new Date(d.dueDate));
    const daysLeft = differenceInCalendarDays(due, now);

    let kind: AlertKind | null = null;
    if (daysLeft > 0 && daysLeft <= 3) kind = "DUE_SOON_3";
    else if (daysLeft === 0) kind = "DUE_TODAY";
    else if (daysLeft < 0) kind = "OVERDUE";
    if (!kind) continue;

    const alreadySent = await hasDebtDueNotification({
      userId,
      debtId: d.id,
      kind,
    });
    if (alreadySent) continue;

    const remainingLabel = formatMoney(debtRemaining(d), currency);
    const dueDateLabel = formatDateTR(due);
    const { title, body } = buildTitleAndBody({
      kind,
      direction: d.direction,
      counterparty: d.counterparty,
      dueDateLabel,
      remainingLabel,
      overdueDays: Math.max(1, Math.abs(daysLeft)),
    });

    await notification.create({
      data: {
        userId,
        type: alertTypeForKind(kind),
        title,
        body,
        metadata: {
          debtId: d.id,
          direction: d.direction,
          alertKind: kind,
          dueDate: due.toISOString(),
          daysLeft,
        },
      },
    });

    if (emailEnabled && user.email) {
      const html = buildDebtDueEmailHtml({
        title,
        body,
        dueDateLabel,
        amountLabel: remainingLabel,
      });
      await sendDebtAlertEmail({
        to: user.email,
        subject: title,
        html,
      });
    }
  }
}
