import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";

export function costBasisTry(p: InvestmentPosition): number {
  return p.quantity * p.avgCostPerUnitTry;
}

export function valueTry(p: InvestmentPosition): number {
  const unit = p.marketPricePerUnitTry ?? p.avgCostPerUnitTry;
  return p.quantity * unit;
}

export function pnlTry(p: InvestmentPosition): number {
  return valueTry(p) - costBasisTry(p);
}

export function totalInvestmentPnlTry(positions: InvestmentPosition[]): number {
  let total = 0;
  for (const p of positions) {
    total += pnlTry(p);
  }
  return total;
}

export function aggregatePositionsTry(
  positions: InvestmentPosition[],
  assetType: InvestmentAssetType,
): {
  count: number;
  costTry: number;
  valueTry: number;
  pnlTry: number;
} {
  let cost = 0;
  let val = 0;
  let count = 0;
  for (const p of positions) {
    if (p.assetType !== assetType) continue;
    count += 1;
    cost += costBasisTry(p);
    val += valueTry(p);
  }
  return { count, costTry: cost, valueTry: val, pnlTry: val - cost };
}
