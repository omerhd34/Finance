import { z } from "zod";

export const newGoalSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  targetAmount: z.number().positive("Pozitif olmalı"),
  deadline: z.string().optional(),
});

export const updateGoalAmountSchema = z.object({
  currentAmount: z.number().min(0, "Negatif olamaz"),
});

export type NewGoalFormValues = z.infer<typeof newGoalSchema>;
