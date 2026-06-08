export const STORAGE_CURRENCY = "TL" as const;

export {
  FALLBACK_USER_CURRENCY_CODES,
  isUserCurrencyCode,
  normalizeCurrencyCode,
  sortUserCurrencyCodes,
  USER_CURRENCY_PRIORITY,
} from "@/lib/common/user-currencies";

import {
  isUserCurrencyCode,
  normalizeCurrencyCode,
} from "@/lib/common/user-currencies";

export function normalizeUserCurrency(
  code: string | null | undefined,
): string {
  const normalized = normalizeCurrencyCode(code);
  if (isUserCurrencyCode(normalized)) return normalized;
  return "TL";
}

export const FALLBACK_TL_PER_FOREIGN_UNIT: Record<string, number> = {
  TL: 1,
  USD: 44.92,
  EUR: 52.6,
  GBP: 60.61,
};

export const TL_PER_FOREIGN_UNIT = FALLBACK_TL_PER_FOREIGN_UNIT;

let liveRates: Partial<Record<string, number>> | null = null;

export function setLiveExchangeRates(rates: Partial<Record<string, number>>) {
  liveRates = Object.fromEntries(
    Object.entries(rates).filter(
      ([, v]) => typeof v === "number" && Number.isFinite(v) && v > 0,
    ),
  );
}

function rateTable(): Record<string, number> {
  const base = { ...FALLBACK_TL_PER_FOREIGN_UNIT };
  if (liveRates) {
    for (const [k, v] of Object.entries(liveRates)) {
      if (typeof v === "number" && v > 0) {
        base[k] = v;
      }
    }
  }
  return base;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function tryAmountToDisplay(
  amountTry: number,
  displayCode: string,
): number {
  const code = normalizeCurrencyCode(displayCode);
  const table = rateTable();
  if (code === "TL") return round2(amountTry);
  const rate = table[code];
  if (!rate || rate <= 0) return round2(amountTry);
  return round2(amountTry / rate);
}

export function displayAmountToTry(
  amountInUserCurrency: number,
  userCurrencyCode: string,
): number {
  const code = normalizeCurrencyCode(userCurrencyCode);
  const table = rateTable();
  if (code === "TL") return round2(amountInUserCurrency);
  const rate = table[code];
  if (!rate || rate <= 0) return round2(amountInUserCurrency);
  return round2(amountInUserCurrency * rate);
}
