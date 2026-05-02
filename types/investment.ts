import type { GoldSubtype } from "@/lib/investments/gold-subtypes";

export type InvestmentAssetType =
  | "GOLD"
  | "SILVER"
  | "PLATINUM"
  | "COMMODITY"
  | "STOCK"
  | "FX"
  | "CRYPTO";

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
