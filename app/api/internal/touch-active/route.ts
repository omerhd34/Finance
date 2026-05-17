import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const INTERNAL_SECRET =
  process.env.INTERNAL_MIDDLEWARE_SECRET ?? "dev-internal-secret";

export async function POST(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "no-session" });
  }

  let debounceMs = 60_000;
  try {
    const body = (await request.json()) as { debounceMs?: number };
    if (typeof body.debounceMs === "number" && body.debounceMs > 0) {
      debounceMs = body.debounceMs;
    }
  } catch {}

  const userId = session.user.id;
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true },
  });

  if (
    user?.lastActiveAt &&
    now.getTime() - user.lastActiveAt.getTime() < debounceMs
  ) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: now },
  });

  return NextResponse.json({ ok: true, skipped: false });
}
