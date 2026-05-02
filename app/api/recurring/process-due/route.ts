import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { processAutoRecurringForUser } from "@/lib/recurring/recurring-service";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    const { created } = await processAutoRecurringForUser(session.user.id);
    return NextResponse.json({ created });
  } catch {
    return NextResponse.json({ error: "İşlenemedi" }, { status: 500 });
  }
}
