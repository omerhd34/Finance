import { NextResponse } from "next/server";
import {
  buildFxTryMap,
  type CollectapiAllCurrencyPayload,
} from "@/lib/collectapi/collectapi-currency";

const COLLECT_URL = "https://api.collectapi.com/economy/allCurrency";

const DISPLAY_CODES = ["USD", "EUR", "GBP"] as const;

function pickDisplayRates(
  quotes: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const code of DISPLAY_CODES) {
    const v = quotes[code];
    if (typeof v === "number" && v > 0) out[code] = v;
  }
  return out;
}

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        rates: null,
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
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "CollectAPI yanıt vermedi", rates: null },
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
        { error: "Kurlar parse edilemedi", rates: null },
        { status: 502 },
      );
    }

    const quotes = buildFxTryMap(data.result);
    const rates = pickDisplayRates(quotes);
    if (Object.keys(rates).length === 0) {
      return NextResponse.json(
        { error: "Kurlar çıkarılamadı", rates: null },
        { status: 502 },
      );
    }

    return NextResponse.json({
      rates,
      source: "collectapi",
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kurlar alınamadı", rates: null },
      { status: 503 },
    );
  }
}
