export const STORAGE_CURRENCY = "TL" as const;

const USER_DISPLAY_CURRENCIES = ["TL", "USD", "EUR", "GBP"] as const;
export type UserDisplayCurrency = (typeof USER_DISPLAY_CURRENCIES)[number];

export function normalizeUserCurrency(
  code: string | null | undefined,
): UserDisplayCurrency {
  const c = code?.trim();
  if (c && (USER_DISPLAY_CURRENCIES as readonly string[]).includes(c)) {
    return c as UserDisplayCurrency;
  }
  return "TL";
}

export const FALLBACK_TL_PER_FOREIGN_UNIT: Record<string, number> = {
  TL: 1,
  USD: 34.25,
  EUR: 36.8,
  GBP: 43.5,
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
  const table = rateTable();
  const code = displayCode in FALLBACK_TL_PER_FOREIGN_UNIT ? displayCode : "TL";
  const rate = table[code];
  if (code === "TL" || !rate || rate <= 0) return round2(amountTry);
  return round2(amountTry / rate);
}

export function displayAmountToTry(
  amountInUserCurrency: number,
  userCurrencyCode: string,
): number {
  const table = rateTable();
  const code =
    userCurrencyCode in FALLBACK_TL_PER_FOREIGN_UNIT ? userCurrencyCode : "TL";
  const rate = table[code];
  if (code === "TL" || !rate || rate <= 0) return round2(amountInUserCurrency);
  return round2(amountInUserCurrency * rate);
}
