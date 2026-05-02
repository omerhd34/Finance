export const GOLD_SUBTYPE_VALUES = [
  "GRAM",
  "YARIM",
  "TAM",
  "CUMHURIYET",
  "CEYREK",
  "RESAT",
  "HAMIT",
  "GREMSE",
] as const;

export type GoldSubtype = (typeof GOLD_SUBTYPE_VALUES)[number];

export const GOLD_SUBTYPE_OPTIONS: { value: GoldSubtype; label: string }[] = [
  { value: "GRAM", label: "Gram" },
  { value: "YARIM", label: "Yarım" },
  { value: "TAM", label: "Tam" },
  { value: "CUMHURIYET", label: "Cumhuriyet" },
  { value: "CEYREK", label: "Çeyrek" },
  { value: "RESAT", label: "Reşat" },
  { value: "HAMIT", label: "Hamit" },
  { value: "GREMSE", label: "Gremse" },
];

export function goldSubtypeLabel(v: string | null | undefined): string {
  if (!v) return "—";
  return GOLD_SUBTYPE_OPTIONS.find((x) => x.value === v)?.label ?? v;
}

export function goldMiktarLabel(subtype: string | null | undefined): string {
  if (subtype != null && subtype !== "GRAM") return "Miktar (adet)";
  return "Miktar (gram)";
}

export function formatGoldQuantityCell(
  quantity: number,
  subtype: string | null | undefined,
): string {
  const n = quantity.toLocaleString("tr-TR", { maximumFractionDigits: 4 });
  if (subtype == null || subtype === "GRAM") return `${n} g`;
  return `${n} adet`;
}
