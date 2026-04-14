import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notification } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly") === "1";
    if (countOnly) {
      const unreadCount = await notification.count({
        where: { userId: session.user.id, readAt: null },
      });
      return NextResponse.json({ items: [], unreadCount });
    }

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? "20")),
    );
    const unreadOnly = searchParams.get("unreadOnly") === "1";

    const where = {
      userId: session.user.id,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [items, unreadCount] = await Promise.all([
      notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      notification.count({
        where: { userId: session.user.id, readAt: null },
      }),
    ]);

    return NextResponse.json({
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        readAt: n.readAt?.toISOString() ?? null,
        metadata: n.metadata,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
