import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isPaidStatus,
  parseTryAmount,
  verifyShopierSignature,
  getShopierApiSecret,
} from "@/lib/shopier";

export const dynamic = "force-dynamic";

function rawStr(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

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

async function parsePayload(req: Request): Promise<ShopierPayload> {
  if (req.method === "GET") {
    return parseFromSearchParams(new URL(req.url));
  }

  try {
    const form = await req.formData();
    return {
      platformOrderId: rawStr(form.get("platform_order_id")),
      statusRaw: rawStr(form.get("status")),
      paymentId: str(form.get("payment_id")),
      randomNr: rawStr(form.get("random_nr")),
      totalOrderValue: rawStr(form.get("total_order_value")),
      currency: rawStr(form.get("currency")),
      signature: rawStr(form.get("signature")),
    };
  } catch {
    // Some providers send x-www-form-urlencoded but with inconsistent headers.
    // Fallback to raw body parsing so callback still works.
    const raw = await req.text();
    const qs = new URLSearchParams(raw);
    return {
      platformOrderId: qs.get("platform_order_id") ?? "",
      statusRaw: qs.get("status") ?? "",
      paymentId: (qs.get("payment_id") ?? "").trim(),
      randomNr: qs.get("random_nr") ?? "",
      totalOrderValue: qs.get("total_order_value") ?? "",
      currency: qs.get("currency") ?? "",
      signature: qs.get("signature") ?? "",
    };
  }
}

async function handleNotification(req: Request) {
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
  } = await parsePayload(req);

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

  await prisma.$transaction(async (tx) => {
    await tx.shopierOrder.update({
      where: { id: order.id },
      data: {
        status: isPaid ? "PAID" : "FAILED",
        paidAt: isPaid ? new Date() : null,
        amountTry: amountTry ?? undefined,
        currency: currency || undefined,
        shopierPaymentId: paymentId || undefined,
        rawPayload: rawPayload as Prisma.InputJsonValue,
      },
    });
    if (isPaid) {
      await tx.user.update({
        where: { id: order.userId },
        data: { planTier: "premium" },
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
  // Keep browser-readable diagnostics when opened manually.
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
