import { parseCollectapiPrice } from "@/lib/collectapi-gold";

export type CollectapiAllCurrencyRow = {
  code?: string | null;
  currency?: string | null;
  name?: string | null;
  buying?: string | number | null;
  selling?: string | number | null;
  banknoteBuying?: string | number | null;
  banknoteSelling?: string | number | null;
  forexBuying?: string | number | null;
  forexSelling?: string | number | null;
};

export type CollectapiAllCurrencyPayload = {
  success?: boolean;
  result?: CollectapiAllCurrencyRow[];
};

export type CollectapiSymbolRow = {
  code?: string | null;
  name?: string | null;
};

export type CollectapiSymbolsPayload = {
  success?: boolean;
  result?: CollectapiSymbolRow[];
};

export function currencyRowCode(row: CollectapiAllCurrencyRow): string | null {
  const c = (row.code ?? row.currency ?? "").trim().toUpperCase();
  return c.length > 0 ? c : null;
}

export function currencyRowTryPerUnit(
  row: CollectapiAllCurrencyRow,
): number | null {
  return (
    parseCollectapiPrice(row.selling) ??
    parseCollectapiPrice(row.forexSelling) ??
    parseCollectapiPrice(row.banknoteSelling) ??
    parseCollectapiPrice(row.buying) ??
    parseCollectapiPrice(row.forexBuying) ??
    parseCollectapiPrice(row.banknoteBuying) ??
    null
  );
}

export function buildFxTryMap(
  rows: CollectapiAllCurrencyRow[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const code = currencyRowCode(row);
    if (!code) continue;
    const px = currencyRowTryPerUnit(row);
    if (px != null && px > 0) out[code] = px;
  }
  return out;
}

export function normalizeSymbolRows(
  rows: CollectapiSymbolRow[],
): { code: string; name: string }[] {
  const byCode = new Map<string, string>();
  for (const row of rows) {
    const code = (row.code ?? "").trim().toUpperCase();
    if (!code) continue;
    const name = (row.name ?? "").trim() || code;
    byCode.set(code, name);
  }
  const out = [...byCode.entries()].map(([code, name]) => ({ code, name }));
  out.sort((a, b) => a.code.localeCompare(b.code, "tr"));
  return out;
}
