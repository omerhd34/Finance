import crypto from "crypto";
import { PREMIUM_PRICE_TRY } from "@/lib/premium-price";

const DEFAULT_SHOPIER_PREMIUM_URL =
  "https://www.shopier.com/iqfinansai/46432141";

export const SHOPIER_SUCCESS_STATUSES = new Set([
  "success",
  "completed",
  "paid",
]);

export function getShopierPremiumUrl(): string {
  const fromEnv = process.env.SHOPIER_PREMIUM_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_SHOPIER_PREMIUM_URL;
}

export function getShopierApiSecret(): string | null {
  const secret = process.env.SHOPIER_API_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

export function getShopierOsbCredentials(): {
  username: string;
  password: string;
} | null {
  const username = process.env.SHOPIER_OSB_USERNAME?.trim();
  const password = process.env.SHOPIER_OSB_PASSWORD?.trim();
  if (!username || !password) return null;
  return { username, password };
}

export function generateShopierOrderCode(userId: string): string {
  const suffix = crypto.randomBytes(5).toString("hex");
  return `SIQ${userId}${suffix}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
}

export function buildShopierCheckoutUrl(orderCode: string): string {
  const rawUrl = getShopierPremiumUrl();
  const url = new URL(rawUrl);
  url.searchParams.set("platform_order_id", orderCode);
  return url.toString();
}

export function verifyShopierSignature(params: {
  apiSecret: string;
  randomNr: string;
  platformOrderId: string;
  signatureBase64: string;
}): boolean {
  const { apiSecret, randomNr, platformOrderId, signatureBase64 } = params;
  const payload = randomNr + platformOrderId;
  const expected = crypto
    .createHmac("sha256", apiSecret)
    .update(payload, "utf8")
    .digest();
  try {
    const incoming = Buffer.from(signatureBase64, "base64");
    return (
      incoming.length === expected.length &&
      crypto.timingSafeEqual(incoming, expected)
    );
  } catch {
    return false;
  }
}

export function parseTryAmount(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function isPaidStatus(statusRaw: string): boolean {
  return SHOPIER_SUCCESS_STATUSES.has(statusRaw.trim().toLowerCase());
}

export function getPremiumPlanAmountTry(): number {
  return PREMIUM_PRICE_TRY;
}
