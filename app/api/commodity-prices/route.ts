import { NextResponse } from "next/server";
import {
  buildCommodityTryMap,
  emtiaRowsToSymbols,
  type CollectapiEmtiaPayload,
} from "@/lib/collectapi/collectapi-commodity";
import { fetchUsdTryFromCollectapi } from "@/lib/collectapi/collectapi-crypto";

const EMTIA_URL = "https://api.collectapi.com/economy/emtia";

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        quotes: null,
        symbols: null,
      },
      { status: 503 },
    );
  }

  try {
    const [usdTry, emtiaRes] = await Promise.all([
      fetchUsdTryFromCollectapi(apiKey),
      fetch(EMTIA_URL, {
        headers: {
          "content-type": "application/json",
          authorization: `apikey ${apiKey}`,
        },
        next: { revalidate: 120 },
      }),
    ]);

    if (usdTry == null) {
      return NextResponse.json(
        {
          error: "USD/TRY kuru alınamadı; emtia TL fiyatı hesaplanamadı",
          quotes: null,
          symbols: null,
        },
        { status: 502 },
      );
    }

    if (!emtiaRes.ok) {
      return NextResponse.json(
        {
          error: "CollectAPI (emtia) yanıt vermedi",
          quotes: null,
          symbols: null,
        },
        {
          status:
            emtiaRes.status >= 400 && emtiaRes.status < 600
              ? emtiaRes.status
              : 502,
        },
      );
    }

    const data = (await emtiaRes.json()) as CollectapiEmtiaPayload;
    if (
      !data.success ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Emtia listesi parse edilemedi",
          quotes: null,
          symbols: null,
        },
        { status: 502 },
      );
    }

    const quotes = buildCommodityTryMap(data.result, usdTry);
    const symbols = emtiaRowsToSymbols(data.result).filter(
      (s) => quotes[s.code] != null,
    );

    if (Object.keys(quotes).length === 0) {
      return NextResponse.json(
        {
          error: "Emtia TL fiyatları çıkarılamadı",
          quotes: null,
          symbols: null,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      quotes,
      symbols,
      updatedAt: new Date().toISOString(),
      source: "collectapi",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Emtia fiyatları alınamadı", quotes: null, symbols: null },
      { status: 503 },
    );
  }
}
