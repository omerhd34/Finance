function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appBaseUrl(): string {
  const u =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";
  return u.replace(/\/$/, "");
}

type AlertKind = "threshold" | "exceeded";

export function buildBudgetAlertEmailHtml(opts: {
  alertType: AlertKind;
  monthLabel: string;
  category: string;
  spentFormatted: string;
  limitFormatted: string;
  thresholdPercent: number;
  progressPercent: number;
}): string {
  const {
    alertType,
    monthLabel,
    category,
    spentFormatted,
    limitFormatted,
    thresholdPercent,
    progressPercent,
  } = opts;

  const cat = escapeHtml(category);
  const month = escapeHtml(monthLabel);
  const base = appBaseUrl();
  const budgetsUrl = `${base}/budgets`;

  const isExceeded = alertType === "exceeded";
  const accent = isExceeded ? "#dc2626" : "#16a34a";
  const accentSoft = isExceeded ? "#fef2f2" : "#f0fdf4";
  const headline = isExceeded ? "Aylık limit aşıldı" : "Bütçe uyarısı";
  const subline = isExceeded
    ? `${month} döneminde <strong>${cat}</strong> kategorisinde limitinizi aştınız.`
    : `${month} döneminde <strong>${cat}</strong> harcaması limitin %${Math.round(thresholdPercent)} seviyesine ulaştı.`;

  const barW = Math.min(100, Math.max(0, progressPercent));

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">FinansIQ</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:28px 28px 8px 28px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${accent};">
                      ${isExceeded ? "Limit aşımı" : "Kategori bütçesi"}
                    </p>
                    <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;">
                      ${headline}
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.55;color:#475569;">
                      ${subline}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 20px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${accentSoft};border-radius:10px;border:1px solid ${isExceeded ? "#fecaca" : "#bbf7d0"};">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 14px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">
                            Bu ay — ${cat}
                          </p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding:0 0 10px 0;">
                                <span style="font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">${escapeHtml(spentFormatted)}</span>
                                <span style="font-size:15px;color:#94a3b8;"> / ${escapeHtml(limitFormatted)}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0;">
                                <div style="height:10px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
                                  <div style="height:10px;width:${barW}%;max-width:100%;background:${accent};border-radius:999px;"></div>
                                </div>
                                <p style="margin:8px 0 0 0;font-size:12px;color:#64748b;">
                                  ${isExceeded ? "Limit üzerinde" : `Limitin yaklaşık %${barW} kadarı kullanıldı.`}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px 28px;text-align:center;">
                    <a href="${budgetsUrl}" style="display:inline-block;padding:12px 28px;background:${accent};color:#ffffff !important;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
                      Bütçeleri aç
                    </a>
                    <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      Bu e-posta, tanımladığınız kategori bütçesi kurallarına göre otomatik gönderildi.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">
                © ${new Date().getFullYear()} FinansIQ · Kategori bütçesi bildirimi<br />
                <a href="${base}" style="color:#71717a;text-decoration:underline;">Uygulamaya git</a>
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
