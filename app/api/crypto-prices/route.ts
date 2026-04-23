import { NextResponse } from "next/server";
import {
  buildCryptoTryMap,
  criptoRowsToSymbols,
  fetchUsdTryFromCollectapi,
  type CollectapiCriptoPayload,
} from "@/lib/collectapi-crypto";

const CRIPTO_URL = "https://api.collectapi.com/economy/cripto";

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
    const [usdTry, criptoRes] = await Promise.all([
      fetchUsdTryFromCollectapi(apiKey),
      fetch(CRIPTO_URL, {
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
          error: "USD/TRY kuru alınamadı; kripto TL fiyatı hesaplanamadı",
          quotes: null,
          symbols: null,
        },
        { status: 502 },
      );
    }

    if (!criptoRes.ok) {
      return NextResponse.json(
        {
          error: "CollectAPI (cripto) yanıt vermedi",
          quotes: null,
          symbols: null,
        },
        {
          status:
            criptoRes.status >= 400 && criptoRes.status < 600
              ? criptoRes.status
              : 502,
        },
      );
    }

    const criptoData = (await criptoRes.json()) as CollectapiCriptoPayload;
    if (
      !criptoData.success ||
      !Array.isArray(criptoData.result) ||
      criptoData.result.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Kripto listesi parse edilemedi",
          quotes: null,
          symbols: null,
        },
        { status: 502 },
      );
    }

    const quotes = buildCryptoTryMap(criptoData.result, usdTry);
    const symbols = criptoRowsToSymbols(criptoData.result).filter(
      (s) => quotes[s.code] != null,
    );

    if (Object.keys(quotes).length === 0) {
      return NextResponse.json(
        {
          error: "Kripto TL fiyatları çıkarılamadı",
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
      { error: "Kripto fiyatları alınamadı", quotes: null, symbols: null },
      { status: 503 },
    );
  }
}
