import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isPaidStatus,
  parseTryAmount,
  verifyShopierSignature,
  getShopierApiSecret,
  getShopierOsbCredentials,
} from "@/lib/shopier";
import { addPremiumPeriod } from "@/lib/premium-subscription-constants";

export const dynamic = "force-dynamic";

type ShopierPayload = {
  platformOrderId: string;
  statusRaw: string;
  paymentId: string;
  randomNr: string;
  totalOrderValue: string;
  currency: string;
  signature: string;
};

function parseFromSearchParams(url: URL): ShopierPayload {
  return {
    platformOrderId: url.searchParams.get("platform_order_id") ?? "",
    statusRaw: url.searchParams.get("status") ?? "",
    paymentId: (url.searchParams.get("payment_id") ?? "").trim(),
    randomNr: url.searchParams.get("random_nr") ?? "",
    totalOrderValue: url.searchParams.get("total_order_value") ?? "",
    currency: url.searchParams.get("currency") ?? "",
    signature: url.searchParams.get("signature") ?? "",
  };
}

function payloadFromFlat(flat: Record<string, string>): ShopierPayload {
  return {
    platformOrderId: flat.platform_order_id ?? "",
    statusRaw: flat.status ?? "",
    paymentId: (flat.payment_id ?? "").trim(),
    randomNr: flat.random_nr ?? "",
    totalOrderValue: flat.total_order_value ?? "",
    currency: flat.currency ?? "",
    signature: flat.signature ?? "",
  };
}

async function readFlatPostFields(
  req: Request,
): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const out: Record<string, string> = {};
    for (const [k, v] of form.entries()) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }
  const raw = await req.text();
  if (!raw.trim()) return {};
  if (ct.includes("application/json")) {
    try {
      const j = JSON.parse(raw) as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(j)) {
        if (typeof v === "string" || typeof v === "number") {
          out[k] = String(v);
        }
      }
      return out;
    } catch {
      return {};
    }
  }
  const params = new URLSearchParams(raw);
  const out: Record<string, string> = {};
  for (const [k, v] of params) {
    out[k] = v;
  }
  return out;
}

type OsbDecoded = {
  email?: string;
  orderid?: string | number;
  currency?: string;
  price?: string | number;
  [key: string]: unknown;
};

/**
 * Shopier “Otomatik Sipariş Bildirimi” (OSB): base64(JSON) + HMAC-hex(şifre, payload+username).
 * Sipariş numarası Shopier iç `orderid`; bizim `platform_order_id` ile eşleşmez → e-posta + son PENDING sipariş.
 */
