import { NextResponse } from "next/server";
import {
  normalizeSymbolRows,
  type CollectapiSymbolsPayload,
} from "@/lib/collectapi-currency";

const COLLECT_URL = "https://api.collectapi.com/economy/symbols";

export async function GET() {
  const apiKey = process.env.COLLECTAPI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "COLLECTAPI_API_KEY tanımlı değil. .env dosyasına CollectAPI anahtarını ekleyin.",
        items: null,
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
        { error: "CollectAPI yanıt vermedi", items: null },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }

    const data = (await res.json()) as CollectapiSymbolsPayload;
    if (
      !data.success ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      return NextResponse.json(
        { error: "Döviz sembolleri parse edilemedi", items: null },
        { status: 502 },
      );
    }

    const items = normalizeSymbolRows(data.result);
    return NextResponse.json({
      items,
      updatedAt: new Date().toISOString(),
      source: "collectapi",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Döviz sembolleri alınamadı", items: null },
      { status: 503 },
    );
  }
}
