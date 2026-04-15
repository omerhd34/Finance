"use client";

import type { UseFormReturn } from "react-hook-form";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import type { RecurringFormValues } from "@/lib/recurring-schema";
import { currencySymbolLabel } from "@/lib/utils";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function categoriesFor(t: "income" | "expense") {
  return t === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

type Props = {
  form: UseFormReturn<RecurringFormValues>;
  currency: string;
  variant: "new" | "edit";
};

export function RecurringFormFields({ form, currency, variant }: Props) {
  const typeTab = form.watch("type");

  return (
    <>
      <Tabs
        value={typeTab}
        onValueChange={(v) => {
          const t = v as "income" | "expense";
          form.setValue("type", t);
          form.setValue(
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Tutar ({currencySymbolLabel(currency)})</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            {...form.register("amount", { valueAsNumber: true })}
          />
          {variant === "new" && form.formState.errors.amount && (
            <p className="text-sm text-destructive">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            {variant === "new" ? "İlk / referans tarih" : "Başlangıç tarihi"}
          </Label>
          <DatePickerField
            className="cursor-pointer"
            value={form.watch("startDate")}
            onChange={(v) =>
              form.setValue("startDate", v, { shouldValidate: true })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Bitiş tarihi (isteğe bağlı)</Label>
          <DatePickerField
            className="cursor-pointer"
            value={form.watch("endDate") ?? ""}
            onChange={(v) => form.setValue("endDate", v)}
          />
          {variant === "new" && form.formState.errors.endDate && (
            <p className="text-sm text-destructive">
              {form.formState.errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select
          value={form.watch("category")}
          onValueChange={(v) => form.setValue("category", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoriesFor(typeTab).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          {variant === "new" ? "Açıklama (isteğe bağlı)" : "Açıklama"}
        </Label>
        <Textarea rows={2} {...form.register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Sıklık</Label>
          <Select
            value={form.watch("frequency")}
            onValueChange={(v) =>
              form.setValue("frequency", v as RecurringFormValues["frequency"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEEKLY">Haftalık</SelectItem>
              <SelectItem value="MONTHLY">Aylık</SelectItem>
              <SelectItem value="YEARLY">Yıllık</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Her</Label>
          <Input
            type="number"
            min={1}
            max={52}
            {...form.register("interval", { valueAsNumber: true })}
          />
          {variant === "new" && (
            <p className="text-xs text-muted-foreground">
              Örn. ayda 1 için 1, iki haftada bir için 2
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Çalışma şekli</Label>
        <Select
          value={form.watch("mode")}
          onValueChange={(v) =>
            form.setValue("mode", v as RecurringFormValues["mode"])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {variant === "new" ? (
              <>
                <SelectItem value="AUTO">
                  Otomatik — vade gelince işlem oluşur
                </SelectItem>
                <SelectItem value="REMINDER">
                  Hatırlatıcı — siz onaylayınca işlem oluşur
                </SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="AUTO">Otomatik</SelectItem>
                <SelectItem value="REMINDER">Hatırlatıcı</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {variant === "edit" && (
        <div className="space-y-2">
          <Label>Durum</Label>
          <Select
            value={form.watch("isActive") ? "1" : "0"}
            onValueChange={(v) => form.setValue("isActive", v === "1")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Aktif</SelectItem>
              <SelectItem value="0">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
