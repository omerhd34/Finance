import type { GoldSubtype } from "@/lib/gold-subtypes";
import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";

export type LiveGoldPriceMap = Partial<Record<GoldSubtype, number>>;
export type LiveStockTryMap = Record<string, number>;

export type LiveFxTryMap = Record<string, number>;

export type LiveCryptoTryMap = Record<string, number>;

export type LiveInvestmentQuotes = {
  gold?: LiveGoldPriceMap;
  stockByTicker?: LiveStockTryMap;
  fxByCode?: LiveFxTryMap;
  cryptoByTicker?: LiveCryptoTryMap;
};

function stockTickerUpper(ticker: string | null | undefined): string | null {
  const t = ticker?.trim();
  if (!t) return null;
  return t.toUpperCase();
}

export function costBasisTry(p: InvestmentPosition): number {
  return p.quantity * p.avgCostPerUnitTry;
}

export function effectiveMarketUnitTry(
  p: InvestmentPosition,
  live?: LiveInvestmentQuotes,
): number {
  if (p.assetType === "GOLD" && p.goldSubtype && live?.gold) {
    const gl = live.gold[p.goldSubtype];
    if (typeof gl === "number" && gl > 0) return gl;
  }
  if (p.assetType === "STOCK" && live?.stockByTicker) {
    const k = stockTickerUpper(p.ticker);
    if (k) {
      const sl = live.stockByTicker[k];
      if (typeof sl === "number" && sl > 0) return sl;
    }
  }
  if (p.assetType === "FX" && live?.fxByCode) {
    const k = stockTickerUpper(p.ticker);
    if (k) {
      const fx = live.fxByCode[k];
      if (typeof fx === "number" && fx > 0) return fx;
    }
  }
  if (p.assetType === "CRYPTO" && live?.cryptoByTicker) {
    const k = stockTickerUpper(p.ticker);
    if (k) {
      const cx = live.cryptoByTicker[k];
      if (typeof cx === "number" && cx > 0) return cx;
    }
  }
  if (p.marketPricePerUnitTry != null) return p.marketPricePerUnitTry;
  return p.avgCostPerUnitTry;
}

export function valueTry(
  p: InvestmentPosition,
  live?: LiveInvestmentQuotes,
): number {
  return p.quantity * effectiveMarketUnitTry(p, live);
}

export function pnlTry(
  p: InvestmentPosition,
  live?: LiveInvestmentQuotes,
): number {
  return valueTry(p, live) - costBasisTry(p);
}

export function hasDisplayableMarketPrice(
  p: InvestmentPosition,
  live?: LiveInvestmentQuotes,
): boolean {
  if (p.marketPricePerUnitTry != null) return true;
  if (p.assetType === "GOLD" && p.goldSubtype && live?.gold) {
    const gl = live.gold[p.goldSubtype];
    if (typeof gl === "number" && gl > 0) return true;
  }
  if (p.assetType === "STOCK") {
    const k = stockTickerUpper(p.ticker);
    if (k && live?.stockByTicker) {
      const sl = live.stockByTicker[k];
      if (typeof sl === "number" && sl > 0) return true;
    }
  }
  if (p.assetType === "FX") {
    const k = stockTickerUpper(p.ticker);
    if (k && live?.fxByCode) {
      const fx = live.fxByCode[k];
      if (typeof fx === "number" && fx > 0) return true;
    }
  }
  if (p.assetType === "CRYPTO") {
    const k = stockTickerUpper(p.ticker);
    if (k && live?.cryptoByTicker) {
      const cx = live.cryptoByTicker[k];
      if (typeof cx === "number" && cx > 0) return true;
    }
  }
  return false;
}

export function totalInvestmentPnlTry(
  positions: InvestmentPosition[],
  live?: LiveInvestmentQuotes,
): number {
  let total = 0;
  for (const p of positions) {
    total += pnlTry(p, live);
  }
  return total;
}

export function aggregatePositionsTry(
  positions: InvestmentPosition[],
  assetType: InvestmentAssetType,
  live?: LiveInvestmentQuotes,
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
    val += valueTry(p, live);
  }
  return { count, costTry: cost, valueTry: val, pnlTry: val - cost };
}
