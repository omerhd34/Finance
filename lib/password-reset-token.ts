import { createHash, randomBytes } from "crypto";

export function generatePasswordResetSecret(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function appBaseUrl(): string {
  const raw = process.env.NEXTAUTH_URL?.trim() || "https://iqfinansai.com";
  return raw.replace(/\/$/, "");
}
