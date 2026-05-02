import type { CollectapiGoldRow } from "@/lib/collectapi/collectapi-gold";
import { parseCollectapiPrice } from "@/lib/collectapi/collectapi-gold";

function normLabel(row: CollectapiGoldRow): string {
  const n = row.name?.trim() || row.title?.trim() || "";
  return n.trim().replace(/-/g, " ").toLocaleLowerCase("tr-TR");
}

function isPlatinumName(n: string): boolean {
  return (
    n.includes("platin") ||
    n.includes("platinum") ||
    n.includes("platın") ||
    n.includes("xpt")
  );
}

function isPlatinumRow(row: CollectapiGoldRow): boolean {
  const ext = row as CollectapiGoldRow & Record<string, unknown>;
  const n = normLabel(row);
  if (isPlatinumName(n)) return true;
  const text =
    typeof ext.text === "string"
      ? ext.text.trim().replace(/-/g, " ").toLocaleLowerCase("tr-TR")
      : "";
  if (text.includes("platin") || text.includes("platinum")) return true;
  const code = String(ext.name ?? ext.code ?? "")
    .trim()
    .toUpperCase();
  if (code === "GRPLTN" || code === "XPT") return true;
  return false;
}

function pickFlexibleTry(row: CollectapiGoldRow): number | null {
  const ext = row as CollectapiGoldRow & Record<string, unknown>;
  const keys = [
    "satis",
    "satış",
    "selling",
    "sellingstr",
    "sell",
    "sellstr",
    "son",
    "last",
    "price",
    "fiyat",
    "alis",
    "alış",
    "buy",
    "buying",
    "buyingstr",
  ] as const;
  for (const k of keys) {
    const raw = ext[k];
    if (raw === undefined) continue;
    const p = parseCollectapiPrice(raw as string | number | null | undefined);
    if (p != null) return p;
  }
  return null;
}

function firstNonEmptyStr(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

export function normalizeUnknownMetalRow(r: unknown): CollectapiGoldRow | null {
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const o = r as Record<string, unknown>;
  const label = firstNonEmptyStr(
    o.text,
    o.name,
    o.title,
    o.emtia_adi,
    o.emtiaAdi,
    o.urun,
    o.urunAdi,
    o.symbol,
    o.code,
  );
  const sellRaw =
    o.satis ??
    o.satış ??
    o.selling ??
    o.sellingstr ??
    o.sell ??
    o.sellstr ??
    o.son ??
    o.last ??
    o.price ??
    o.fiyat;
  const buyRaw =
    o.alis ?? o.alış ?? o.buy ?? o.buying ?? o.buyingstr ?? o.buyingStr;
  const row = {
    ...o,
    name: label ?? firstNonEmptyStr(o.name),
    title: typeof o.title === "string" ? o.title : undefined,
    sell: sellRaw != null ? String(sellRaw) : undefined,
    buy: buyRaw != null ? String(buyRaw) : undefined,
  } as CollectapiGoldRow;
  if (!label && sellRaw == null && buyRaw == null) return null;
  return row;
}

export function flattenCollectapiNestedResult(result: unknown): unknown[] {
  const out: unknown[] = [];
  const walk = (x: unknown) => {
    if (x == null) return;
    if (Array.isArray(x)) {
      for (const el of x) walk(el);
      return;
    }
    if (typeof x === "object") {
      const o = x as Record<string, unknown>;
      let sawArray = false;
      for (const v of Object.values(o)) {
        if (Array.isArray(v)) {
          sawArray = true;
          for (const el of v) walk(el);
        }
      }
      if (!sawArray) out.push(o);
    }
  };
  walk(result);
  return out;
}

export function platinumGramTryFromCollectapiRows(
  rows: CollectapiGoldRow[],
): number | null {
  let anyPlatinum: number | null = null;

  for (const row of rows) {
    const price = pickFlexibleTry(row);
    if (price == null) continue;
    if (!isPlatinumRow(row)) continue;
    const n = normLabel(row);
    const ext = row as CollectapiGoldRow & Record<string, unknown>;
    const textLite =
      typeof ext.text === "string" ? ext.text.toLocaleLowerCase("tr-TR") : "";
    if (
      n.includes("gram") ||
      textLite.includes("gram") ||
      n.includes(" gr ") ||
      n.endsWith(" gr") ||
      /\bgr\b/.test(n)
    ) {
      return price;
    }
    if (anyPlatinum == null) anyPlatinum = price;
  }

  if (anyPlatinum != null) return anyPlatinum;

  if (rows.length === 1) {
    const p = pickFlexibleTry(rows[0]);
    if (p != null) return p;
  }

  return null;
}

export function platinumGramTryFromUnknownRows(rows: unknown[]): number | null {
  const normalized: CollectapiGoldRow[] = [];
  for (const r of rows) {
    const row = normalizeUnknownMetalRow(r);
    if (row) normalized.push(row);
  }
  return platinumGramTryFromCollectapiRows(normalized);
}
