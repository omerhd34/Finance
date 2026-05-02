import { z } from "zod";
import { refineIncomeExpenseSubcategory } from "@/lib/domain/categories";

export const recurringRuleFormSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z.number().positive("Pozitif tutar girin"),
    category: z.string().min(1, "Kategori seçin"),
    subcategory: z.string().optional(),
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
  )
  .superRefine((data, ctx) =>
    refineIncomeExpenseSubcategory(
      {
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
      },
      ctx,
      "subcategory",
    ),
  );

export type RecurringFormValues = z.infer<typeof recurringRuleFormSchema>;
