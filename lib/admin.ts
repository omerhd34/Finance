import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "iq_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

function normalize(input: string | null | undefined): string {
  return typeof input === "string" ? input.trim().toLowerCase() : "";
}

function secretForSigning(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  return secret || "iqfinansai-admin-dev-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", secretForSigning()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function getConfiguredAdmin() {
  const legacyAdminEmail =
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ?? "";
  const configuredEmail = process.env.ADMIN_EMAIL?.trim() || legacyAdminEmail;
  return {
    email: normalize(configuredEmail),
    password: process.env.ADMIN_PASSWORD ?? "",
  };
}

export function verifyAdminCredentials(
  email: string,
  password: string,
): boolean {
  const configured = getConfiguredAdmin();
  if (!configured.email || !configured.password) return false;
  const normalizedEmail = normalize(email);
  if (!normalizedEmail) return false;
  if (normalizedEmail !== configured.email) return false;
  return safeEqual(password, configured.password);
}

export function createAdminSessionToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = `${normalize(email)}|${exp}`;
  const signature = sign(payload);
  return `${payload}|${signature}`;
}

export function getAdminEmailFromSessionToken(
  token: string | null | undefined,
): string | null {
  if (!token) return null;
  const [email, expRaw, signature] = token.split("|");
  if (!email || !expRaw || !signature) return null;
  const payload = `${email}|${expRaw}`;
  const expected = sign(payload);
  if (!safeEqual(signature, expected)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000))
    return null;
  return email;
}
