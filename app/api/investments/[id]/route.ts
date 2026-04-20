import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { GOLD_SUBTYPE_VALUES, goldSubtypeLabel } from "@/lib/gold-subtypes";
import { isUserPremiumInDb } from "@/lib/is-user-premium-db";
import { investmentPosition } from "@/lib/prisma";
import { investmentUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

const PREMIUM_ONLY_MSG =
  "Yatırım takibi yalnızca Premium plandadır. Ayarlar sayfasından planınızı Premium yapın.";

export async function PUT(req: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = investmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const existing = await investmentPosition.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    const data = parsed.data;
    const nextType = data.assetType ?? existing.assetType;
    const nextTicker =
      data.ticker !== undefined
        ? data.ticker === null || data.ticker === ""
          ? null
          : nextType === "STOCK"
            ? data.ticker.trim().toUpperCase()
            : data.ticker.trim()
        : existing.ticker;
    if (nextType === "STOCK" && (!nextTicker || nextTicker.length === 0)) {
      return NextResponse.json(
        { error: { ticker: ["Hisse için kod gerekli"] } },
        { status: 400 },
      );
    }
    const nextGoldSubtype: string | null =
      nextType === "STOCK"
        ? null
        : ((data.goldSubtype !== undefined
            ? data.goldSubtype
            : existing.goldSubtype) ?? "GRAM");
    if (nextType === "GOLD") {
      const g = nextGoldSubtype;
      if (!g || !(GOLD_SUBTYPE_VALUES as readonly string[]).includes(g)) {
        return NextResponse.json(
          { error: { goldSubtype: ["Altın türü seçin"] } },
          { status: 400 },
        );
      }
    }
    const row = await investmentPosition.update({
      where: { id },
      data: {
        ...(data.assetType !== undefined && { assetType: data.assetType }),
        ...(nextType === "STOCK"
          ? { goldSubtype: null }
          : { goldSubtype: nextGoldSubtype }),
        ...(nextType === "GOLD"
          ? { title: goldSubtypeLabel(nextGoldSubtype!) }
          : data.title !== undefined
            ? { title: data.title.trim() }
            : {}),
        ...(data.ticker !== undefined && {
          ticker: nextTicker,
        }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.avgCostPerUnitTry !== undefined && {
          avgCostPerUnitTry: data.avgCostPerUnitTry,
        }),
        ...(data.marketPricePerUnitTry !== undefined && {
          marketPricePerUnitTry: data.marketPricePerUnitTry,
        }),
        ...(data.note !== undefined && {
          note: data.note?.trim() ? data.note.trim() : null,
        }),
      },
    });
    return NextResponse.json(row);
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
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;
    if (!(await isUserPremiumInDb(session.user.id))) {
      return NextResponse.json({ error: PREMIUM_ONLY_MSG }, { status: 403 });
    }
    const { id } = await context.params;
    const existing = await investmentPosition.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    await investmentPosition.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
