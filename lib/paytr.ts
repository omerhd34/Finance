import crypto from "crypto";
import { PREMIUM_PRICE_TRY } from "@/lib/premium-price";

export type PaytrEnv = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: "0" | "1";
  debugOn: "0" | "1";
};

export function getPaytrEnv(): PaytrEnv | null {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim() ?? "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim() ?? "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim() ?? "";
  if (!merchantId || !merchantKey || !merchantSalt) return null;
  const testRaw = process.env.PAYTR_TEST_MODE?.trim();
  const testMode = testRaw === "1" ? "1" : "0";
  const debugRaw = process.env.PAYTR_DEBUG_ON?.trim();
  const debugOn =
    debugRaw === "1" || process.env.NODE_ENV === "development" ? "1" : "0";
  return { merchantId, merchantKey, merchantSalt, testMode, debugOn };
}

export function buildPremiumUserBasketBase64(): string {
  const basket: [string, string, number][] = [
    ["IQfinansAI Premium", PREMIUM_PRICE_TRY.toFixed(2), 1],
  ];
  return Buffer.from(JSON.stringify(basket), "utf8").toString("base64");
}

export function buildIframePaytrToken(params: {
  env: PaytrEnv;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentAmountKurus: number;
  userBasketBase64: string;
}): string {
  const {
    env,
    userIp,
    merchantOid,
    email,
    paymentAmountKurus,
    userBasketBase64,
  } = params;
  const noInstallment = "1";
  const maxInstallment = "0";
  const currency = "TL";
  const paymentAmountStr = String(paymentAmountKurus);
  const hashStr =
    env.merchantId +
    userIp +
    merchantOid +
    email +
    paymentAmountStr +
    userBasketBase64 +
    noInstallment +
    maxInstallment +
    currency +
    env.testMode;
  return crypto
    .createHmac("sha256", env.merchantKey)
    .update(hashStr + env.merchantSalt)
    .digest("base64");
}

export function verifyPaytrNotificationHash(params: {
  env: PaytrEnv;
  merchantOid: string;
  status: string;
  totalAmount: string;
  incomingHash: string;
}): boolean {
  const { env, merchantOid, status, totalAmount, incomingHash } = params;
  const hashStr = merchantOid + env.merchantSalt + status + totalAmount;
  const computed = crypto
    .createHmac("sha256", env.merchantKey)
    .update(hashStr, "utf8")
    .digest("base64");
  try {
    const a = Buffer.from(computed, "utf8");
    const b = Buffer.from(incomingHash, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function generatePaytrMerchantOid(userId: string): string {
  const suffix = crypto.randomBytes(5).toString("hex");
  const base = `IQ${userId}${suffix}`;
  return base.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
}
