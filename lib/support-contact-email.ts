import { getSiteUrl } from "@/lib/site-url";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getSupportInboxEmail(): string | null {
  const direct = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return direct || null;
}

export type SendSupportContactResult =
  | { ok: true }
  | { ok: false; message: string };

function buildSupportContactEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const base = getSiteUrl();
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safeSubject = escapeHtml(params.subject);
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br/>");
  const safeBase = escapeHtml(base);
  const replyHref = `mailto:${encodeURIComponent(params.email)}?subject=${encodeURIComponent(`Re: ${params.subject}`)}`;
  const safeReplyHref = escapeHtml(replyHref);

  const accent = "#059669";
  const accentDark = "#047857";
  const ink = "#0f172a";
  const slate = "#475569";
  const muted = "#64748b";
  const border = "#e2e8f0";
  const cardBg = "#ffffff";
  const pageBg = "#eceff1";
  const soft = "#f8fafc";
  const softBorder = "#e8eef4";
  const year = new Date().getFullYear();

  const senderSubjectBlock = `
                <tr>
                  <td style="padding:8px 24px 4px 24px;max-width:100%;box-sizing:border-box;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;background:${soft};border:1px solid ${softBorder};border-radius:14px;overflow:hidden;">
                      <tr>
                        <td style="padding:18px 22px 18px 22px;border-bottom:1px solid ${border};box-sizing:border-box;">
                          <p style="margin:0 0 8px 0;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${muted};">
                            Gönderen
                          </p>
                          <p style="margin:0;font-size:18px;font-weight:700;line-height:1.35;color:${ink};letter-spacing:-0.02em;overflow-wrap:break-word;word-break:break-word;">
                            ${safeName}
                          </p>
                          <p style="margin:10px 0 0 0;font-size:13px;line-height:1.5;color:${slate};font-family:ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:break-word;word-break:break-word;">
                            ${safeEmail}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 22px 18px 22px;box-sizing:border-box;">
                          <p style="margin:0 0 8px 0;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${muted};">
                            Konu
                          </p>
                          <p style="margin:0;font-size:17px;font-weight:700;line-height:1.4;color:${ink};letter-spacing:-0.015em;overflow-wrap:break-word;word-break:break-word;">
                            ${safeSubject}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;

  return `<!DOCTYPE html>
