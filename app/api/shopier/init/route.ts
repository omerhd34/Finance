import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { prisma } from "@/lib/prisma";
import {
  buildShopierCheckoutUrl,
  generateShopierOrderCode,
  getPremiumPlanAmountTry,
} from "@/lib/shopier";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planTier: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 },
      );
    }
    if (user.planTier === "premium") {
      return NextResponse.json(
        { error: "Zaten Premium plandasınız" },
        { status: 400 },
      );
    }

    let orderCode = "";
    for (let i = 0; i < 8; i++) {
      orderCode = generateShopierOrderCode(session.user.id);
      const exists = await prisma.shopierOrder.findUnique({
        where: { orderCode },
        select: { id: true },
      });
      if (!exists) break;
    }
    if (!orderCode) {
      return NextResponse.json(
        { error: "Sipariş kodu üretilemedi" },
        { status: 500 },
      );
    }

    await prisma.shopierOrder.create({
      data: {
        orderCode,
        userId: session.user.id,
        status: "PENDING",
        amountTry: getPremiumPlanAmountTry(),
        currency: "TRY",
      },
    });

    const checkoutUrl = buildShopierCheckoutUrl(orderCode);
    return NextResponse.json({ checkoutUrl, orderCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ödeme başlatılamadı" }, { status: 500 });
  }
}
