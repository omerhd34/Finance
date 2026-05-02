import type { InvestmentAssetType } from "@/types/investment";

export const PORTFOLIO_ASSET_ORDER: InvestmentAssetType[] = [
  "GOLD",
  "SILVER",
  "PLATINUM",
  "FX",
  "STOCK",
  "CRYPTO",
];

export const PORTFOLIO_SLICE_COLORS = [
  "#eab308",
  "#C0C0C0",
  "#E5E4E2",
  "#3b82f6",
  "#008000",
  "#F7931A",
];

export function portfolioAssetTypeLabel(t: InvestmentAssetType): string {
  switch (t) {
    case "GOLD":
      return "Altın";
    case "SILVER":
      return "Gümüş";
    case "PLATINUM":
      return "Platin";
    case "FX":
      return "Döviz";
    case "STOCK":
      return "Hisse";
    case "CRYPTO":
      return "Kripto";
    default:
      return t;
  }
}

/** Kar/zarar çubuğu: gerçek varlık veya gruplanmış "Diğer" satırı. */
export type PortfolioBarRow =
  | {
      type: InvestmentAssetType;
      name: string;
      value: number;
      cost: number;
      pnl: number;
      fill: string;
    }
  | {
      type: "OTHER_BAR";
      name: "Diğer";
      pnl: number;
      value: number;
      cost: number;
      fill: string;
    };

export type PortfolioLegendEntry = {
  id: string;
  name: string;
  value: number;
  fill: string;
};

export type PortfolioPieDatum = { name: string; value: number; fill: string };
