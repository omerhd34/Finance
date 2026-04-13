/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInCalendarDays } from "date-fns";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/currency";
import { currencySymbolLabel, formatMoney, formatDateTR } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addDebt,
  deleteDebt,
  fetchDebts,
  updateDebt,
} from "@/store/slices/debtsSlice";
import type { Debt } from "@/types/debt";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const newDebtSchema = z
  .object({
    direction: z.enum(["RECEIVABLE", "PAYABLE"]),
    counterparty: z.string().min(1, "Kişi veya başlık gerekli"),
    totalAmount: z.number().positive("Pozitif olmalı"),
    paidAmount: z.number().min(0, "Negatif olamaz"),
    dueDate: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((d) => d.paidAmount <= d.totalAmount, {
    message: "Ödenen tutar toplamı aşamaz",
    path: ["paidAmount"],
  });

type NewDebtForm = z.infer<typeof newDebtSchema>;

const editDebtSchema = newDebtSchema;

const paySchema = z.object({
  amount: z.number().positive("Pozitif tutar girin"),
});

function remaining(d: Debt): number {
  return Math.max(0, d.totalAmount - d.paidAmount);
}

export default function DebtsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.debts);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [tab, setTab] = useState<"RECEIVABLE" | "PAYABLE">("RECEIVABLE");
  const [newOpen, setNewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const newForm = useForm<NewDebtForm>({
    resolver: zodResolver(newDebtSchema),
    defaultValues: {
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      dueDate: "",
      note: "",
    },
  });

  const editForm = useForm<NewDebtForm>({
    resolver: zodResolver(editDebtSchema),
    defaultValues: {
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      dueDate: "",
      note: "",
    },
  });

  const payForm = useForm<{ amount: number }>({
    resolver: zodResolver(paySchema),
    defaultValues: { amount: 0 },
  });

  useEffect(() => {
    void dispatch(fetchDebts());
  }, [dispatch]);

  const filtered = useMemo(
    () => items.filter((d) => d.direction === tab),
    [items, tab],
  );

  const totals = useMemo(() => {
    let recv = 0;
    let pay = 0;
    for (const d of items) {
      const r = remaining(d);
      if (d.direction === "RECEIVABLE") recv += r;
      else pay += r;
    }
    return { recv, pay };
  }, [items]);

  useEffect(() => {
    const d = items.find((x) => x.id === editingId);
    if (d) {
      editForm.reset({
        direction: d.direction,
        counterparty: d.counterparty,
        totalAmount: tryAmountToDisplay(d.totalAmount, currency),
        paidAmount: tryAmountToDisplay(d.paidAmount, currency),
        dueDate: d.dueDate
          ? new Date(d.dueDate).toISOString().slice(0, 10)
          : "",
        note: d.note ?? "",
      });
    }
  }, [editingId, items, editForm, currency]);

  async function onCreate(values: NewDebtForm) {
    await dispatch(
      addDebt({
        direction: values.direction,
        counterparty: values.counterparty,
        totalAmount: displayAmountToTry(values.totalAmount, currency),
        paidAmount: displayAmountToTry(values.paidAmount, currency),
        dueDate: values.dueDate ? new Date(values.dueDate + "T12:00:00") : null,
        note: values.note?.trim() ? values.note.trim() : null,
      }),
    );
    newForm.reset({
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      dueDate: "",
      note: "",
    });
    setNewOpen(false);
    void dispatch(fetchDebts());
  }

  async function onEditSave() {
    if (!editingId) return;
    const v = editForm.getValues();
    await dispatch(
      updateDebt({
        id: editingId,
        body: {
          direction: v.direction,
          counterparty: v.counterparty,
          totalAmount: displayAmountToTry(v.totalAmount, currency),
          paidAmount: displayAmountToTry(v.paidAmount, currency),
          dueDate: v.dueDate ? new Date(v.dueDate + "T12:00:00") : null,
          note: v.note?.trim() ? v.note.trim() : null,
        },
      }),
    );
    setEditingId(null);
    void dispatch(fetchDebts());
  }

  async function onPaySubmit() {
    if (!payingId) return;
    const d = items.find((x) => x.id === payingId);
    if (!d) return;
    const addTry = displayAmountToTry(payForm.getValues().amount, currency);
    const nextPaid = Math.min(d.totalAmount, d.paidAmount + addTry);
    await dispatch(
      updateDebt({
        id: payingId,
        body: { paidAmount: nextPaid },
      }),
    );
    payForm.reset({ amount: 0 });
    setPayingId(null);
    void dispatch(fetchDebts());
  }

  async function onConfirmDelete(id: string) {
    await dispatch(deleteDebt(id));
    setDeletingId(null);
    void dispatch(fetchDebts());
  }

  function progressPct(d: Debt): number {
    if (d.totalAmount <= 0) return 0;
    return Math.min(100, (d.paidAmount / d.totalAmount) * 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Borç &amp; Alacak</h2>
          <p className="text-sm text-muted-foreground">
            Sana borçlu olanları ve senin borçlarını tek yerden takip et.
          </p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Yeni kayıt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni borç / alacak</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={newForm.handleSubmit(onCreate)}
              className="space-y-4"
            >
              <p className="text-xs text-muted-foreground">
                Tutarlar {currencySymbolLabel(currency)} cinsinden; kayıt TL
                olarak saklanır.
              </p>
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select
                  value={newForm.watch("direction")}
                  onValueChange={(v: "RECEIVABLE" | "PAYABLE") =>
                    newForm.setValue("direction", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVABLE">
                      Bana borçlu (alacak)
                    </SelectItem>
                    <SelectItem value="PAYABLE">Benim borcum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kişi / başlık</Label>
                <Input {...newForm.register("counterparty")} />
                {newForm.formState.errors.counterparty && (
                  <p className="text-sm text-destructive">
                    {newForm.formState.errors.counterparty.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Toplam tutar ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...newForm.register("totalAmount", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Şu ana kadar ödenen ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...newForm.register("paidAmount", { valueAsNumber: true })}
                />
                {newForm.formState.errors.paidAmount && (
                  <p className="text-sm text-destructive">
                    {newForm.formState.errors.paidAmount.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Vade (isteğe bağlı)</Label>
                <DatePickerField
                  value={newForm.watch("dueDate") ?? ""}
                  onChange={(v) => newForm.setValue("dueDate", v)}
                  allowClear
                  placeholder="Tarih seçin"
                />
              </div>
              <div className="space-y-2">
                <Label>Not</Label>
                <Textarea rows={3} {...newForm.register("note")} />
              </div>
              <DialogFooter>
                <Button type="submit">Kaydet</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam alacak (kalan)</CardDescription>
            <CardTitle className="text-2xl text-emerald-500">
              {formatMoney(totals.recv, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam borç (kalan)</CardDescription>
            <CardTitle className="text-2xl text-amber-500">
              {formatMoney(totals.pay, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {error && <p className="text-destructive">{error}</p>}
      {loading && <p className="text-muted-foreground">Yükleniyor...</p>}

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "RECEIVABLE" | "PAYABLE")}
      >
        <TabsList>
          <TabsTrigger value="RECEIVABLE">Bana borçlular</TabsTrigger>
          <TabsTrigger value="PAYABLE">Benim borçlarım</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => {
              const rem = remaining(d);
              const settled = rem <= 0;
              const daysLeft = d.dueDate
                ? differenceInCalendarDays(new Date(d.dueDate), new Date())
                : null;
              return (
                <Card key={d.id} className={settled ? "opacity-75" : undefined}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 pr-2">
                        {d.counterparty}
                      </CardTitle>
                      {settled && (
                        <Badge variant="secondary" className="shrink-0">
                          Kapandı
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Kalan: {formatMoney(rem, currency)} · Toplam:{" "}
                      {formatMoney(d.totalAmount, currency)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={progressPct(d)} />
                    <p className="text-xs text-muted-foreground">
                      Ödenen: {formatMoney(d.paidAmount, currency)}
                      {d.dueDate
                        ? ` · Vade: ${formatDateTR(d.dueDate)}${
                            !settled && daysLeft !== null
                              ? ` · ${daysLeft >= 0 ? `${daysLeft} gün kaldı` : `${Math.abs(daysLeft)} gün geçti`}`
                              : ""
                          }`
                        : ""}
                    </p>
                    {d.note ? (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {d.note}
                      </p>
                    ) : null}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={settled}
                      onClick={() => {
                        setPayingId(d.id);
                        payForm.reset({ amount: 0 });
                      }}
                    >
                      Ödeme ekle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(d.id)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeletingId(d.id)}
                    >
                      Sil
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              Bu listede henüz kayıt yok.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!payingId} onOpenChange={() => setPayingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme ekle</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={payForm.handleSubmit(onPaySubmit)}
            className="space-y-4"
          >
            <p className="text-xs text-muted-foreground">
              Tutar {currencySymbolLabel(currency)} cinsinden; kalan tutarı
              aşmayacak şekilde uygulanır.
            </p>
            <div className="space-y-2">
              <Label>Tutar ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
                {...payForm.register("amount", { valueAsNumber: true })}
              />
              {payForm.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {payForm.formState.errors.amount.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">Uygula</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kaydı düzenle</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onEditSave)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Tür</Label>
              <Select
                value={editForm.watch("direction")}
                onValueChange={(v: "RECEIVABLE" | "PAYABLE") =>
                  editForm.setValue("direction", v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEIVABLE">
                    Bana borçlu (alacak)
                  </SelectItem>
                  <SelectItem value="PAYABLE">Benim borcum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kişi / başlık</Label>
              <Input {...editForm.register("counterparty")} />
            </div>
            <div className="space-y-2">
              <Label>Toplam tutar ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
                {...editForm.register("totalAmount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ödenen ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
                {...editForm.register("paidAmount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vade</Label>
              <DatePickerField
                value={editForm.watch("dueDate") ?? ""}
                onChange={(v) => editForm.setValue("dueDate", v)}
                allowClear
                placeholder="Tarih seçin"
              />
            </div>
            <div className="space-y-2">
              <Label>Not</Label>
              <Textarea rows={3} {...editForm.register("note")} />
            </div>
            <DialogFooter>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaydı sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu kaydı silmek istediğinize emin misiniz?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && onConfirmDelete(deletingId)}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
