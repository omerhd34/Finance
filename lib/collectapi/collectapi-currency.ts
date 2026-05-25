import { parseCollectapiPrice } from "@/lib/collectapi/collectapi-gold";

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

const CURRENCY_NAMES_TR: Record<string, string> = {
  AED: "Birleşik Arap Emirlikleri dirhemi",
  ARS: "Arjantin pesosu",
  AUD: "Avustralya doları",
  BGN: "Bulgar levası",
  BHD: "Bahreyn dinarı",
  BND: "Brunei doları",
  BRL: "Brezilya reali",
  BWP: "Botsvana pulası",
  CAD: "Kanada doları",
  CHF: "İsviçre frangı",
  CLP: "Şili pesosu",
  CNY: "Çin yuanı",
  COP: "Kolombiya pesosu",
  CZK: "Çek korunası",
  DKK: "Danimarka kronu",
  EUR: "Euro",
  GBP: "İngiliz sterlini",
  HKD: "Hong Kong doları",
  HUF: "Macar forinti",
  IDR: "Endonezya rupiahı",
  ILS: "İsrail şekeli",
  INR: "Hindistan rupisi",
  JPY: "Japon yeni",
  KRW: "Güney Kore wonu",
  KWD: "Kuveyt dinarı",
  MXN: "Meksika pesosu",
  MYR: "Malezya ringgiti",
  NOK: "Norveç kronu",
  NZD: "Yeni Zelanda doları",
  PHP: "Filipin pesosu",
  PLN: "Polonya zlotisi",
  QAR: "Katar riyali",
  RON: "Rumen leyi",
  RUB: "Rus rublesi",
  SAR: "Suudi Arabistan riyali",
  SEK: "İsveç kronu",
  SGD: "Singapur doları",
  THB: "Tayland bahtı",
  TRY: "Türk lirası",
  TTD: "Trinidad ve Tobago doları",
  TWD: "Tayvan doları",
  USD: "Amerikan doları",
  VEF: "Venezuela bolivarı",
  ZAR: "Güney Afrika randı",
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
    const fallbackName = (row.name ?? "").trim() || code;
    const name = CURRENCY_NAMES_TR[code] ?? fallbackName;
    byCode.set(code, name);
  }
  const out = [...byCode.entries()].map(([code, name]) => ({ code, name }));
  const priority: Record<string, number> = { TRY: 0, USD: 1, EUR: 2 };
  out.sort((a, b) => {
    const pa = priority[a.code];
    const pb = priority[b.code];
    if (pa !== undefined || pb !== undefined) {
      return (pa ?? 99) - (pb ?? 99);
    }
    return a.code.localeCompare(b.code, "tr");
  });
  return out;
}
