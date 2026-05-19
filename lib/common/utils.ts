import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { tryAmountToDisplay } from "@/lib/common/currency";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const currencyLocales: Record<string, string> = {
  TL: "tr-TR",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

function intlCurrencyCode(displayCode: string): string {
  if (displayCode === "TL") return "TRY";
  return displayCode;
}

export function currencySymbolLabel(displayCode: string): string {
  const code = intlCurrencyCode(displayCode);
  const locale = currencyLocales[displayCode] ?? "tr-TR";
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

export function formatMoney(amountInTL: number, currency: string): string {
  const displayAmount = tryAmountToDisplay(amountInTL, currency);
  const locale = currencyLocales[currency] ?? "tr-TR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: intlCurrencyCode(currency),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount);
}

export function formatMoneyAmount(
  amountInTL: number,
  currency: string,
): string {
  const displayAmount = tryAmountToDisplay(amountInTL, currency);
  const locale = currencyLocales[currency] ?? "tr-TR";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount);
}

export function localTodayYmd(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateTR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
  });
}

export function formatDateTimeTR(
  date: Date | string | null | undefined,
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sentenceCaseFirstTr(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const lower = t.toLocaleLowerCase("tr-TR");
  return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
}
