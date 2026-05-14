import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { aiFinanceChatTurn, prisma } from "@/lib/db/prisma";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

type RouteContext = { params: Promise<{ turnId: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    await ensurePremiumNotExpired(session.user.id);

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planTier: true },
    });
    if (!dbUser || dbUser.planTier !== "premium") {
      return NextResponse.json(
        {
          error:
            "IQfinansAI Asistanı yalnızca aktif Premium abonelikte kullanılabilir.",
        },
        { status: 403 },
      );
    }

    const { turnId } = await context.params;
    if (!turnId || turnId.length > 40) {
      return NextResponse.json({ error: "Geçersiz kayıt" }, { status: 400 });
    }

    const removed = await aiFinanceChatTurn.deleteMany({
      where: { id: turnId, userId: session.user.id },
    });
    if (removed.count === 0) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
