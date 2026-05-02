import { NextResponse } from "next/server";
import {
  flattenCollectapiNestedResult,
  platinumGramTryFromUnknownRows,
} from "@/lib/collectapi/collectapi-platinum";

const EMTIA_URL = "https://api.collectapi.com/economy/emtia";

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

  const headers = {
    "content-type": "application/json",
    authorization: `apikey ${apiKey}`,
  } as const;

  try {
    let priceTryPerGram: number | null = null;

    const emtiaRes = await fetch(EMTIA_URL, {
      headers,
      next: { revalidate: 120 },
    });

    if (emtiaRes.ok) {
      const emtiaData: unknown = await emtiaRes.json();
      const payload = emtiaData as { success?: boolean; result?: unknown };
      if (payload.success !== false && payload.result != null) {
        const flat = flattenCollectapiNestedResult(payload.result);
        priceTryPerGram = platinumGramTryFromUnknownRows(flat);
      }
    }

    if (priceTryPerGram == null) {
      return NextResponse.json(
        {
          error:
            "Platin gram fiyatı emtia yanıtında bulunamadı. CollectAPI Economy paketinizde emtia uçları açık mı kontrol edin.",
          priceTryPerGram: null,
        },
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
      { error: "Platin fiyatı alınamadı", priceTryPerGram: null },
      { status: 503 },
    );
  }
}
