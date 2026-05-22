const DEFAULT_DISPLAY_NAME = "IQfinansAI";
const DEFAULT_FALLBACK = `${DEFAULT_DISPLAY_NAME} <onboarding@resend.dev>`;

export function resolveResendFrom(): string {
  const raw = process.env.RESEND_FROM?.trim();
  if (!raw) return DEFAULT_FALLBACK;
  if (/<[^>]+>/.test(raw)) return raw;
  return `${DEFAULT_DISPLAY_NAME} <${raw}>`;
}
