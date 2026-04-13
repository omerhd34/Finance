import { z } from "zod";

export const recurringRuleFormSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z.number().positive("Pozitif tutar girin"),
    category: z.string().min(1, "Kategori seçin"),
    description: z.string().optional(),
    frequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.number().int().min(1).max(52),
    startDate: z.string().min(1, "Başlangıç seçin"),
    endDate: z.string().optional(),
    mode: z.enum(["AUTO", "REMINDER"]),
    isActive: z.boolean(),
  })
  .refine(
    (d) =>
      !d.endDate?.trim() || d.startDate.trim() <= (d.endDate as string).trim(),
    { message: "Bitiş, başlangıçtan önce olamaz", path: ["endDate"] },
  );

export type RecurringFormValues = z.infer<typeof recurringRuleFormSchema>;
