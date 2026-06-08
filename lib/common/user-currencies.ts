import { CURRENCY_NAMES_TR } from "@/lib/collectapi/collectapi-currency";

export const USER_CURRENCY_PRIORITY = ["TL", "USD", "EUR", "GBP"] as const;

const STATIC_FX_CODES = Object.keys(CURRENCY_NAMES_TR).filter(
  (code) => code !== "TRY",
);

export const FALLBACK_USER_CURRENCY_CODES: readonly string[] = [
  "TL",
  ...[...STATIC_FX_CODES].sort((a, b) => a.localeCompare(b, "tr")),
];

export function normalizeCurrencyCode(
  code: string | null | undefined,
): string {
  const c = code?.trim().toUpperCase();
  if (!c) return "TL";
  if (c === "TRY") return "TL";
  return c;
}

export function isUserCurrencyCode(code: string): boolean {
  const normalized = normalizeCurrencyCode(code);
  if (normalized === "TL") return true;
  return STATIC_FX_CODES.includes(normalized);
}

export function sortUserCurrencyCodes(codes: readonly string[]): string[] {
  const unique = new Set<string>();

  for (const code of codes) {
    const normalized = normalizeCurrencyCode(code);
    if (isUserCurrencyCode(normalized)) unique.add(normalized);
  }
  unique.add("TL");

  const priority = USER_CURRENCY_PRIORITY.filter((code) => unique.has(code));
  const rest = [...unique]
    .filter(
      (code) =>
        !USER_CURRENCY_PRIORITY.includes(
          code as (typeof USER_CURRENCY_PRIORITY)[number],
        ),
    )
    .sort((a, b) => a.localeCompare(b, "tr"));

  return [...priority, ...rest];
}

export function userCurrencyName(code: string): string | undefined {
  const normalized = normalizeCurrencyCode(code);
  if (normalized === "TL") return CURRENCY_NAMES_TR.TRY;
  return CURRENCY_NAMES_TR[normalized];
}
