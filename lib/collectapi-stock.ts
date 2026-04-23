import { parseCollectapiPrice } from "@/lib/collectapi-gold";

export type CollectapiHisseRow = {
  code?: string | null;
  lastprice?: number | null;
  lastpricestr?: string | null;
};

export type CollectapiHissePayload = {
  success?: boolean;
  result?: CollectapiHisseRow[];
};

export function hisseRowLastTry(row: CollectapiHisseRow): number | null {
  const lp = row.lastprice;
  if (typeof lp === "number" && Number.isFinite(lp) && lp > 0) return lp;
  return parseCollectapiPrice(row.lastpricestr);
}

export function buildStockQuoteMapTry(
  rows: CollectapiHisseRow[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const code = row.code?.trim().toUpperCase();
    if (!code) continue;
    const px = hisseRowLastTry(row);
    if (px != null && px > 0) out[code] = px;
  }
  return out;
}
