import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = new Date();
  const result = await prisma.user.updateMany({
    where: {
      planTier: "premium",
      premiumUntil: { lt: now },
    },
    data: {
      planTier: "free",
      premiumUntil: null,
    },
  });

  return NextResponse.json({
    ok: true,
    processedAt: now.toISOString(),
    downgradedCount: result.count,
  });
}
