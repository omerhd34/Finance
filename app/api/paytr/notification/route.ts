import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaytrEnv, verifyPaytrNotificationHash } from "@/lib/paytr";
import { paytrDb } from "@/lib/paytr-prisma";

export const dynamic = "force-dynamic";

/** PayTR Bildirim URL (2. adım). Mağaza panelinde HTTPS ile tanımlanmalı. */
export async function POST(req: Request) {
  const env = getPaytrEnv();
  if (!env) {
    return new Response("NO_CONFIG", { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response("BAD_REQUEST", { status: 400 });
  }

  const merchant_oid = String(form.get("merchant_oid") ?? "");
  const status = String(form.get("status") ?? "");
  const total_amount = String(form.get("total_amount") ?? "");
  const incomingHash = String(form.get("hash") ?? "");

  if (!merchant_oid || !status || !total_amount || !incomingHash) {
    return new Response("MISSING", { status: 400 });
  }

  if (
    !verifyPaytrNotificationHash({
      env,
      merchantOid: merchant_oid,
      status,
      totalAmount: total_amount,
      incomingHash,
    })
  ) {
    return new Response("HASH_FAIL", { status: 400 });
  }

  const order = await paytrDb.paytrOrder.findUnique({
    where: { merchantOid: merchant_oid },
  });

  if (!order) {
    console.error("[paytr] Bilinmeyen merchant_oid:", merchant_oid);
    return new Response("OK", { status: 200 });
  }

  if (order.status === "COMPLETED") {
    return new Response("OK", { status: 200 });
  }

  if (status === "failed") {
    await paytrDb.paytrOrder.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    return new Response("OK", { status: 200 });
  }

  if (status === "success") {
    const paid = Number.parseInt(total_amount, 10);
    if (Number.isNaN(paid) || paid < order.amountKurus) {
      await paytrDb.paytrOrder.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return new Response("OK", { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: order.userId },
        data: { planTier: "premium" } as Prisma.UserUpdateInput,
      });
      const txPaytr = tx as unknown as typeof paytrDb;
      await txPaytr.paytrOrder.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    });
  }

  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
