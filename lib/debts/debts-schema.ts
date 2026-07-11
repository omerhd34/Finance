import { z } from "zod";
import { DEBT_ASSET_UNIT_VALUES } from "@/lib/debts/debt-asset-units";

export const newDebtSchema = z
  .object({
    direction: z.enum(["RECEIVABLE", "PAYABLE"]),
    counterparty: z.string().min(1, "Kişi veya başlık gerekli"),
    totalAmount: z.number().positive("Pozitif olmalı"),
    paidAmount: z.number().min(0, "Negatif olamaz"),
    assetUnit: z.enum(
      DEBT_ASSET_UNIT_VALUES as unknown as [string, ...string[]],
    ),
    assetSymbol: z.string().trim().max(32).optional(),
    dueDate: z.string().optional(),
    note: z.string().optional(),
    syncTransactions: z.boolean(),
  })
  .refine((d) => d.paidAmount <= d.totalAmount, {
    message: "Ödenen tutar toplamı aşamaz",
    path: ["paidAmount"],
  })
  .refine(
    (d) => {
      const needsSymbol =
        d.assetUnit === "FX" ||
        d.assetUnit === "STOCK" ||
        d.assetUnit === "CRYPTO" ||
        d.assetUnit === "COMMODITY";
      if (!needsSymbol) return true;
      return Boolean(d.assetSymbol && d.assetSymbol.trim().length > 0);
    },
    { message: "Sembol seçin", path: ["assetSymbol"] },
  );

export const editDebtSchema = newDebtSchema;

export const payDebtSchema = z.object({
  amount: z.number().positive("Pozitif tutar girin"),
});

export const debtAmountEventServerSchema = z.object({
  amount: z.number().positive("Pozitif tutar girin"),
  tryValueDelta: z.number().positive().optional(),
});

export type NewDebtFormValues = z.infer<typeof newDebtSchema>;
