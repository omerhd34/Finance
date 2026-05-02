import { NextResponse } from "next/server";
import type {
  CollectapiGoldPayload,
  CollectapiGoldRow,
} from "@/lib/collectapi/collectapi-gold";
import { silverGramTryFromCollectapiRows } from "@/lib/collectapi/collectapi-silver";

const COLLECT_URL = "https://api.collectapi.com/economy/silverPrice";

function normalizeRows(payload: CollectapiGoldPayload): CollectapiGoldRow[] {
  const r = payload.result;
  if (Array.isArray(r)) return r;
  if (r && typeof r === "object") return [r as CollectapiGoldRow];
  return [];
}

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        priceTryPerGram: null,
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(COLLECT_URL, {
      headers: {
        "content-type": "application/json",
        authorization: `apikey ${apiKey}`,
      },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "CollectAPI yanıt vermedi", priceTryPerGram: null },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }

    const data = (await res.json()) as CollectapiGoldPayload;
    const rows = normalizeRows(data);
    if (!data.success || rows.length === 0) {
      return NextResponse.json(
        { error: "Gümüş fiyatı parse edilemedi", priceTryPerGram: null },
        { status: 502 },
      );
    }

    const priceTryPerGram = silverGramTryFromCollectapiRows(rows);
    if (priceTryPerGram == null) {
      return NextResponse.json(
        { error: "Gümüş gram fiyatı bulunamadı", priceTryPerGram: null },
        { status: 502 },
      );
    }

    return NextResponse.json({
      priceTryPerGram,
      updatedAt: new Date().toISOString(),
      source: "collectapi",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gümüş fiyatı alınamadı", priceTryPerGram: null },
      { status: 503 },
    );
  }
}
