import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const order = await prisma.shopierOrder.findFirst({
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
      },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Okunamadı" }, { status: 500 });
  }
}