<html lang="tr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Destek formu</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${pageBg};color:${ink};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${pageBg};opacity:0;">
    ${safeName} — ${safeSubject}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${pageBg};padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-collapse:collapse;table-layout:fixed;">
          <tr>
            <td style="padding:0 0 24px 0;text-align:center;">
              <span style="font-size:24px;font-weight:800;letter-spacing:-0.04em;color:${ink};">IQfinansAI</span>
              <p style="margin:6px 0 0 0;font-size:13px;color:${muted};letter-spacing:0.02em;">Destek bildirimi</p>
            </td>
          </tr>
          <tr>
            <td style="background:${cardBg};border-radius:16px;overflow:hidden;border:1px solid ${border};box-shadow:0 12px 40px rgba(15,23,42,0.08);max-width:100%;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;">
                <tr>
                  <td style="height:4px;line-height:4px;font-size:4px;background:linear-gradient(90deg,${accent} 0%,${accentDark} 100%);background-color:${accent};">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:26px 24px 18px 24px;box-sizing:border-box;">
                    <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${accentDark};">
                      Destek talebi
                    </p>
                    <h1 style="margin:0 0 14px 0;font-size:24px;line-height:1.25;font-weight:800;color:${ink};letter-spacing:-0.02em;">
                      Yeni iletişim formu mesajı
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.65;color:${slate};">
                      Ziyaretçi destek formunu doldurdu. Yanıt vermek için posta istemcinizde <strong style="color:${ink};">Yanıtla</strong> seçeneğini kullanın veya yeşil düğmeye tıklayın.
                    </p>
                  </td>
                </tr>
                ${senderSubjectBlock}
                <tr>
                  <td style="padding:12px 24px 22px 24px;box-sizing:border-box;">
                    <p style="margin:0 0 10px 0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${muted};">
                      Mesaj
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;table-layout:fixed;border-collapse:collapse;border:1px solid ${border};border-left:4px solid ${accent};border-radius:0 12px 12px 0;background:${cardBg};">
                      <tr>
                        <td style="padding:18px 20px 20px 18px;font-size:15px;line-height:1.75;color:#334155;overflow-wrap:break-word;word-break:break-word;box-sizing:border-box;">
                          ${safeMessage}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 26px 24px;box-sizing:border-box;" align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;">
                      <tr>
                        <td align="center" bgcolor="${accent}" style="border-radius:9999px;background-color:${accent};mso-padding-alt:0;">
                          <a href="${safeReplyHref}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;color:#ffffff !important;text-decoration:none;border-radius:9999px;background-color:${accent};mso-line-height-rule:exactly;">
                            <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
                            <span style="color:#ffffff !important;text-decoration:none;">Yanıtla</span>
                            <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;">&nbsp;</i><![endif]-->
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px 24px 24px;border-top:1px solid ${border};background-color:#fafbfc;box-sizing:border-box;">
                    <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:${slate};">
                      <a href="${safeBase}/destek" style="color:${accentDark};font-weight:700;text-decoration:none;">Destek merkezi</a>
                      <span style="color:#cbd5e1;font-weight:400;"> · </span>
                      <a href="${safeBase}/" style="color:${accentDark};font-weight:700;text-decoration:none;">Web sitesi</a>
                    </p>
                    <p style="margin:0;font-size:12px;line-height:1.55;color:#94a3b8;">
                      Bu e-posta yalnızca bilgilendirme amaçlıdır; finansal veya hukuki tavsiye içermez.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 16px 0 16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.65;">
                © ${year} IQfinansAI · Destek bildirimi
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

function buildSupportContactEmailText(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const base = getSiteUrl();
  const line = "─".repeat(44);
  return [
    "IQfinansAI — Yeni destek formu mesajı",
    line,
    "",
    `Gönderen : ${params.name}`,
    `E-posta   : ${params.email}`,
    `Konu      : ${params.subject}`,
    "",
    "Mesaj:",
    params.message,
    "",
    line,
    `Destek: ${base}/destek`,
    `Site   : ${base}/`,
    "",
    "Yanıtlamak için bu e-postaya “Yanıtla” ile dönüş yapabilirsiniz.",
    "",
    `© ${new Date().getFullYear()} IQfinansAI`,
  ].join("\n");
}

export async function sendSupportContactEmail(params: {
  to: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SendSupportContactResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[support-contact-email] RESEND_API_KEY tanımlı değil; e-posta gönderilmedi.",
      );
    }
    return { ok: false, message: "Sunucuda RESEND_API_KEY tanımlı değil." };
  }

  const from =
    process.env.RESEND_FROM?.trim() ?? "IQfinansAI <onboarding@resend.dev>";

  const html = buildSupportContactEmailHtml(params);
  const text = buildSupportContactEmailText(params);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      reply_to: params.email,
      subject: `[IQfinansAI Destek] ${params.subject}`,
      html,
      text,
    }),
  });

  if (res.ok) {
    return { ok: true };
  }

  const raw = await res.text().catch(() => "");
  let message = `Resend yanıt kodu: ${res.status}`;
  try {
    const j = JSON.parse(raw) as { message?: string };
    if (typeof j.message === "string" && j.message.trim()) {
      message = j.message.trim();
    }
  } catch {
    if (raw.trim()) {
      message = raw.trim().slice(0, 400);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[support-contact-email] Resend hata:",
      res.status,
      raw.slice(0, 600),
    );
  }

  return { ok: false, message };
}
