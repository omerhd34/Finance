import { z } from "zod";

export const newDebtSchema = z
  .object({
    direction: z.enum(["RECEIVABLE", "PAYABLE"]),
    counterparty: z.string().min(1, "Kişi veya başlık gerekli"),
    totalAmount: z.number().positive("Pozitif olmalı"),
    paidAmount: z.number().min(0, "Negatif olamaz"),
    dueDate: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((d) => d.paidAmount <= d.totalAmount, {
    message: "Ödenen tutar toplamı aşamaz",
    path: ["paidAmount"],
  });

export const editDebtSchema = newDebtSchema;

export const payDebtSchema = z.object({
  amount: z.number().positive("Pozitif tutar girin"),
});

export type NewDebtFormValues = z.infer<typeof newDebtSchema>;
