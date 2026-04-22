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

export async function POST(req: Request) {
  const secret = getShopierApiSecret();
  if (!secret) {
    return new Response("NO_CONFIG", { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response("BAD_REQUEST", { status: 400 });
  }

  const platformOrderId = rawStr(form.get("platform_order_id"));
  const statusRaw = rawStr(form.get("status"));
  const paymentId = str(form.get("payment_id"));
  const randomNr = rawStr(form.get("random_nr"));
  const totalOrderValue = rawStr(form.get("total_order_value"));
  const currency = rawStr(form.get("currency"));
  const signature = rawStr(form.get("signature"));

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
    return new Response("OK", { status: 200 });
  }
  if (order.status === "PAID") {
    return new Response("OK", { status: 200 });
  }

  const amountTry = parseTryAmount(totalOrderValue);
  const rawPayload = Object.fromEntries(form.entries());
  const isPaid = isPaidStatus(statusRaw);

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
