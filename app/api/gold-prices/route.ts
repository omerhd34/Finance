import { NextResponse } from "next/server";
import {
  mapCollectapiRowsToSubtypePrices,
  type CollectapiGoldPayload,
} from "@/lib/collectapi-gold";

const COLLECT_URL = "https://api.collectapi.com/economy/goldPrice";

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        prices: null,
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
        { error: "CollectAPI yanıt vermedi", prices: null },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }

    const data = (await res.json()) as CollectapiGoldPayload;
    if (
      !data.success ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      return NextResponse.json(
        { error: "Altın fiyatları parse edilemedi", prices: null },
        { status: 502 },
      );
    }

    const prices = mapCollectapiRowsToSubtypePrices(data.result);
    const keys = Object.keys(prices);
    if (keys.length === 0) {
      return NextResponse.json(
        { error: "Bilinen altın türleri eşlenemedi", prices: null },
        { status: 502 },
      );
    }

    return NextResponse.json({
      prices,
      updatedAt: new Date().toISOString(),
      source: "collectapi",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Altın fiyatları alınamadı", prices: null },
      { status: 503 },
    );
  }
}
