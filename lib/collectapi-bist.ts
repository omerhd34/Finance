import { parseCollectapiPrice } from "@/lib/collectapi-gold";

export const BIST_DEFAULT_TICKER = "XU100";
export const BIST_DEFAULT_TITLE = "BIST 100";

export type CollectapiBistResultRow = {
  current?: number | null;
  currentstr?: string | null;
  name?: string | null;
  text?: string | null;
  title?: string | null;
  desc?: string | null;
  symbol?: string | null;
  code?: string | null;
  sembol?: string | null;
  indexcode?: string | null;
  endeks?: string | null;
  last?: number | string | null;
  son?: number | string | null;
};

export type CollectapiBistPayload = {
  success?: boolean;
  result?: CollectapiBistResultRow | CollectapiBistResultRow[] | null;
};

export type BistIndexQuote = {
  ticker: string;
  title: string;
  level: number;
};

type LooseRow = Record<string, unknown>;

function strField(row: LooseRow, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length > 0) return t;
    }
  }
  return null;
}

function rowLevel(row: LooseRow): number | null {
  const c = row.current;
  if (typeof c === "number" && Number.isFinite(c) && c > 0) return c;
  const cs = row.currentstr;
  if (typeof cs === "string") {
    const p = parseCollectapiPrice(cs);
    if (p != null) return p;
  }
  for (const k of ["last", "son", "value", "price", "closing"]) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    if (typeof v === "string") {
      const p = parseCollectapiPrice(v);
      if (p != null) return p;
    }
  }
  return null;
}

function titleFromRow(row: LooseRow): string | null {
  return strField(row, [
    "text",
    "name",
    "title",
    "desc",
    "endeks",
    "indexname",
    "description",
    "aciklama",
  ]);
}

function codeFromRow(row: LooseRow): string | null {
  return strField(row, [
    "symbol",
    "code",
    "sembol",
    "indexcode",
    "shortname",
    "exchangeCode",
  ]);
}

function tickerFromTitle(title: string, used: Set<string>): string {
  const n = title
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\u0130/g, "I")
    .replace(/ı/g, "i")
    .toUpperCase();

  const rules: Array<{ re: RegExp; ticker: string }> = [
    { re: /^B[Iİ]ST\s*100$/, ticker: "XU100" },
    { re: /^B[Iİ]ST100$/, ticker: "XU100" },
    { re: /^B[Iİ]ST\s*30$/, ticker: "XU030" },
    { re: /^B[Iİ]ST30$/, ticker: "XU030" },
    { re: /^B[Iİ]ST\s*50$/, ticker: "XU050" },
    { re: /^B[Iİ]ST\s*500$/, ticker: "XU500" },
    { re: /^B[Iİ]ST500$/, ticker: "XU500" },
    {
      re: /^B[Iİ]ST\s*KATILIM\s*100$/,
      ticker: "XK100",
    },
    { re: /^B[Iİ]ST\s*TUM-100$/, ticker: "XTUMY" },
    { re: /^B[Iİ]ST\s*TUM\s*100$/, ticker: "XTUMY" },
    { re: /^B[Iİ]ST\s*TUM$/, ticker: "XUTUM" },
    { re: /^B[Iİ]ST\s*LIKIT\s*BANKA$/, ticker: "XLBNK" },
    {
      re: /^B[Iİ]ST\s*BANKA\s*DIS[Iİ]\s*LIKIT\s*10$/,
      ticker: "X10XB",
    },
    {
      re: /^B[Iİ]ST\s*SURDURULEBILIRLIK$/,
      ticker: "XUSRD",
    },
    {
      re: /^B[Iİ]ST\s*SÜRDÜRÜLEBİLİRLİK$/,
      ticker: "XUSRD",
    },
    {
      re: /^B[Iİ]ST\s*SURDURULEBILIRLIK\s*25$/,
      ticker: "XSD25",
    },
  ];

  for (const { re, ticker } of rules) {
    if (re.test(n)) return ensureUniqueTicker(ticker, used);
  }

  const slug = n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return ensureUniqueTicker(slug.length > 0 ? slug : "BIST_IDX", used);
}

function ensureUniqueTicker(base: string, used: Set<string>): string {
  const t = base.toUpperCase();
  if (!used.has(t)) {
    used.add(t);
    return t;
  }
  let i = 2;
  while (used.has(`${t}_${i}`)) i += 1;
  const out = `${t}_${i}`;
  used.add(out);
  return out;
}

function extractRows(result: CollectapiBistPayload["result"]): LooseRow[] {
  if (result == null) return [];
  if (Array.isArray(result)) {
    return result.filter(
      (x) => x != null && typeof x === "object",
    ) as LooseRow[];
  }
  if (typeof result === "object") {
    const o = result as LooseRow;
    if (
      typeof o.current === "number" ||
      typeof o.currentstr === "string" ||
      typeof o.last === "number" ||
      typeof o.son === "string"
    ) {
      return [o];
    }
    const vals = Object.values(o).filter(
      (v) => v != null && typeof v === "object",
    ) as LooseRow[];
    const priced = vals.filter(
      (v) =>
        typeof v.current === "number" ||
        typeof v.currentstr === "string" ||
        typeof v.last === "number" ||
        typeof v.son === "string",
    );
    if (priced.length > 0) return priced;
  }
  return [];
}

export function parseBistPayloadToQuotes(
  payload: CollectapiBistPayload,
): BistIndexQuote[] {
  const rows = extractRows(payload.result);
  const used = new Set<string>();
  const quotes: BistIndexQuote[] = [];

  for (const row of rows) {
    const level = rowLevel(row);
    if (level == null || level <= 0) continue;

    const fromApi = codeFromRow(row)?.trim().toUpperCase().replace(/\s+/g, "");
    const titleRaw = titleFromRow(row);
    const title =
      titleRaw && titleRaw.trim().length > 0
        ? titleRaw.trim()
        : fromApi && fromApi.length >= 2
          ? fromApi
          : "BIST endeksi";

    const ticker =
      fromApi && fromApi.length >= 2
        ? ensureUniqueTicker(fromApi, used)
        : tickerFromTitle(title, used);

    quotes.push({ ticker, title, level });
  }

  return quotes;
}

export function quotesToByTicker(
  quotes: BistIndexQuote[],
): Record<string, number> {
  const m: Record<string, number> = {};
  for (const q of quotes) {
    const k = q.ticker.toUpperCase();
    m[k] = q.level;
    const slug = q.title
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40);
    if (slug && slug !== k) m[slug] = q.level;
  }
  return m;
}

export function pickBistIndexLevel(
  payload: CollectapiBistPayload,
): number | null {
  const q = parseBistPayloadToQuotes(payload);
  if (q.length === 0) return null;
  return q[0]!.level;
}
