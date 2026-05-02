import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { blockIfEmailNotVerified } from "@/lib/auth/require-email-verified";
import { GOLD_SUBTYPE_VALUES, goldSubtypeLabel } from "@/lib/investments/gold-subtypes";
import { PLATINUM_INVESTMENT_TITLE } from "@/lib/investments/platinum-investment";
import { SILVER_INVESTMENT_TITLE } from "@/lib/investments/silver-investment";
import { isUserPremiumInDb } from "@/lib/premium/is-user-premium-db";
import { investmentPosition } from "@/lib/db/prisma";
import { investmentUpdateSchema } from "@/lib/schemas/validations";

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
          : nextType === "STOCK" ||
              nextType === "FX" ||
              nextType === "CRYPTO" ||
              nextType === "COMMODITY"
            ? data.ticker.trim().toUpperCase()
            : data.ticker.trim()
        : existing.ticker;
    const tickerToSave = nextTicker;
    if (nextType === "STOCK" && (!tickerToSave || tickerToSave.length === 0)) {
      return NextResponse.json(
        { error: { ticker: ["Hisse için kod gerekli"] } },
        { status: 400 },
      );
    }
    if (nextType === "FX" && (!tickerToSave || tickerToSave.length < 2)) {
      return NextResponse.json(
        { error: { ticker: ["Para birimi kodu gerekli"] } },
        { status: 400 },
      );
    }

    if (nextType === "CRYPTO" && (!tickerToSave || tickerToSave.length === 0)) {
      return NextResponse.json(
        { error: { ticker: ["Kripto kodu gerekli"] } },
        { status: 400 },
      );
    }

    if (
      nextType === "COMMODITY" &&
      (!tickerToSave || tickerToSave.length === 0)
    ) {
      return NextResponse.json(
        { error: { ticker: ["Emtia kodu gerekli"] } },
        { status: 400 },
      );
    }
    const nextGoldSubtype: string | null =
      nextType === "GOLD"
        ? ((data.goldSubtype !== undefined
            ? data.goldSubtype
            : existing.goldSubtype) ?? "GRAM")
        : null;
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
        ...(nextType === "GOLD"
          ? { goldSubtype: nextGoldSubtype }
          : { goldSubtype: null }),
        ...(nextType === "GOLD"
          ? { title: goldSubtypeLabel(nextGoldSubtype!) }
          : nextType === "SILVER"
            ? { title: SILVER_INVESTMENT_TITLE }
            : nextType === "PLATINUM"
              ? { title: PLATINUM_INVESTMENT_TITLE }
              : nextType === "STOCK"
                ? { title: tickerToSave ?? "" }
                : data.title !== undefined
                  ? { title: data.title.trim() }
                  : {}),
        ...(data.ticker !== undefined && { ticker: tickerToSave }),
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