async function tryProcessOsb(
  flat: Record<string, string>,
): Promise<Response | null> {
  const osb = getShopierOsbCredentials();
  if (!osb) return null;

  const b0 =
    flat["0"] ?? flat["res"] ?? flat["RES"] ?? flat["data"] ?? flat["payload"];
  const b1 = flat["1"] ?? flat["hash"] ?? flat["HASH"] ?? flat["sign"];
  if (!b0?.trim() || !b1?.trim()) return null;

  const expectedHex = crypto
    .createHmac("sha256", osb.password)
    .update(b0 + osb.username)
    .digest("hex");
  const gotHex = b1.trim().toLowerCase();
  if (
    expectedHex.length !== gotHex.length ||
    !/^[0-9a-f]+$/i.test(gotHex) ||
    !/^[0-9a-f]+$/i.test(expectedHex)
  ) {
    return null;
  }
  try {
    const a = Buffer.from(expectedHex, "hex");
    const b = Buffer.from(gotHex, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let decoded: OsbDecoded;
  try {
    decoded = JSON.parse(
      Buffer.from(b0, "base64").toString("utf8"),
    ) as OsbDecoded;
  } catch {
    return null;
  }

  const emailRaw =
    typeof decoded.email === "string" ? decoded.email.trim() : "";
  if (!emailRaw) {
    console.warn("[shopier] OSB: e-posta yok");
    return new Response("success", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const email = emailRaw.toLowerCase();

  const shopierOrderId =
    decoded.orderid != null ? String(decoded.orderid).trim() : "";
  const priceTry = parseTryAmount(String(decoded.price ?? ""));

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    console.warn("[shopier] OSB: kullanıcı bulunamadı email=%s", email);
    return new Response("success", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const pending = await prisma.shopierOrder.findMany({
    where: { userId: user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      orderCode: true,
      amountTry: true,
      status: true,
    },
  });
  const order =
    pending.find(
      (o) =>
        priceTry == null ||
        o.amountTry == null ||
        Math.abs(o.amountTry - priceTry) <= 0.02,
    ) ?? null;
  if (!order) {
    console.warn(
      "[shopier] OSB: tutarla eşleşen bekleyen sipariş yok (userId=%s, osbFiyat=%s, bekleyen=%s)",
      user.id,
      priceTry,
      pending.map((p) => p.amountTry).join(","),
    );
    return new Response("success", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (order.status === "PAID") {
    return new Response("success", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const paidAt = new Date();
  const rawPayload = {
    osb: true,
    shopierOrderId: shopierOrderId || undefined,
    decoded: structuredClone(decoded) as Prisma.InputJsonValue,
    flatKeys: Object.keys(flat),
  } as Prisma.InputJsonValue;

  await prisma.$transaction(async (tx) => {
    await tx.shopierOrder.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt,
        planGrantedAt: paidAt,
        shopierPaymentId: shopierOrderId || undefined,
        amountTry: priceTry ?? undefined,
        currency:
          typeof decoded.currency === "string" ? decoded.currency : undefined,
        rawPayload,
      },
    });
    await tx.user.update({
      where: { id: user.id },
      data: {
        planTier: "premium",
        premiumUntil: addPremiumPeriod(paidAt),
      },
    });
  });

  return new Response("success", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function handleNotification(req: Request) {
  let payload: ShopierPayload;

  if (req.method === "POST") {
    const flat = await readFlatPostFields(req);
    const osbResponse = await tryProcessOsb(flat);
    if (osbResponse) return osbResponse;
    payload = payloadFromFlat(flat);
  } else {
    payload = parseFromSearchParams(new URL(req.url));
  }

  const secret = getShopierApiSecret();
  if (!secret) {
    return new Response("NO_CONFIG", { status: 500 });
  }

  const {
    platformOrderId,
    statusRaw,
    paymentId,
    randomNr,
    totalOrderValue,
    currency,
    signature,
  } = payload;

  if (
    !platformOrderId.trim() ||
    !statusRaw.trim() ||
    !randomNr.trim() ||
    !totalOrderValue.trim() ||
    !currency.trim() ||
    !signature.trim()
  ) {
    return new Response("MISSING", { status: 400 });
  }

  const valid = verifyShopierSignature({
    apiSecret: secret,
    randomNr,
    platformOrderId,
    totalOrderValue,
    currency,
    signatureBase64: signature.trim(),
  });
  if (!valid) {
    console.warn(
      "[shopier] notification imza doğrulaması başarısız (platform_order_id uzunluk=%s)",
      platformOrderId.length,
    );
    return new Response("HASH_FAIL", { status: 400 });
  }

  const order = await prisma.shopierOrder.findUnique({
    where: { orderCode: platformOrderId.trim() },
    select: { id: true, userId: true, status: true },
  });
  if (!order) {
    const key = platformOrderId.trim();
    console.warn(
      "[shopier] imza geçerli ama veritabanında sipariş yok (platform_order_id önek=%s… uzunluk=%s). Shopier’deki bildirim URL’si bu uygulamanın domain’i ile aynı mı, checkout’taki platform_order_id ile eşleşiyor mu kontrol edin.",
      key.slice(0, 16),
      key.length,
    );
    return new Response("OK", { status: 200 });
  }
  if (order.status === "PAID") {
    return new Response("OK", { status: 200 });
  }

  const amountTry = parseTryAmount(totalOrderValue);
  const rawPayload =
    req.method === "GET"
      ? Object.fromEntries(new URL(req.url).searchParams.entries())
      : {
          platform_order_id: platformOrderId,
          status: statusRaw,
          payment_id: paymentId,
          random_nr: randomNr,
          total_order_value: totalOrderValue,
          currency,
          signature,
        };
  const isPaid = isPaidStatus(statusRaw);
  if (!isPaid) {
    console.warn(
      "[shopier] bildirim alındı, imza geçerli; status başarılı sayılmadı (ham=%j)",
      statusRaw.length > 80 ? `${statusRaw.slice(0, 80)}…` : statusRaw,
    );
  }

  const paidAt = isPaid ? new Date() : null;

  await prisma.$transaction(async (tx) => {
    await tx.shopierOrder.update({
      where: { id: order.id },
      data: {
        status: isPaid ? "PAID" : "FAILED",
        paidAt,
        planGrantedAt: paidAt,
        amountTry: amountTry ?? undefined,
        currency: currency || undefined,
        shopierPaymentId: paymentId || undefined,
        rawPayload: rawPayload as Prisma.InputJsonValue,
      },
    });
    if (isPaid && paidAt) {
      await tx.user.update({
        where: { id: order.userId },
        data: {
          planTier: "premium",
          premiumUntil: addPremiumPeriod(paidAt),
        },
      });
    }
  });

  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!url.searchParams.has("platform_order_id")) {
    return new Response(
      "Shopier ödeme bildirimi bu adrese gelir. Test için query parametreleriyle de kabul edilir.",
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }
  return handleNotification(req);
}

export async function POST(req: Request) {
  return handleNotification(req);
}
