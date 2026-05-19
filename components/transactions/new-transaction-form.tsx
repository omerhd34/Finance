"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailVerificationRequiredError } from "@/lib/email/email-verification-client";
import { transactionBodyFieldsSchema } from "@/lib/schemas/validations";
import {
  DEBT_EXPENSE_CATEGORY,
  EXPENSE_SUBCATEGORY_NONE,
  MANUAL_EXPENSE_CATEGORIES,
  MANUAL_INCOME_CATEGORIES,
  RECEIVABLE_INCOME_CATEGORY,
  expenseSubcategoryToFormValue,
  formValueToExpenseSubcategory,
} from "@/lib/domain/categories";
import { ExpenseCategoryPair } from "@/components/transactions/expense-category-pair";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/common/currency";
import { normalizePlanTier } from "@/lib/premium/plan-tier";
import { apiClient } from "@/lib/client/api-client";
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
import { localTodayYmd } from "@/lib/common/utils";
import { Plus, ScanLine, Trash2 } from "lucide-react";
import { VoiceToTextButton } from "@/components/ai-insights/voice-to-text-button";

function combineLineDescription(
  common: string | undefined,
  lineNote: string | undefined,
): string | undefined {
  const parts = [common?.trim(), lineNote?.trim()].filter(Boolean);
  return parts.length ? parts.join(" — ") : undefined;
}

const singleTransactionFormSchema = transactionBodyFieldsSchema
  .omit({ date: true, type: true })
  .extend({
    date: z.string().min(1, "Tarih seçin"),
    subcategory: z.string().optional(),
  });

