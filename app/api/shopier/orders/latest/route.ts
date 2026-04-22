import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addPremiumPeriod,
  ensurePremiumNotExpired,
} from "@/lib/premium-subscription";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    await ensurePremiumNotExpired(session.user.id);

    let order = await prisma.shopierOrder.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderCode: true,
        status: true,
        amountTry: true,
        currency: true,
        createdAt: true,
        paidAt: true,
        planGrantedAt: true,
      },
    });

    if (order?.status === "PAID" && order.planGrantedAt == null) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { planTier: true },
      });
      if (user && user.planTier !== "premium") {
        const now = new Date();
        const periodStart = order.paidAt ?? now;
        await prisma.$transaction([
          prisma.user.update({
            where: { id: session.user.id },
            data: {
              planTier: "premium",
              premiumUntil: addPremiumPeriod(periodStart),
            },
          }),
          prisma.shopierOrder.update({
            where: { id: order.id },
            data: { planGrantedAt: now },
          }),
        ]);
        order = { ...order, planGrantedAt: now };
      }
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Okunamadı" }, { status: 500 });
  }
}
