import { parseCollectapiPrice } from "@/lib/collectapi-gold";
import {
  buildFxTryMap,
  type CollectapiAllCurrencyPayload,
} from "@/lib/collectapi-currency";

export type CollectapiCriptoRow = {
  code?: string | null;
  name?: string | null;
  currency?: string | null;
  price?: number | null;
  pricestr?: string | null;
};

export type CollectapiCriptoPayload = {
  success?: boolean;
  result?: CollectapiCriptoRow[];
};

function rowCode(row: CollectapiCriptoRow): string | null {
  const c = (row.code ?? "").trim().toUpperCase();
  return c.length > 0 ? c : null;
}

export function criptoRowPriceUsd(row: CollectapiCriptoRow): number | null {
  const p = row.price;
  if (typeof p === "number" && Number.isFinite(p) && p > 0) return p;
  return parseCollectapiPrice(row.pricestr);
}

export type CryptoSymbolRow = { code: string; name: string };

export function criptoRowsToSymbols(
  rows: CollectapiCriptoRow[],
): CryptoSymbolRow[] {
  const byCode = new Map<string, string>();
  for (const row of rows) {
    const code = rowCode(row);
    if (!code) continue;
    const name = (row.name ?? "").trim() || code;
    byCode.set(code, name);
  }
  const out = [...byCode.entries()].map(([code, name]) => ({ code, name }));
  out.sort((a, b) => a.code.localeCompare(b.code, "en"));
  return out;
}

export function buildCryptoTryMap(
  rows: CollectapiCriptoRow[],
  usdTry: number,
): Record<string, number> {
  if (
    !(typeof usdTry === "number") ||
    !Number.isFinite(usdTry) ||
    usdTry <= 0
  ) {
    return {};
  }
  const out: Record<string, number> = {};
  for (const row of rows) {
    const code = rowCode(row);
    if (!code) continue;
    const cur = (row.currency ?? "USD").trim().toUpperCase();
    if (cur !== "USD") continue;
    const usdPx = criptoRowPriceUsd(row);
    if (usdPx == null || usdPx <= 0) continue;
    const tryPx = usdPx * usdTry;
    if (Number.isFinite(tryPx) && tryPx > 0) out[code] = tryPx;
  }
  return out;
}

export async function fetchUsdTryFromCollectapi(
  apiKey: string,
): Promise<number | null> {
  const res = await fetch("https://api.collectapi.com/economy/allCurrency", {
    headers: {
      "content-type": "application/json",
      authorization: `apikey ${apiKey}`,
    },
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as CollectapiAllCurrencyPayload;
  if (!data.success || !Array.isArray(data.result)) return null;
  const map = buildFxTryMap(data.result);
  const u = map.USD;
  return typeof u === "number" && u > 0 ? u : null;
}
