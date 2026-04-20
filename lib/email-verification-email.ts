function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildVerifyEmailHtml(verifyUrl: string): string {
  const safeUrl = escapeHtml(verifyUrl);
  const accent = "#16a34a";
  const accentSoft = "#f0fdf4";
  const borderSoft = "#bbf7d0";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E-posta doğrulama</title>
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
                      Hesap
                    </p>
                    <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;">
                      E-posta adresinizi doğrulayın
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.55;color:#475569;">
                      IQfinansAI hesabınızda bu adresin size ait olduğunu onaylamak için aşağıdaki düğmeye tıklayın.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 20px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${accentSoft};border-radius:10px;border:1px solid ${borderSoft};">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 10px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">
                            Geçerlilik
                          </p>
                          <p style="margin:0;font-size:14px;line-height:1.5;color:#334155;">
                            Bu bağlantı <strong>24 saat</strong> geçerlidir. Süre dolduğunda profilden yeni doğrulama e-postası isteyebilirsiniz.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 12px 28px;text-align:center;">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 32px;background:${accent};color:#ffffff !important;text-decoration:none;font-size:15px;font-weight:600;border-radius:8px;">
                      E-postamı doğrula
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px 28px;">
                    <p style="margin:0 0 8px 0;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;">
                      Düğme çalışmıyorsa bu adresi tarayıcınıza yapıştırın:
                    </p>
                    <p style="margin:0;font-size:11px;line-height:1.5;color:#64748b;word-break:break-all;text-align:center;">
                      <a href="${safeUrl}" style="color:#16a34a;text-decoration:underline;">${safeUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">
                © ${new Date().getFullYear()} IQfinansAI · E-posta doğrulama
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

function buildVerifyEmailText(verifyUrl: string): string {
  return [
    "IQfinansAI — E-posta doğrulama",
    "",
    "Hesabınızda e-posta adresinizi doğrulamak için aşağıdaki bağlantıyı kullanın.",
    "Bağlantı 24 saat geçerlidir.",
    "",
    verifyUrl,
    "",
    "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.",
  ].join("\n");
}

export async function sendEmailVerificationMessage(params: {
  to: string;
  verifyUrl: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[email-verification] RESEND_API_KEY tanımlı değil; e-posta gönderilmedi.",
      );
    }
    return false;
  }

  const from =
    process.env.RESEND_FROM?.trim() ?? "IQfinansAI <onboarding@resend.dev>";

  const html = buildVerifyEmailHtml(params.verifyUrl);
  const text = buildVerifyEmailText(params.verifyUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "IQfinansAI — E-posta adresinizi doğrulayın",
      html,
      text,
    }),
  });

  if (!res.ok && process.env.NODE_ENV === "development") {
    const body = await res.text().catch(() => "");
    console.warn(
      "[email-verification] Resend yanıtı:",
      res.status,
      body.slice(0, 500),
    );
  }

  return res.ok;
}
