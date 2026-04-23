import { NextResponse } from "next/server";
import {
  parseBistPayloadToQuotes,
  quotesToByTicker,
  type CollectapiBistPayload,
} from "@/lib/collectapi-bist";

const BIST_URL = "https://api.collectapi.com/economy/borsaistanbul";

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        indices: [],
        byTicker: {},
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(BIST_URL, {
      headers: {
        "content-type": "application/json",
        authorization: `apikey ${apiKey}`,
      },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "CollectAPI yanıt vermedi", indices: [], byTicker: {} },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }

    const data = (await res.json()) as CollectapiBistPayload;
    if (!data.success) {
      return NextResponse.json(
        { error: "BIST verisi parse edilemedi", indices: [], byTicker: {} },
        { status: 502 },
      );
    }

    const quotes = parseBistPayloadToQuotes(data);
    if (quotes.length === 0) {
      return NextResponse.json(
        { error: "BIST endeks satırı çıkarılamadı", indices: [], byTicker: {} },
        { status: 502 },
      );
    }

    const byTicker = quotesToByTicker(quotes);
    const indices = quotes.map(({ ticker, title, level }) => ({
      ticker,
      title,
      level,
    }));

    return NextResponse.json({
      indices,
      byTicker,
      updatedAt: new Date().toISOString(),
      source: "collectapi",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "BIST fiyatı alınamadı", indices: [], byTicker: {} },
      { status: 503 },
    );
  }
}
