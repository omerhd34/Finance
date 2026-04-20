/* eslint-disable react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailVerificationRequiredError } from "@/lib/email-verification-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { transactionCreateSchema } from "@/lib/validations";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { displayAmountToTry } from "@/lib/currency";
import { currencySymbolLabel } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = transactionCreateSchema.omit({ date: true, type: true }).extend({
  date: z.string().min(1, "Tarih seçin"),
});

type FormValues = z.infer<typeof schema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [typeTab, setTypeTab] = useState<"income" | "expense">("expense");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
    setSubmitError(null);
    const d = new Date(values.date + "T12:00:00");
    try {
      await apiClient.post("/api/transactions", {
        type: typeTab,
        amount: displayAmountToTry(values.amount, currency),
        category: values.category,
        description: values.description || undefined,
        date: d.toISOString(),
      });
      router.push("/islemler");
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof EmailVerificationRequiredError) {
        setSubmitError(e.message);
        return;
      }
      setSubmitError("İşlem kaydedilemedi. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2">
          <Link href="/islemler">
            <ArrowLeft />
            İşlemlere dön
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Yeni işlem</h2>
        <p className="text-sm text-muted-foreground">
          Gelir veya gider kaydı oluşturun.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaylar</CardTitle>
          <CardDescription>
            Tutarı seçtiğiniz para biriminde girin; kayıt TL olarak saklanır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
                <p>{submitError}</p>
                <p className="mt-2">
                  <Link
                    href="/profil"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Profil sayfasına git
                  </Link>
                </p>
              </div>
            ) : null}
            <Tabs
              value={typeTab}
              onValueChange={(v) => {
                const t = v as "income" | "expense";
                setTypeTab(t);
                setValue(
                  "category",
                  t === "expense"
                    ? EXPENSE_CATEGORIES[0]
                    : INCOME_CATEGORIES[0],
                );
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense" className="cursor-pointer">
                  Gider
                </TabsTrigger>
                <TabsTrigger value="income" className="cursor-pointer">
                  Gelir
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Tutar ({currencySymbolLabel(currency)})
              </Label>
              <Input
                id="amount"
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
                <SelectTrigger className="cursor-pointer">
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
              <Label htmlFor="desc">Açıklama (isteğe bağlı)</Label>
              <Textarea id="desc" {...register("description")} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tarih</Label>
              <DatePickerField
                id="date"
                className="cursor-pointer"
                value={watch("date")}
                onChange={(v) => setValue("date", v, { shouldValidate: true })}
              />
              {errors.date && (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="cursor-pointer"
              >
                <Link href="/islemler">İptal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
