export async function sendBudgetAlertEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[budget-alert-email] RESEND_API_KEY tanımlı değil; e-posta gönderilmedi.",
      );
    }
    return false;
  }

  const from =
    process.env.RESEND_FROM?.trim() ?? "FinansIQ <onboarding@resend.dev>";

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
      "[budget-alert-email] Resend yanıtı:",
      res.status,
      body.slice(0, 500),
    );
  }

  return res.ok;
}
