import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notification } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
