import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { tryAmountToDisplay } from "@/lib/currency";

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

export function formatDateTR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR");
}
