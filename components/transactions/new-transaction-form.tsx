"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailVerificationRequiredError } from "@/lib/email-verification-client";
import { transactionCreateSchema } from "@/lib/validations";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/currency";
import { normalizePlanTier } from "@/lib/plan-tier";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { DialogFooter } from "@/components/ui/dialog";
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
import { ScanLine } from "lucide-react";

const schema = transactionCreateSchema.omit({ date: true, type: true }).extend({
  date: z.string().min(1, "Tarih seçin"),
});

export type NewTransactionFormValues = z.infer<typeof schema>;

type Props = {
  variant: "dialog" | "page";
  onSuccess: () => void | Promise<void>;
};

export function NewTransactionForm({ variant, onSuccess }: Props) {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const planPremium =
    normalizePlanTier(useAppSelector((s) => s.auth.user?.planTier)) ===
    "premium";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typeTab, setTypeTab] = useState<"income" | "expense">("expense");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewTransactionFormValues>({
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

  async function handleReceiptFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setOcrError(null);
    setOcrLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/transactions/ocr", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data: unknown = await res.json().catch(() => ({}));
      const errMsg =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Fiş okunamadı.";
      if (!res.ok) {
        setOcrError(errMsg);
        return;
      }
      if (
        typeof data !== "object" ||
        data === null ||
        !("type" in data) ||
        !("amountTry" in data) ||
        !("category" in data) ||
        !("date" in data)
      ) {
        setOcrError("Beklenmeyen yanıt alındı.");
        return;
      }
      const row = data as {
        type: "income" | "expense";
        amountTry: number;
        category: string;
        description: string | null;
        date: string;
      };
      setTypeTab(row.type);
      setValue("category", row.category, { shouldValidate: true });
      setValue("amount", tryAmountToDisplay(row.amountTry, currency), {
        shouldValidate: true,
      });
      setValue("description", row.description ?? "", { shouldValidate: true });
      setValue("date", row.date, { shouldValidate: true });
    } catch {
      setOcrError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setOcrLoading(false);
    }
  }

  async function onSubmit(values: NewTransactionFormValues) {
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
      window.dispatchEvent(new Event("notifications:refresh"));
      reset({
        amount: 0,
        category: EXPENSE_CATEGORIES[0],
        description: "",
        date: new Date().toISOString().slice(0, 10),
      });
      setTypeTab("expense");
      await onSuccess();
    } catch (e: unknown) {
      if (e instanceof EmailVerificationRequiredError) {
        setSubmitError(e.message);
        return;
      }
      setSubmitError("İşlem kaydedilemedi. Lütfen tekrar deneyin.");
    }
  }

  const ocrCard =
    planPremium && variant === "page" ? (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fiş veya fatura tarama</CardTitle>
          <CardDescription>
            Fotoğraf yükleyin; tutar, tarih ve kategoriyi formda önerir.
            Kaydetmeden önce kontrol edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(ev) => void handleReceiptFileChange(ev)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={ocrLoading}
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ScanLine className="size-4" />
            {ocrLoading ? "Okunuyor..." : "Görüntüden doldur"}
          </Button>
          {ocrError ? (
            <p className="text-sm text-destructive">{ocrError}</p>
          ) : null}
        </CardContent>
      </Card>
    ) : planPremium && variant === "dialog" ? (
      <div className="rounded-lg border border-border bg-card/40 px-3 py-3">
        <p className="text-sm font-medium">Fiş veya fatura tarama</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Fotoğraf yükleyin; tutar, tarih ve kategoriyi formda önerir.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(ev) => void handleReceiptFileChange(ev)}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={ocrLoading}
          className="mt-2 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <ScanLine className="size-4" />
          {ocrLoading ? "Okunuyor..." : "Görüntüden doldur"}
        </Button>
        {ocrError ? (
          <p className="mt-2 text-sm text-destructive">{ocrError}</p>
        ) : null}
      </div>
    ) : null;

  const formInner = (
    <>
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
            t === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
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
        <Label htmlFor="nt-amount">Tutar</Label>
        <Input
          id="nt-amount"
          type="number"
          step="0.01"
          min={0}
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
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
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nt-desc">Açıklama (isteğe bağlı)</Label>
        <Textarea id="nt-desc" {...register("description")} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nt-date">Tarih</Label>
        <DatePickerField
          id="nt-date"
          className="cursor-pointer"
          value={watch("date")}
          onChange={(v) => setValue("date", v, { shouldValidate: true })}
        />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>
    </>
  );

  if (variant === "dialog") {
    return (
      <form
        className="space-y-4"
        onSubmit={handleSubmit((v) => void onSubmit(v))}
      >
        {ocrCard}
        {formInner}
        <DialogFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </form>
    );
  }

  return (
    <>
      {ocrCard}
      <Card>
        <CardHeader>
          <CardTitle>Detaylar</CardTitle>
          <CardDescription>
            Tutarı girin; kayıt TL olarak saklanır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => void onSubmit(v))}
            className="space-y-4"
          >
            {formInner}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/islemler" className="cursor-pointer">
                  İptal
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
