import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { prisma } from "@/lib/db/prisma";
import { buildFinanceAnalyzePayload } from "@/lib/ai/build-finance-analyze-payload";
import { buildMessagingDigestFromPayload } from "@/lib/ai/messaging-digest";
import { ensurePremiumNotExpired } from "@/lib/premium/premium-subscription";

export async function GET() {
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
        { error: "Bu özet yalnızca Premium üyeler içindir." },
        { status: 403 },
      );
    }

    const payload = await buildFinanceAnalyzePayload(session.user.id);
    const text = buildMessagingDigestFromPayload(payload);
    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Özet oluşturulamadı." },
      { status: 500 },
    );
  }
}
