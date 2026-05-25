export const DEBT_ASSET_UNIT_VALUES = [
  "TL",
  "USD",
  "EUR",
  "GBP",
  "FX",
  "GOLD_GRAM",
  "GOLD_CEYREK",
  "GOLD_YARIM",
  "GOLD_TAM",
  "GOLD_CUMHURIYET",
  "GOLD_RESAT",
  "GOLD_HAMIT",
  "GOLD_GREMSE",
  "SILVER_GRAM",
  "STOCK",
  "CRYPTO",
  "COMMODITY",
] as const;

export type DebtAssetUnit = (typeof DEBT_ASSET_UNIT_VALUES)[number];

export const DEFAULT_DEBT_ASSET_UNIT: DebtAssetUnit = "TL";

type GroupKey = "CASH" | "GOLD" | "SILVER" | "STOCK" | "CRYPTO" | "COMMODITY";

export type DebtAssetCategory =
  | "CASH"
  | "GOLD"
  | "STOCK"
  | "COMMODITY"
  | "CRYPTO";

export const DEBT_ASSET_CATEGORIES: ReadonlyArray<{
  value: DebtAssetCategory;
  label: string;
}> = [
  { value: "CASH", label: "Döviz" },
  { value: "GOLD", label: "Altın" },
  { value: "STOCK", label: "Hisse senedi" },
  { value: "COMMODITY", label: "Emtia" },
  { value: "CRYPTO", label: "Kripto" },
];

export function categoryForUnit(
  unit: DebtAssetUnit | string | null | undefined,
): DebtAssetCategory {
  const u = normalizeDebtAssetUnit(unit);
  const opt = DEBT_ASSET_UNIT_OPTIONS.find((o) => o.value === u);
  if (!opt) return "CASH";
  if (opt.group === "SILVER") return "COMMODITY";
  if (opt.group === "STOCK") return "STOCK";
  if (opt.group === "CRYPTO") return "CRYPTO";
  if (opt.group === "COMMODITY") return "COMMODITY";
  if (opt.group === "GOLD") return "GOLD";
  return "CASH";
}

export function isFxLikeUnit(unit: string | null | undefined): boolean {
  const u = normalizeDebtAssetUnit(unit);
  return u === "FX" || u === "USD" || u === "EUR" || u === "GBP";
}

export function defaultUnitForCategory(
  category: DebtAssetCategory,
): DebtAssetUnit {
  switch (category) {
    case "CASH":
      return "TL";
    case "GOLD":
      return "GOLD_GRAM";
    case "STOCK":
      return "STOCK";
    case "COMMODITY":
      return "COMMODITY";
    case "CRYPTO":
      return "CRYPTO";
  }
}

export const DEBT_ASSET_UNIT_OPTIONS: ReadonlyArray<{
  value: DebtAssetUnit;
  label: string;
  shortLabel: string;
  group: GroupKey;
  fractionDigits: number;
}> = [
  {
    value: "TL",
    label: "Türk lirası (TL)",
    shortLabel: "TL",
    group: "CASH",
    fractionDigits: 2,
  },
  {
    value: "USD",
    label: "Amerikan doları (USD)",
    shortLabel: "USD",
    group: "CASH",
    fractionDigits: 2,
  },
  {
    value: "EUR",
    label: "Euro (EUR)",
    shortLabel: "EUR",
    group: "CASH",
    fractionDigits: 2,
  },
  {
    value: "GBP",
    label: "İngiliz sterlini (GBP)",
    shortLabel: "GBP",
    group: "CASH",
    fractionDigits: 2,
  },
  {
    value: "FX",
    label: "Döviz",
    shortLabel: "döviz",
    group: "CASH",
    fractionDigits: 2,
  },
  {
    value: "GOLD_GRAM",
    label: "Gram",
    shortLabel: "gr altın",
    group: "GOLD",
    fractionDigits: 4,
  },
  {
    value: "GOLD_CEYREK",
    label: "Çeyrek",
    shortLabel: "çeyrek",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "GOLD_YARIM",
    label: "Yarım",
    shortLabel: "yarım",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "GOLD_TAM",
    label: "Tam",
    shortLabel: "tam",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "GOLD_CUMHURIYET",
    label: "Cumhuriyet",
    shortLabel: "cumhuriyet",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "GOLD_RESAT",
    label: "Reşat",
    shortLabel: "reşat",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "GOLD_HAMIT",
    label: "Hamit",
    shortLabel: "hamit",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "GOLD_GREMSE",
    label: "Gremse",
    shortLabel: "gremse",
    group: "GOLD",
    fractionDigits: 2,
  },
  {
    value: "SILVER_GRAM",
    label: "Gram",
    shortLabel: "gr gümüş",
    group: "SILVER",
    fractionDigits: 4,
  },
  {
    value: "STOCK",
    label: "Hisse senedi",
    shortLabel: "adet",
    group: "STOCK",
    fractionDigits: 4,
  },
  {
    value: "CRYPTO",
    label: "Kripto",
    shortLabel: "adet",
    group: "CRYPTO",
    fractionDigits: 8,
  },
  {
    value: "COMMODITY",
    label: "Emtia",
    shortLabel: "adet",
    group: "COMMODITY",
    fractionDigits: 4,
  },
];

