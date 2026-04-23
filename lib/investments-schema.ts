import { z } from "zod";
import { GOLD_SUBTYPE_VALUES } from "@/lib/gold-subtypes";

export const positionFormSchema = z
  .object({
    assetType: z.enum(["GOLD", "STOCK", "FX", "CRYPTO", "BIST"]),
    goldSubtype: z
      .enum(GOLD_SUBTYPE_VALUES as unknown as [string, ...string[]])
      .optional(),
    title: z.string().optional(),
    ticker: z.string().optional(),
    quantity: z.number().positive("Miktar pozitif olmalı"),
    avgCostPerUnit: z.number().positive("Alış fiyatı pozitif olmalı"),
    marketPricePerUnit: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.assetType === "GOLD") {
      if (!data.goldSubtype) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Altın türü seçin",
          path: ["goldSubtype"],
        });
      }
    }
    if (data.assetType === "STOCK") {
      const tit = data.title?.trim() ?? "";
      if (tit.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Başlık gerekli",
          path: ["title"],
        });
      }
      const t = data.ticker?.trim() ?? "";
      if (t.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hisse kodu gerekli",
          path: ["ticker"],
        });
      }
    }
    if (data.assetType === "FX") {
      const t = data.ticker?.trim().toUpperCase() ?? "";
      if (t.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Para birimi seçin",
          path: ["ticker"],
        });
      }
      const tit = data.title?.trim() ?? "";
      if (tit.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Para birimi seçin",
          path: ["title"],
        });
      }
    }
    if (data.assetType === "CRYPTO") {
      const t = data.ticker?.trim().toUpperCase() ?? "";
      if (t.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kripto seçin",
          path: ["ticker"],
        });
      }
      const tit = data.title?.trim() ?? "";
      if (tit.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kripto seçin",
          path: ["title"],
        });
      }
    }
    if (data.assetType === "BIST") {
      const t = data.ticker?.trim().toUpperCase() ?? "";
      if (t.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Endeks seçin",
          path: ["ticker"],
        });
      }
      const tit = data.title?.trim() ?? "";
      if (tit.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Endeks seçin",
          path: ["title"],
        });
      }
    }
    const raw = data.marketPricePerUnit?.trim() ?? "";
    if (raw !== "") {
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir fiyat girin veya boş bırakın",
          path: ["marketPricePerUnit"],
        });
      }
    }
  });

export type PositionFormValues = z.infer<typeof positionFormSchema>;
