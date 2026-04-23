import type { GoldSubtype } from "@/lib/gold-subtypes";

export type InvestmentAssetType = "GOLD" | "STOCK" | "FX" | "CRYPTO" | "BIST";

export type InvestmentPosition = {
  id: string;
  assetType: InvestmentAssetType;
  goldSubtype: GoldSubtype | null;
  title: string;
  ticker: string | null;
  quantity: number;
  avgCostPerUnitTry: number;
  marketPricePerUnitTry: number | null;
  note: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
