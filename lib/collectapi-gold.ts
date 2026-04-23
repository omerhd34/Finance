import type { GoldSubtype } from "@/lib/gold-subtypes";
import { GOLD_SUBTYPE_VALUES } from "@/lib/gold-subtypes";

export type CollectapiGoldRow = {
  name?: string;
  title?: string;
  buy?: string | null;
  sell?: string | null;
  buying?: string | null;
  selling?: string | null;
};

export type CollectapiGoldPayload = {
  success?: boolean;
  result?: CollectapiGoldRow[];
};

export function parseCollectapiPrice(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  }
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t || t === "-") return null;
  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");
  const normalized =
    lastComma > lastDot
      ? t.replace(/\./g, "").replace(",", ".")
      : t.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function pickCollectapiUnitTry(row: CollectapiGoldRow): number | null {
  return (
    parseCollectapiPrice(row.sell) ??
    parseCollectapiPrice(row.selling) ??
    parseCollectapiPrice(row.buy) ??
    parseCollectapiPrice(row.buying) ??
    null
  );
}

function normName(name: string | null | undefined): string {
  if (name == null || typeof name !== "string") return "";
  return name.trim().replace(/-/g, " ").toLocaleLowerCase("tr-TR");
}

function rowLabel(row: CollectapiGoldRow | undefined): string | undefined {
  const n = row?.name?.trim();
  if (n) return n;
  const t = row?.title?.trim();
  if (t) return t;
  return undefined;
}

const SUBTYPE_MATCHERS: {
  subtype: GoldSubtype;
  match: (n: string) => boolean;
}[] = [
  { subtype: "GRAM", match: (n) => n.includes("gram") },
  {
    subtype: "CEYREK",
    match: (n) => n.includes("çeyrek") || n.includes("ceyrek"),
  },
  {
    subtype: "YARIM",
    match: (n) => n.includes("yarım") || n.includes("yarim"),
  },
  {
    subtype: "GREMSE",
    match: (n) => n.includes("gremse") || n.includes("gremşe"),
  },
  { subtype: "CUMHURIYET", match: (n) => n.includes("cumhuriyet") },
  {
    subtype: "RESAT",
    match: (n) => n.includes("reşat") || n.includes("resat"),
  },
  { subtype: "HAMIT", match: (n) => n.includes("hamit") },
  {
    subtype: "TAM",
    match: (n) =>
      /\btam\b/.test(n) ||
      n.includes("tam altın") ||
      n.includes("tam altin") ||
      n.includes("tamaltin"),
  },
];

export function mapCollectapiRowsToSubtypePrices(
  rows: CollectapiGoldRow[],
): Partial<Record<GoldSubtype, number>> {
  const out: Partial<Record<GoldSubtype, number>> = {};
  const used = new Set<number>();

  for (const { subtype, match } of SUBTYPE_MATCHERS) {
    for (let i = 0; i < rows.length; i++) {
      if (used.has(i)) continue;
      const n = normName(rowLabel(rows[i]));
      if (!n || !match(n)) continue;
      const price = pickCollectapiUnitTry(rows[i]);
      if (price == null) continue;
      out[subtype] = price;
      used.add(i);
      break;
    }
  }

  return out;
}

export function isSupportedGoldSubtype(k: string): k is GoldSubtype {
  return (GOLD_SUBTYPE_VALUES as readonly string[]).includes(k);
}
