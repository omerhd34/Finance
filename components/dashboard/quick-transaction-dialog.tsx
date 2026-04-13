/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { transactionCreateSchema } from "@/lib/validations";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { displayAmountToTry } from "@/lib/currency";
import { currencySymbolLabel } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import { Plus } from "lucide-react";

const quickSchema = transactionCreateSchema
  .omit({ date: true, type: true })
  .extend({
    date: z.string().min(1, "Tarih seçin"),
  });

type FormValues = z.infer<typeof quickSchema>;

export function QuickTransactionDialog({ onSaved }: { onSaved: () => void }) {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [open, setOpen] = useState(false);
  const [typeTab, setTypeTab] = useState<"income" | "expense">("expense");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      amount: 0,
      category: EXPENSE_CATEGORIES[0],
      description: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const categories =
    typeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function onSubmit(values: FormValues) {
    const d = new Date(values.date + "T12:00:00");
    await apiClient.post("/api/transactions", {
      type: typeTab,
      amount: displayAmountToTry(values.amount, currency),
      category: values.category,
      description: values.description || undefined,
      date: d.toISOString(),
    });
    reset({
      amount: 0,
      category:
        typeTab === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
      description: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4" />
          Hızlı İşlem Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hızlı işlem</DialogTitle>
          <DialogDescription>
            Gelir veya gider kaydı oluşturun.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs
            value={typeTab}
            onValueChange={(v) => {
              const t = v as "income" | "expense";
              setTypeTab(t);
              setValue(
                "category",
                t === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
              );
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Gider</TabsTrigger>
              <TabsTrigger value="income">Gelir</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Tutar ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={watch("category")}
              onValueChange={(v) => setValue("category", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qt-desc">Açıklama (isteğe bağlı)</Label>
            <Textarea id="qt-desc" {...register("description")} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qt-date">Tarih</Label>
            <DatePickerField
              id="qt-date"
              value={watch("date")}
              onChange={(v) => setValue("date", v, { shouldValidate: true })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
