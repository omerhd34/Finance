import { z } from "zod";
import { GOLD_SUBTYPE_VALUES } from "@/lib/gold-subtypes";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const transactionCreateSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Tutar pozitif olmalı"),
  category: z.string().min(1, "Kategori seçin"),
  description: z.string().optional(),
  date: z.coerce.date(),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

const recurringFieldsObject = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Tutar pozitif olmalı"),
  category: z.string().min(1, "Kategori seçin"),
  description: z.string().optional().nullable(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.number().int().min(1).max(52),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  mode: z.enum(["AUTO", "REMINDER"]),
  isActive: z.boolean().optional(),
});

export const recurringCreateSchema = recurringFieldsObject
  .extend({
    isActive: z.boolean().optional().default(true),
  })
  .refine((d) => !d.endDate || d.startDate <= d.endDate, {
    message: "Bitiş tarihi başlangıçtan önce olamaz",
    path: ["endDate"],
  });

export const recurringUpdateSchema = recurringFieldsObject
  .partial()
  .extend({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .refine(
    (d) =>
      d.startDate === undefined ||
      d.endDate === undefined ||
      d.endDate === null ||
      d.startDate <= d.endDate,
    {
      message: "Bitiş tarihi başlangıçtan önce olamaz",
      path: ["endDate"],
    },
  );

export const goalCreateSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  targetAmount: z.number().positive("Hedef tutar pozitif olmalı"),
  deadline: z.coerce.date().optional().nullable(),
});

export const goalUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  deadline: z.coerce.date().optional().nullable(),
});

export const debtCreateSchema = z
  .object({
    direction: z.enum(["RECEIVABLE", "PAYABLE"]),
    counterparty: z.string().min(1, "Kişi veya başlık gerekli"),
    totalAmount: z.number().positive("Toplam tutar pozitif olmalı"),
    paidAmount: z.number().min(0).optional().default(0),
    dueDate: z.coerce.date().optional().nullable(),
    note: z.string().optional().nullable(),
  })
  .refine((d) => d.paidAmount <= d.totalAmount, {
    message: "Ödenen tutar toplamı aşamaz",
    path: ["paidAmount"],
  });

export const debtUpdateSchema = z
  .object({
    direction: z.enum(["RECEIVABLE", "PAYABLE"]).optional(),
    counterparty: z.string().min(1).optional(),
    totalAmount: z.number().positive().optional(),
    paidAmount: z.number().min(0).optional(),
    dueDate: z.coerce.date().optional().nullable(),
    note: z.string().optional().nullable(),
  })
  .partial();

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Ad ve soyad gerekli").optional(),
  phone: z.string().max(48, "En fazla 48 karakter").optional(),
  currency: z.enum(["TL", "USD", "EUR", "GBP"]).optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gerekli"),
    newPassword: z.string().min(8, "Yeni şifre en az 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Yeni şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const accountDeleteSchema = z.object({
  confirm: z.string().refine((val) => val === "SİL", {
    message: 'Onay için tam olarak "SİL" yazın',
  }),
});

export const investmentCreateSchema = z
  .object({
    assetType: z.enum(["GOLD", "STOCK"]),
    goldSubtype: z
      .enum(GOLD_SUBTYPE_VALUES as unknown as [string, ...string[]])
      .optional()
      .nullable(),
    title: z.string().optional(),
    ticker: z.string().optional().nullable(),
    quantity: z.number().positive("Miktar pozitif olmalı"),
    avgCostPerUnitTry: z.number().positive("Alış fiyatı pozitif olmalı"),
    marketPricePerUnitTry: z.number().positive().optional().nullable(),
    note: z.string().optional().nullable(),
  })
  .refine(
    (d) =>
      d.assetType !== "STOCK" ||
      (typeof d.ticker === "string" && d.ticker.trim().length >= 1),
    { message: "Hisse için kod gerekli", path: ["ticker"] },
  )
  .refine(
    (d) =>
      d.assetType !== "GOLD" ||
      (d.goldSubtype != null &&
        (GOLD_SUBTYPE_VALUES as readonly string[]).includes(d.goldSubtype)),
    { message: "Altın türü seçin", path: ["goldSubtype"] },
  )
  .refine(
    (d) =>
      d.assetType !== "STOCK" ||
      (typeof d.title === "string" && d.title.trim().length >= 1),
    { message: "Başlık gerekli", path: ["title"] },
  );

export const investmentUpdateSchema = z
  .object({
    assetType: z.enum(["GOLD", "STOCK"]).optional(),
    goldSubtype: z
      .enum(GOLD_SUBTYPE_VALUES as unknown as [string, ...string[]])
      .optional()
      .nullable(),
    title: z.string().min(1).optional(),
    ticker: z.string().optional().nullable(),
    quantity: z.number().positive().optional(),
    avgCostPerUnitTry: z.number().positive().optional(),
    marketPricePerUnitTry: z.number().positive().optional().nullable(),
    note: z.string().optional().nullable(),
  })
  .partial();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type RecurringCreateInput = z.infer<typeof recurringCreateSchema>;
export type GoalCreateInput = z.infer<typeof goalCreateSchema>;
