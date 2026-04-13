"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { endOfDay } from "date-fns";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/currency";
import { currencySymbolLabel, formatDateTR, formatMoney } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addRecurringRule,
  deleteRecurringRule,
  fetchRecurringRules,
  fulfillRecurringReminderThunk,
  processDueRecurring,
  skipRecurringReminderThunk,
  updateRecurringRule,
} from "@/store/slices/recurringSlice";
import type { RecurringRule } from "@/types/recurring";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";

const FREQUENCY_LABEL: Record<string, string> = {
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
};

const MODE_LABEL: Record<string, string> = {
  AUTO: "Otomatik kayıt",
  REMINDER: "Hatırlatıcı",
};

const formSchema = z
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

type FormValues = z.infer<typeof formSchema>;

function isReminderDue(rule: RecurringRule): boolean {
  if (!rule.isActive || rule.mode !== "REMINDER") return false;
  return new Date(rule.nextDueDate) <= endOfDay(new Date());
}

export default function RecurringPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.recurring);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [newOpen, setNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const newForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: EXPENSE_CATEGORIES[0],
      description: "",
      frequency: "MONTHLY",
      interval: 1,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      mode: "AUTO",
      isActive: true,
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: newForm.getValues(),
  });

  const typeTabNew = newForm.watch("type");
  const typeTabEdit = editForm.watch("type");

  useEffect(() => {
    void (async () => {
      try {
        await dispatch(processDueRecurring()).unwrap();
      } catch {
        /* ignore */
      }
      void dispatch(fetchRecurringRules());
    })();
  }, [dispatch]);

  useEffect(() => {
    const r = items.find((x) => x.id === editingId);
    if (r) {
      editForm.reset({
        type: r.type as "income" | "expense",
        amount: tryAmountToDisplay(r.amount, currency),
        category: r.category,
        description: r.description ?? "",
        frequency: r.frequency as FormValues["frequency"],
        interval: r.interval,
        startDate: new Date(r.startDate).toISOString().slice(0, 10),
        endDate: r.endDate
          ? new Date(r.endDate).toISOString().slice(0, 10)
          : "",
        mode: r.mode as FormValues["mode"],
        isActive: r.isActive,
      });
    }
  }, [editingId, items, editForm, currency]);

  const dueReminders = useMemo(() => items.filter(isReminderDue), [items]);

  function buildPayload(values: FormValues) {
    return {
      type: values.type,
      amount: displayAmountToTry(values.amount, currency),
      category: values.category,
      description: values.description?.trim()
        ? values.description.trim()
        : null,
      frequency: values.frequency,
      interval: values.interval,
      startDate: new Date(values.startDate + "T12:00:00").toISOString(),
      endDate: values.endDate?.trim()
        ? new Date(values.endDate.trim() + "T12:00:00").toISOString()
        : null,
      mode: values.mode,
      isActive: values.isActive,
    };
  }

  async function onCreate(values: FormValues) {
    await dispatch(addRecurringRule(buildPayload(values)));
    newForm.reset({
      type: "expense",
      amount: 0,
      category: EXPENSE_CATEGORIES[0],
      description: "",
      frequency: "MONTHLY",
      interval: 1,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      mode: "AUTO",
      isActive: true,
    });
    setNewOpen(false);
    void dispatch(fetchRecurringRules());
  }

  async function onEditSave() {
    if (!editingId) return;
    const values = editForm.getValues();
    await dispatch(
      updateRecurringRule({
        id: editingId,
        body: buildPayload(values),
      }),
    );
    setEditingId(null);
    void dispatch(fetchRecurringRules());
  }

  async function onDelete(id: string) {
    await dispatch(deleteRecurringRule(id));
    setDeletingId(null);
    void dispatch(fetchRecurringRules());
  }

  async function onFulfill(id: string) {
    setActionId(id);
    try {
      await dispatch(fulfillRecurringReminderThunk(id)).unwrap();
    } finally {
      setActionId(null);
    }
  }

  async function onSkip(id: string) {
    setActionId(id);
    try {
      await dispatch(skipRecurringReminderThunk(id)).unwrap();
    } finally {
      setActionId(null);
    }
  }

  const categoriesFor = (t: "income" | "expense") =>
    t === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Tekrarlayan işlemler</h2>
        <p className="text-sm text-muted-foreground">
          Kira, abonelik veya maaş gibi düzenli hareketleri tanımlayın. Otomatik
          modda vadesi gelince işlem kaydı oluşur; hatırlatıcı modda sizi
          uyarır, kaydı siz onaylarsınız.
        </p>
      </div>

      {dueReminders.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">
              Vadesi gelen hatırlatıcılar
            </CardTitle>
            <CardDescription>
              Aşağıdaki kalemler için işlem oluşturabilir veya bir sonraki
              tarihe erteleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueReminders.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-lg border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {r.category}
                    {r.description ? ` — ${r.description}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.type === "income" ? "Gelir" : "Gider"} ·{" "}
                    {formatMoney(r.amount, currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vade: {formatDateTR(r.nextDueDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90"
                    disabled={actionId === r.id}
                    onClick={() => void onFulfill(r.id)}
                  >
                    İşlemi oluştur
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionId === r.id}
                    onClick={() => void onSkip(r.id)}
                  >
                    Sonraki tarihe ertele
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} tekrarlayan işlem
        </p>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Tekrarlayan İşlem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tekrarlayan işlem</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={newForm.handleSubmit((v) => void onCreate(v))}
            >
              <Tabs
                value={typeTabNew}
                onValueChange={(v) => {
                  const t = v as "income" | "expense";
                  newForm.setValue("type", t);
                  newForm.setValue(
                    "category",
                    t === "expense"
                      ? EXPENSE_CATEGORIES[0]
                      : INCOME_CATEGORIES[0],
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
                  {...newForm.register("amount", { valueAsNumber: true })}
                />
                {newForm.formState.errors.amount && (
                  <p className="text-sm text-destructive">
                    {newForm.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={newForm.watch("category")}
                  onValueChange={(v) => newForm.setValue("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesFor(typeTabNew).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Açıklama (isteğe bağlı)</Label>
                <Textarea rows={2} {...newForm.register("description")} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sıklık</Label>
                  <Select
                    value={newForm.watch("frequency")}
                    onValueChange={(v) =>
                      newForm.setValue(
                        "frequency",
                        v as FormValues["frequency"],
                      )
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
                    {...newForm.register("interval", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Örn. ayda 1 için 1, iki haftada bir için 2
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>İlk / referans tarih</Label>
                <DatePickerField
                  value={newForm.watch("startDate")}
                  onChange={(v) =>
                    newForm.setValue("startDate", v, { shouldValidate: true })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Bitiş tarihi (isteğe bağlı)</Label>
                <DatePickerField
                  value={newForm.watch("endDate") ?? ""}
                  onChange={(v) => newForm.setValue("endDate", v)}
                />
                {newForm.formState.errors.endDate && (
                  <p className="text-sm text-destructive">
                    {newForm.formState.errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Çalışma şekli</Label>
                <Select
                  value={newForm.watch("mode")}
                  onValueChange={(v) =>
                    newForm.setValue("mode", v as FormValues["mode"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">
                      Otomatik — vade gelince işlem oluşur
                    </SelectItem>
                    <SelectItem value="REMINDER">
                      Hatırlatıcı — siz onaylayınca işlem oluşur
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={newForm.formState.isSubmitting}>
                  Kaydet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Henüz tekrarlayan işlem yok. Yeni işlem ekleyerek başlayın.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-medium">{r.category}</p>
                  {r.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {r.type === "income" ? "Gelir" : "Gider"} ·{" "}
                    {formatMoney(r.amount, currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sonraki: {formatDateTR(r.nextDueDate)}
                    {r.endDate && ` · Bitiş: ${formatDateTR(r.endDate)}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                  {!r.isActive && <Badge variant="secondary">Pasif</Badge>}
                  <Badge variant="outline">
                    {MODE_LABEL[r.mode] ?? r.mode}
                  </Badge>
                  <Badge variant="outline">
                    {FREQUENCY_LABEL[r.frequency] ?? r.frequency}
                    {r.interval > 1 ? ` ×${r.interval}` : ""}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Düzenle"
                    onClick={() => setEditingId(r.id)}
                    className="cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="text-destructive cursor-pointer"
                    aria-label="Sil"
                    onClick={() => setDeletingId(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editingId)} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tekrarlayan işlemi düzenle</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={editForm.handleSubmit(() => void onEditSave())}
          >
            <Tabs
              value={typeTabEdit}
              onValueChange={(v) => {
                const t = v as "income" | "expense";
                editForm.setValue("type", t);
                editForm.setValue(
                  "category",
                  t === "expense"
                    ? EXPENSE_CATEGORIES[0]
                    : INCOME_CATEGORIES[0],
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
                {...editForm.register("amount", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={editForm.watch("category")}
                onValueChange={(v) => editForm.setValue("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriesFor(typeTabEdit).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea rows={2} {...editForm.register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sıklık</Label>
                <Select
                  value={editForm.watch("frequency")}
                  onValueChange={(v) =>
                    editForm.setValue("frequency", v as FormValues["frequency"])
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
                  {...editForm.register("interval", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Başlangıç tarihi</Label>
              <DatePickerField
                value={editForm.watch("startDate")}
                onChange={(v) =>
                  editForm.setValue("startDate", v, { shouldValidate: true })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Bitiş tarihi (isteğe bağlı)</Label>
              <DatePickerField
                value={editForm.watch("endDate") ?? ""}
                onChange={(v) => editForm.setValue("endDate", v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Çalışma şekli</Label>
              <Select
                value={editForm.watch("mode")}
                onValueChange={(v) =>
                  editForm.setValue("mode", v as FormValues["mode"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Otomatik</SelectItem>
                  <SelectItem value="REMINDER">Hatırlatıcı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={editForm.watch("isActive") ? "1" : "0"}
                onValueChange={(v) => editForm.setValue("isActive", v === "1")}
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

            <DialogFooter>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingId)}
        onOpenChange={() => setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tekrarlayan işlemi silinsin mi?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu işlem geçmiş işlem kayıtlarını silmez; yalnızca tekrarlayan
            işlemi kaldırır.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeletingId(null)}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => deletingId && void onDelete(deletingId)}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