const splitExpenseFormSchema = z.object({
  date: z.string().min(1, "Tarih seçin"),
  description: z.string().optional(),
  lines: z
    .array(
      z.object({
        amount: z.number().positive("Her satırda pozitif tutar girin"),
        category: z.string().min(1, "Kategori seçin"),
        subcategory: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .min(1, "En az bir kalem ekleyin"),
});

export type NewTransactionFormValues = z.infer<
  typeof singleTransactionFormSchema
> & {
  lines: z.infer<typeof splitExpenseFormSchema>["lines"];
};

function manualExpenseCategory(category: string): string {
  return category === DEBT_EXPENSE_CATEGORY
    ? MANUAL_EXPENSE_CATEGORIES[0]
    : category;
}

function manualIncomeCategory(category: string): string {
  return category === RECEIVABLE_INCOME_CATEGORY
    ? MANUAL_INCOME_CATEGORIES[0]
    : category;
}

type Props = {
  variant: "dialog" | "page";
  dialogOpen?: boolean;
  onSuccess: () => void | Promise<void>;
};

export function NewTransactionForm({
  variant,
  dialogOpen,
  onSuccess,
}: Props) {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const planPremium =
    normalizePlanTier(useAppSelector((s) => s.auth.user?.planTier)) ===
    "premium";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typeTab, setTypeTab] = useState<"income" | "expense">("expense");
  const [splitExpense, setSplitExpense] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const dynamicResolver = useMemo(
    () =>
      (async (values, context, options) => {
        const schema =
          splitExpense && typeTab === "expense"
            ? splitExpenseFormSchema
            : singleTransactionFormSchema;
        return zodResolver(schema)(values, context, options as never);
      }) as Resolver<NewTransactionFormValues>,
    [splitExpense, typeTab],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<NewTransactionFormValues>({
    resolver: dynamicResolver,
    defaultValues: {
      amount: 0,
      category: MANUAL_EXPENSE_CATEGORIES[0],
      subcategory: EXPENSE_SUBCATEGORY_NONE,
      description: "",
      date: localTodayYmd(),
      lines: [
        {
          amount: 0,
          category: MANUAL_EXPENSE_CATEGORIES[0],
          subcategory: EXPENSE_SUBCATEGORY_NONE,
          note: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  useEffect(() => {
    if (variant === "dialog" && dialogOpen) {
      setValue("date", localTodayYmd(), { shouldValidate: true });
    }
  }, [variant, dialogOpen, setValue]);

  const categories =
    typeTab === "expense"
      ? MANUAL_EXPENSE_CATEGORIES
      : MANUAL_INCOME_CATEGORIES;

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
        subcategory?: string | null;
        description: string | null;
        date: string;
      };
      setTypeTab(row.type);
      setValue("date", row.date, { shouldValidate: true });
      if (splitExpense && row.type === "expense") {
        setValue(
          "lines",
          [
            {
              amount: tryAmountToDisplay(row.amountTry, currency),
              category: manualExpenseCategory(row.category),
              subcategory: expenseSubcategoryToFormValue(row.subcategory),
              note: row.description ?? "",
            },
          ],
          { shouldValidate: true },
        );
        setValue("description", "", { shouldValidate: true });
      } else {
        setValue(
          "category",
          row.type === "expense"
            ? manualExpenseCategory(row.category)
            : manualIncomeCategory(row.category),
          { shouldValidate: true },
        );
        setValue(
          "subcategory",
          expenseSubcategoryToFormValue(row.subcategory),
          { shouldValidate: true },
        );
        setValue("amount", tryAmountToDisplay(row.amountTry, currency), {
          shouldValidate: true,
        });
        setValue("description", row.description ?? "", {
          shouldValidate: true,
        });
      }
    } catch {
      setOcrError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setOcrLoading(false);
    }
  }

  async function onSubmit() {
    setSubmitError(null);
    const values = getValues();
    const d = new Date(values.date + "T12:00:00");
    try {
      if (splitExpense && typeTab === "expense") {
        const items = values.lines.map((line) => ({
          type: "expense" as const,
          amount: displayAmountToTry(line.amount, currency),
          category: line.category,
          subcategory: formValueToExpenseSubcategory(line.subcategory) ?? null,
          description: combineLineDescription(values.description, line.note),
          date: d.toISOString(),
        }));
        await apiClient.post("/api/transactions/batch", { items });
      } else {
        await apiClient.post("/api/transactions", {
          type: typeTab,
          amount: displayAmountToTry(values.amount, currency),
          category: values.category,
          subcategory:
            typeTab === "expense"
              ? (formValueToExpenseSubcategory(values.subcategory) ?? null)
              : null,
          description: values.description || undefined,
          date: d.toISOString(),
        });
      }
      window.dispatchEvent(new Event("notifications:refresh"));
      reset({
        amount: 0,
        category: MANUAL_EXPENSE_CATEGORIES[0],
        subcategory: EXPENSE_SUBCATEGORY_NONE,
        description: "",
        date: localTodayYmd(),
        lines: [
          {
            amount: 0,
            category: MANUAL_EXPENSE_CATEGORIES[0],
            subcategory: EXPENSE_SUBCATEGORY_NONE,
            note: "",
          },
        ],
      });
      setSplitExpense(false);
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
          if (t === "income") setSplitExpense(false);
          setValue(
            "category",
            t === "expense"
              ? MANUAL_EXPENSE_CATEGORIES[0]
              : MANUAL_INCOME_CATEGORIES[0],
          );
          setValue("subcategory", EXPENSE_SUBCATEGORY_NONE);
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

      {typeTab === "expense" ? (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <input
            id="nt-split-expense"
            type="checkbox"
            className="mt-1 size-4 shrink-0 cursor-pointer accent-primary"
            checked={splitExpense}
            onChange={(e) => {
              const next = e.target.checked;
              if (next) {
                setValue(
                  "lines",
                  [
                    {
                      amount: getValues("amount") || 0,
                      category:
                        getValues("category") || MANUAL_EXPENSE_CATEGORIES[0],
                      subcategory:
                        getValues("subcategory") ?? EXPENSE_SUBCATEGORY_NONE,
                      note: "",
                    },
                  ],
                  { shouldValidate: true },
                );
              } else {
                const first = getValues("lines")?.[0];
                if (first) {
                  setValue("amount", first.amount);
                  setValue("category", first.category);
                  setValue(
                    "subcategory",
                    first.subcategory ?? EXPENSE_SUBCATEGORY_NONE,
                  );
                }
                clearErrors("lines");
              }
              setSplitExpense(next);
            }}
          />
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="nt-split-expense" className="cursor-pointer">
              Birden fazla kalem
            </Label>
            <p className="text-xs text-muted-foreground">
              Aynı tarihte market, fatura vb. gibi ayrı tutar ve kategorilerle
              birden fazla gider kaydı oluşturur.
            </p>
          </div>
        </div>
      ) : null}

      {splitExpense && typeTab === "expense" ? (
        <>
          <div className="space-y-3">
            <Label>Kalemler</Label>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-2 rounded-lg border border-border bg-card/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Kalem {index + 1}
                  </span>
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 cursor-pointer text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label="Satırı sil"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`nt-line-amt-${index}`}>Tutar</Label>
                  <Input
                    id={`nt-line-amt-${index}`}
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`lines.${index}.amount`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.lines?.[index]?.amount ? (
                    <p className="text-sm text-destructive">
                      {errors.lines[index]?.amount?.message}
                    </p>
                  ) : null}
                </div>
                <ExpenseCategoryPair
                  category={watch(`lines.${index}.category`)}
                  subcategory={
                    watch(`lines.${index}.subcategory`) ??
                    EXPENSE_SUBCATEGORY_NONE
                  }
                  excludedCategories={[DEBT_EXPENSE_CATEGORY]}
                  onCategoryChange={(v) =>
                    setValue(`lines.${index}.category`, v, {
                      shouldValidate: true,
                    })
                  }
                  onSubcategoryChange={(v) =>
                    setValue(`lines.${index}.subcategory`, v, {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.lines?.[index]?.category ? (
                  <p className="text-sm text-destructive">
                    {errors.lines[index]?.category?.message}
                  </p>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor={`nt-line-note-${index}`}>
                    Bu kalem notu (isteğe bağlı)
                  </Label>
                  <Input
                    id={`nt-line-note-${index}`}
                    placeholder="örn. Depo, kart ödemesi"
                    {...register(`lines.${index}.note`)}
                  />
                  {errors.lines?.[index]?.note ? (
                    <p className="text-sm text-destructive">
                      {errors.lines[index]?.note?.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                append({
                  amount: 0,
                  category: MANUAL_EXPENSE_CATEGORIES[0],
                  subcategory: EXPENSE_SUBCATEGORY_NONE,
                  note: "",
                })
              }
            >
              <Plus className="size-4" />
              Satır ekle
            </Button>
            {errors.lines &&
            typeof errors.lines === "object" &&
            "message" in errors.lines ? (
              <p className="text-sm text-destructive">
                {(errors.lines as { message?: string }).message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nt-desc-split">Ortak açıklama (isteğe bağlı)</Label>
            <div className="flex items-start gap-2">
              <Textarea
                id="nt-desc-split"
                {...register("description")}
                rows={2}
                className="min-h-[72px] flex-1"
                placeholder="Tüm satırlara eklenecek kısa not"
              />
              {planPremium ? (
                <VoiceToTextButton
                  append
                  currentText={watch("description") ?? ""}
                  onTranscript={(t) =>
                    setValue("description", t, { shouldValidate: true })
                  }
                  aria-label="Ortak açıklamayı sesle yaz"
                />
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <>
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
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {typeTab === "expense" ? (
            <ExpenseCategoryPair
              category={watch("category")}
              subcategory={watch("subcategory") ?? EXPENSE_SUBCATEGORY_NONE}
              excludedCategories={[DEBT_EXPENSE_CATEGORY]}
              onCategoryChange={(v) => setValue("category", v)}
              onSubcategoryChange={(v) => setValue("subcategory", v)}
            />
          ) : (
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
            </div>
          )}
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="nt-desc">Açıklama (isteğe bağlı)</Label>
            <div className="flex items-start gap-2">
              <Textarea
                id="nt-desc"
                {...register("description")}
                rows={3}
                className="min-h-[88px] flex-1"
              />
              {planPremium ? (
                <VoiceToTextButton
                  append
                  currentText={watch("description") ?? ""}
                  onTranscript={(t) =>
                    setValue("description", t, { shouldValidate: true })
                  }
                  aria-label="Açıklamayı sesle yaz"
                />
              ) : null}
            </div>
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>
        </>
      )}

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
        onSubmit={handleSubmit(() => void onSubmit())}
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
            onSubmit={handleSubmit(() => void onSubmit())}
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
