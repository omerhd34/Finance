import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { goldSubtypeLabel } from "@/lib/gold-subtypes";
import { isUserPremiumInDb } from "@/lib/is-user-premium-db";
import { investmentPosition } from "@/lib/prisma";
import { investmentCreateSchema } from "@/lib/validations";

const PREMIUM_ONLY_MSG =
  "Yatırım takibi yalnızca Premium plandadır. Ayarlar sayfasından planınızı Premium yapın.";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    if (!(await isUserPremiumInDb(session.user.id))) {
      return NextResponse.json({ error: PREMIUM_ONLY_MSG }, { status: 403 });
    }
    const items = await investmentPosition.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    if (!(await isUserPremiumInDb(session.user.id))) {
      return NextResponse.json({ error: PREMIUM_ONLY_MSG }, { status: 403 });
    }
    const body: unknown = await req.json();
    const parsed = investmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const ticker =
      d.assetType === "BIST" && d.ticker?.trim()
        ? d.ticker.trim().toUpperCase()
        : (d.assetType === "STOCK" ||
              d.assetType === "FX" ||
              d.assetType === "CRYPTO") &&
            d.ticker
          ? d.ticker.trim().toUpperCase()
          : d.ticker?.trim()
            ? d.ticker.trim()
            : null;
    const title =
      d.assetType === "GOLD"
        ? goldSubtypeLabel(d.goldSubtype!)
        : (d.title ?? "").trim();
    const row = await investmentPosition.create({
      data: {
        assetType: d.assetType,
        goldSubtype: d.assetType === "GOLD" ? d.goldSubtype! : null,
        title,
        ticker,
        quantity: d.quantity,
        avgCostPerUnitTry: d.avgCostPerUnitTry,
        marketPricePerUnitTry: d.marketPricePerUnitTry ?? null,
        note: d.note?.trim() ? d.note.trim() : null,
        userId: session.user.id,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
