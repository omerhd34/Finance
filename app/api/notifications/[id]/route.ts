import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notification } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await context.params;
    const body: unknown = await req.json();
    const read =
      body &&
      typeof body === "object" &&
      "read" in body &&
      (body as { read?: unknown }).read === true;

    if (!read) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    const existing = await notification.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const row = await notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return NextResponse.json({
      id: row.id,
      readAt: row.readAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await context.params;
    const existing = await notification.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await notification.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
