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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  dueDateIso: string;
}): Promise<boolean> {
  const row = await notification.findFirst({
    where: {
      userId: opts.userId,
      type: alertTypeForKind(opts.kind),
      AND: [
        { metadata: { path: "$.debtId", equals: opts.debtId } },
        { metadata: { path: "$.alertKind", equals: opts.kind } },
        { metadata: { path: "$.dueDate", equals: opts.dueDateIso } },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function clearDebtDueAlertHistoryForDebt(
  userId: string,
  debtId: string,
): Promise<void> {
  await prisma.notification.deleteMany({
    where: {
      userId,
      type: { in: ["debt_due_soon", "debt_due_today", "debt_overdue"] },
      metadata: { path: "$.debtId", equals: debtId },
    },
  });
}

function buildDebtDueEmailHtml(params: {
  title: string;
  body: string;
  dueDateLabel: string;
  amountLabel: string;
}): string {
  const { title, body, dueDateLabel, amountLabel } = params;
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeDueDate = escapeHtml(dueDateLabel);
  const safeAmount = escapeHtml(amountLabel);
  const loweredTitle = title.toLocaleLowerCase("tr-TR");

  const accent = loweredTitle.includes("geçti")
    ? "#dc2626"
    : loweredTitle.includes("bugün")
      ? "#d97706"
      : "#2563eb";
  const accentSoft = loweredTitle.includes("geçti")
    ? "#fef2f2"
    : loweredTitle.includes("bugün")
      ? "#fffbeb"
      : "#eff6ff";
  const borderSoft = loweredTitle.includes("geçti")
    ? "#fecaca"
    : loweredTitle.includes("bugün")
      ? "#fde68a"
      : "#bfdbfe";

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
                      Borç ve Alacak
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
                          <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#334155;">
                            Vade: <strong style="color:#0f172a;">${safeDueDate}</strong>
                          </p>
                          <p style="margin:0;font-size:14px;line-height:1.5;color:#334155;">
                            Kalan tutar: <strong style="color:#0f172a;">${safeAmount}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px 28px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      Borç ve Alacak ekranından kaydı güncelleyebilirsiniz.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">
                © ${new Date().getFullYear()} IQfinansAI · Vade bildirimi
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
  daysLeft: number;
}): { title: string; body: string } {
  const {
    kind,
    direction,
    counterparty,
    dueDateLabel,
    remainingLabel,
    overdueDays,
    daysLeft,
  } = params;
  const label = debtLabel(direction);

  if (kind === "DUE_SOON_3") {
    const safeDaysLeft = Math.max(1, daysLeft);
    return {
      title: `${label} vadesi ${safeDaysLeft} gün kaldı`,
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
      dueDateIso: due.toISOString(),
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
      daysLeft,
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
