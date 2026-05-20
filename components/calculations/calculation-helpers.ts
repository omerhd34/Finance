export type RatePeriod = "daily" | "monthly" | "yearly";

export type CompoundingFrequency = "daily" | "monthly" | "yearly";

export const RATE_PERIOD_OPTIONS: { value: RatePeriod; label: string }[] = [
  { value: "daily", label: "Günlük" },
  { value: "monthly", label: "Aylık" },
  { value: "yearly", label: "Yıllık" },
];

export const COMPOUNDING_OPTIONS: {
  value: CompoundingFrequency;
  label: string;
}[] = [
  { value: "daily", label: "Günlük" },
  { value: "monthly", label: "Aylık" },
  { value: "yearly", label: "Yıllık" },
];

export function toAnnualRatePercent(rate: number, period: RatePeriod): number {
  if (period === "daily") return rate * 365;
  if (period === "monthly") return rate * 12;
  return rate;
}

export function compoundingTimesPerYear(
  frequency: CompoundingFrequency,
): number {
  if (frequency === "daily") return 365;
  if (frequency === "monthly") return 12;
  return 1;
}

const TR_THOUSANDS_ONLY = /^\d{1,3}(\.\d{3})+$/;

export function parseDecimal(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (trimmed.includes(",")) {
    const normalized = trimmed.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (TR_THOUSANDS_ONLY.test(trimmed)) {
    const parsed = Number(trimmed.replace(/\./g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const dotCount = (trimmed.match(/\./g) ?? []).length;
  if (dotCount === 1) {
    const [, fraction = ""] = trimmed.split(".");
    if (fraction.length <= 2) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    const parsed = Number(trimmed.replace(/\./g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (dotCount > 1) {
    const parsed = Number(trimmed.replace(/\./g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatTrNumber(raw: string): string {
  const cleaned = raw.replace(/[^\d,]/g, "");
  if (!cleaned) return "";
  const [intPartRaw, ...decimalParts] = cleaned.split(",");
  const intPart = intPartRaw.replace(/^0+(\d)/, "$1");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimal =
    decimalParts.length > 0 ? "," + decimalParts.join("").slice(0, 2) : "";
  return withThousands + decimal;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
