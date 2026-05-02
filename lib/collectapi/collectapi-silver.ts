import type { CollectapiGoldRow } from "@/lib/collectapi/collectapi-gold";
import { pickCollectapiUnitTry } from "@/lib/collectapi/collectapi-gold";

function normLabel(row: CollectapiGoldRow): string {
  const n = row.name?.trim() || row.title?.trim() || "";
  return n.trim().replace(/-/g, " ").toLocaleLowerCase("tr-TR");
}

export function silverGramTryFromCollectapiRows(
  rows: CollectapiGoldRow[],
): number | null {
  let fallback: number | null = null;

  for (const row of rows) {
    const price = pickCollectapiUnitTry(row);
    if (price == null) continue;
    const n = normLabel(row);
    if (
      n.includes("gram") ||
      n.includes(" gr ") ||
      n.endsWith(" gr") ||
      n.includes("gümüş gram") ||
      n.includes("gumus gram")
    ) {
      return price;
    }
    if (fallback == null) fallback = price;
  }

  return fallback;
}