export function isDebtAssetUnit(value: unknown): value is DebtAssetUnit {
  return (
    typeof value === "string" &&
    (DEBT_ASSET_UNIT_VALUES as readonly string[]).includes(value)
  );
}

export function normalizeDebtAssetUnit(
  value: string | null | undefined,
): DebtAssetUnit {
  if (isDebtAssetUnit(value)) return value;
  return DEFAULT_DEBT_ASSET_UNIT;
}

export function debtAssetUnitOption(unit: DebtAssetUnit) {
  return (
    DEBT_ASSET_UNIT_OPTIONS.find((o) => o.value === unit) ??
    DEBT_ASSET_UNIT_OPTIONS[0]
  );
}

export function debtAssetUnitLabel(
  unit: string | null | undefined,
  variant: "short" | "long" = "short",
): string {
  const opt = debtAssetUnitOption(normalizeDebtAssetUnit(unit));
  return variant === "long" ? opt.label : opt.shortLabel;
}

export function isCashAssetUnit(unit: string | null | undefined): boolean {
  return debtAssetUnitOption(normalizeDebtAssetUnit(unit)).group === "CASH";
}

export function isTryAssetUnit(unit: string | null | undefined): boolean {
  return normalizeDebtAssetUnit(unit) === "TL";
}

const SYMBOL_BASED_UNITS: ReadonlySet<DebtAssetUnit> = new Set([
  "FX",
  "STOCK",
  "CRYPTO",
  "COMMODITY",
]);

export function debtAssetUnitNeedsSymbol(
  unit: string | null | undefined,
): boolean {
  return SYMBOL_BASED_UNITS.has(normalizeDebtAssetUnit(unit));
}

export function normalizeDebtAssetSymbol(
  symbol: string | null | undefined,
): string | null {
  const trimmed = (symbol ?? "").trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function formatDebtAssetQuantity(
  quantity: number,
  unit: string | null | undefined,
): string {
  const opt = debtAssetUnitOption(normalizeDebtAssetUnit(unit));
  const value = Number.isFinite(quantity) ? quantity : 0;
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: opt.fractionDigits,
  });
}

export function formatDebtAssetAmount(
  quantity: number,
  unit: string | null | undefined,
  symbol?: string | null,
): string {
  const u = normalizeDebtAssetUnit(unit);
  const sym = normalizeDebtAssetSymbol(symbol);
  const qty = formatDebtAssetQuantity(quantity, u);
  if (u === "FX" && sym) return `${qty} ${sym}`;
  const base = `${qty} ${debtAssetUnitLabel(u, "short")}`;
  if (sym && SYMBOL_BASED_UNITS.has(u)) return `${base} ${sym}`;
  return base;
}

const GOLD_UNIT_TO_SUBTYPE: Record<string, string> = {
  GOLD_GRAM: "GRAM",
  GOLD_CEYREK: "CEYREK",
  GOLD_YARIM: "YARIM",
  GOLD_TAM: "TAM",
  GOLD_CUMHURIYET: "CUMHURIYET",
  GOLD_RESAT: "RESAT",
  GOLD_HAMIT: "HAMIT",
  GOLD_GREMSE: "GREMSE",
};

export type DebtAssetTryRates = {
  goldBySubtype?: Partial<Record<string, number>>;
  silverTryPerGram?: number | null;
  fxByCode?: Record<string, number>;
  stockBySymbol?: Record<string, number>;
  cryptoBySymbol?: Record<string, number>;
  commodityBySymbol?: Record<string, number>;
};

export function convertDebtAssetToTry(
  quantity: number,
  unit: string | null | undefined,
  rates: DebtAssetTryRates,
  symbol?: string | null,
): number | null {
  if (!Number.isFinite(quantity)) return null;
  const u = normalizeDebtAssetUnit(unit);
  if (u === "TL") return quantity;

  if (u === "USD" || u === "EUR" || u === "GBP") {
    const rate = rates.fxByCode?.[u];
    if (typeof rate === "number" && rate > 0) return quantity * rate;
    return null;
  }

  if (u === "FX") {
    const sym = normalizeDebtAssetSymbol(symbol);
    if (!sym) return null;
    const rate = rates.fxByCode?.[sym];
    if (typeof rate === "number" && rate > 0) return quantity * rate;
    return null;
  }

  if (u === "SILVER_GRAM") {
    const rate = rates.silverTryPerGram;
    if (typeof rate === "number" && rate > 0) return quantity * rate;
    return null;
  }

  const goldSubtype = GOLD_UNIT_TO_SUBTYPE[u];
  if (goldSubtype) {
    const rate = rates.goldBySubtype?.[goldSubtype];
    if (typeof rate === "number" && rate > 0) return quantity * rate;
    return null;
  }

  if (SYMBOL_BASED_UNITS.has(u)) {
    const sym = normalizeDebtAssetSymbol(symbol);
    if (!sym) return null;
    const map =
      u === "STOCK"
        ? rates.stockBySymbol
        : u === "CRYPTO"
          ? rates.cryptoBySymbol
          : rates.commodityBySymbol;
    const rate = map?.[sym];
    if (typeof rate === "number" && rate > 0) return quantity * rate;
    return null;
  }

  return null;
}
