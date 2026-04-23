import { NextResponse } from "next/server";
import {
  buildFxTryMap,
  type CollectapiAllCurrencyPayload,
} from "@/lib/collectapi-currency";

const COLLECT_URL = "https://api.collectapi.com/economy/allCurrency";

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        quotes: null,
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
        { error: "CollectAPI yanıt vermedi", quotes: null },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }

    const data = (await res.json()) as CollectapiAllCurrencyPayload;
    if (
      !data.success ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      return NextResponse.json(
        { error: "Döviz kurları parse edilemedi", quotes: null },
        { status: 502 },
      );
    }

    const quotes = buildFxTryMap(data.result);
    if (Object.keys(quotes).length === 0) {
      return NextResponse.json(
        { error: "Döviz fiyatları çıkarılamadı", quotes: null },
        { status: 502 },
      );
    }

    return NextResponse.json({
      quotes,
      updatedAt: new Date().toISOString(),
      source: "collectapi",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Döviz kurları alınamadı", quotes: null },
      { status: 503 },
    );
  }
}
