import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildIframePaytrToken,
  buildPremiumUserBasketBase64,
  generatePaytrMerchantOid,
  getPaytrEnv,
} from "@/lib/paytr";
import { PREMIUM_AMOUNT_KURUS } from "@/lib/premium-price";
import { paytrDb } from "@/lib/paytr-prisma";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 39);
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 39);
  return "127.0.0.1";
}

export async function POST(req: Request) {
  let merchantOidForCleanup: string | null = null;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const user = (await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planTier: true, email: true, name: true, phone: true } as never,
    })) as {
      planTier: string;
      email: string;
      name: string | null;
      phone: string | null;
    } | null;
    if (!user?.email) {
      return NextResponse.json(
        { error: "E-posta bulunamadı" },
        { status: 400 },
      );
    }
    if (user.planTier === "premium") {
      return NextResponse.json(
        { error: "Zaten Premium plandasınız" },
        { status: 400 },
      );
    }

    const env = getPaytrEnv();
    if (!env) {
      return NextResponse.json(
        {
          error:
            "PayTR yapılandırması eksik. PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT ortam değişkenlerini ayarlayın.",
        },
        { status: 503 },
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const merchantOkUrl = `${baseUrl}/ayarlar?paytr=ok`;
    const merchantFailUrl = `${baseUrl}/ayarlar?paytr=fail`;

    const userIp = clientIp(req);
    const userBasket = buildPremiumUserBasketBase64();
    const email = user.email.slice(0, 100);
    const userName = (user.name ?? "Müşteri").slice(0, 60);
    const userPhone =
      (user.phone ?? "05000000000").replace(/\D/g, "").slice(0, 20) ||
      "05000000000";
    const userAddress = "Türkiye".slice(0, 400);

    let merchantOid = "";
    for (let i = 0; i < 8; i++) {
      merchantOid = generatePaytrMerchantOid(session.user.id);
      const exists = await paytrDb.paytrOrder.findUnique({
        where: { merchantOid },
      });
      if (!exists) break;
    }

    await paytrDb.paytrOrder.create({
      data: {
        merchantOid,
        userId: session.user.id,
        amountKurus: PREMIUM_AMOUNT_KURUS,
        currency: "TL",
        status: "PENDING",
      },
    });
    merchantOidForCleanup = merchantOid;

    const paytr_token = buildIframePaytrToken({
      env,
      userIp,
      merchantOid,
      email,
      paymentAmountKurus: PREMIUM_AMOUNT_KURUS,
      userBasketBase64: userBasket,
    });

    const body = new URLSearchParams();
    body.set("merchant_id", env.merchantId);
    body.set("user_ip", userIp);
    body.set("merchant_oid", merchantOid);
    body.set("email", email);
    body.set("payment_amount", String(PREMIUM_AMOUNT_KURUS));
    body.set("paytr_token", paytr_token);
    body.set("user_basket", userBasket);
    body.set("debug_on", env.debugOn);
    body.set("no_installment", "1");
    body.set("max_installment", "0");
    body.set("user_name", userName);
    body.set("user_address", userAddress);
    body.set("user_phone", userPhone);
    body.set("merchant_ok_url", merchantOkUrl);
    body.set("merchant_fail_url", merchantFailUrl);
    body.set("timeout_limit", "30");
    body.set("currency", "TL");
    body.set("test_mode", env.testMode);
    body.set("lang", "tr");

    const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const raw = await paytrRes.text();
    let json: { status?: string; token?: string; reason?: string };
    try {
      json = JSON.parse(raw) as typeof json;
    } catch {
      await paytrDb.paytrOrder.deleteMany({ where: { merchantOid } });
      return NextResponse.json(
        { error: "PayTR yanıtı çözülemedi" },
        { status: 502 },
      );
    }

    if (json.status !== "success" || !json.token) {
      await paytrDb.paytrOrder.deleteMany({ where: { merchantOid } });
      return NextResponse.json(
        {
          error:
            typeof json.reason === "string"
              ? json.reason
              : "PayTR token alınamadı",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ token: json.token });
  } catch (e) {
    console.error(e);
    if (merchantOidForCleanup) {
      await paytrDb.paytrOrder
        .deleteMany({ where: { merchantOid: merchantOidForCleanup } })
        .catch(() => {});
    }
    return NextResponse.json({ error: "Ödeme başlatılamadı" }, { status: 500 });
  }
}
