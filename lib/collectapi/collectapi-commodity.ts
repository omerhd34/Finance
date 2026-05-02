import { parseCollectapiPrice } from "@/lib/collectapi/collectapi-gold";

export type CollectapiEmtiaRow = {
  name?: string | null;
  text?: string | null;
  selling?: number | string | null;
  sellingstr?: string | null;
};

export type CollectapiEmtiaPayload = {
  success?: boolean;
  result?: CollectapiEmtiaRow[];
};

export type CommoditySymbolRow = { code: string; name: string };

function rowCode(row: CollectapiEmtiaRow): string | null {
  const c = (row.name ?? "").trim().toUpperCase();
  return c.length > 0 ? c : null;
}

export function emtiaSellingIsAlreadyTry(row: CollectapiEmtiaRow): boolean {
  const code = rowCode(row);
  if (code === "GRPLTN") return true;
  const blob = `${row.text ?? ""} ${row.name ?? ""}`
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD");
  if (blob.includes("gram") || /\bgr\b/.test(blob)) return true;
  return false;
}

function rowSellingUsd(row: CollectapiEmtiaRow): number | null {
  const s = row.selling;
  if (typeof s === "number" && Number.isFinite(s) && s > 0) return s;
  if (typeof s === "string") {
    const p = parseCollectapiPrice(s);
    if (p != null && p > 0) return p;
  }
  return parseCollectapiPrice(row.sellingstr);
}

export function emtiaRowsToSymbols(
  rows: CollectapiEmtiaRow[],
): CommoditySymbolRow[] {
  const byCode = new Map<string, string>();
  for (const row of rows) {
    const code = rowCode(row);
    if (!code) continue;
    const name = (row.text ?? "").trim() || code;
    byCode.set(code, name);
  }
  const out = [...byCode.entries()].map(([code, name]) => ({ code, name }));
  out.sort((a, b) => a.code.localeCompare(b.code, "en"));
  return out;
}

export function buildCommodityTryMap(
  rows: CollectapiEmtiaRow[],
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
    const rawPx = rowSellingUsd(row);
    if (rawPx == null || rawPx <= 0) continue;
    const tryPx = emtiaSellingIsAlreadyTry(row) ? rawPx : rawPx * usdTry;
    if (Number.isFinite(tryPx) && tryPx > 0) out[code] = tryPx;
  }
  return out;
}
