export function parseOptionalUnitPrice(raw: string | undefined): number | null {
  const s = raw?.trim() ?? "";
  if (s === "") return null;
  const n = Number(s.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
