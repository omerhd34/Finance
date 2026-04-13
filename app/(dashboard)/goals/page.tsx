/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInCalendarDays } from "date-fns";
import { displayAmountToTry, tryAmountToDisplay } from "@/lib/currency";
import { currencySymbolLabel, formatMoney, formatDateTR } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteGoal,
  fetchGoals,
  updateGoal,
  addGoal,
} from "@/store/slices/goalsSlice";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from "lucide-react";

const newGoalSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  targetAmount: z.number().positive("Pozitif olmalı"),
  deadline: z.string().optional(),
});

type NewGoalForm = z.infer<typeof newGoalSchema>;

const updateAmountSchema = z.object({
  currentAmount: z.number().min(0, "Negatif olamaz"),
});

export default function GoalsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.goals);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const newForm = useForm<NewGoalForm>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      deadline: "",
    },
  });

  const updateForm = useForm<{ currentAmount: number }>({
    resolver: zodResolver(updateAmountSchema),
    defaultValues: { currentAmount: 0 },
  });

  useEffect(() => {
    void dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    const g = items.find((x) => x.id === updatingId);
    if (g) {
      updateForm.reset({
        currentAmount: tryAmountToDisplay(g.currentAmount, currency),
      });
    }
  }, [updatingId, items, updateForm, currency]);

  function progressColor(pct: number): string {
    if (pct <= 33) return "bg-red-500";
    if (pct <= 66) return "bg-yellow-500";
    return "bg-emerald-500";
  }

  async function onCreate(values: NewGoalForm) {
    await dispatch(
      addGoal({
        title: values.title,
        targetAmount: displayAmountToTry(values.targetAmount, currency),
        deadline: values.deadline
          ? new Date(values.deadline + "T12:00:00")
          : null,
      }),
    );
    newForm.reset();
    setNewOpen(false);
    void dispatch(fetchGoals());
  }

  async function onUpdateAmount(id: string) {
    const v = updateForm.getValues();
    await dispatch(
      updateGoal({
        id,
        body: {
          currentAmount: displayAmountToTry(v.currentAmount, currency),
        },
      }),
    );
    setUpdatingId(null);
    void dispatch(fetchGoals());
  }

  async function onConfirmDelete(id: string) {
    await dispatch(deleteGoal(id));
    setDeletingId(null);
    void dispatch(fetchGoals());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hedefler</h2>
          <p className="text-sm text-muted-foreground">
            Tasarruf hedeflerinizi takip edin.
          </p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Hedef
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni hedef</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={newForm.handleSubmit(onCreate)}
              className="space-y-4"
            >
              <p className="text-xs text-muted-foreground">
                Tutarlar {currencySymbolLabel(currency)} cinsinden girilir; kayıt
                TL olarak saklanır.
              </p>
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input {...newForm.register("title")} />
                {newForm.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {newForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Hedef tutar ({currencySymbolLabel(currency)})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...newForm.register("targetAmount", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bitiş tarihi (isteğe bağlı)</Label>
                <DatePickerField
                  value={newForm.watch("deadline") ?? ""}
                  onChange={(v) => newForm.setValue("deadline", v)}
                  allowClear
                  placeholder="Tarih seçin"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Oluştur</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-destructive">{error}</p>}
      {loading && <p className="text-muted-foreground">Yükleniyor...</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((g) => {
          const pct = Math.min(
            100,
            g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
          );
          const daysLeft = g.deadline
            ? differenceInCalendarDays(g.deadline, new Date())
            : null;
          return (
            <Card key={g.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{g.title}</CardTitle>
                <CardDescription>
                  Hedef: {formatMoney(g.targetAmount, currency)} · Mevcut:{" "}
                  {formatMoney(g.currentAmount, currency)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={pct} indicatorClassName={progressColor(pct)} />
                <p className="text-xs text-muted-foreground">
                  {g.deadline
                    ? `Bitiş: ${formatDateTR(g.deadline)} · Kalan gün: ${
                        daysLeft !== null && daysLeft >= 0 ? daysLeft : 0
                      }`
                    : "Bitiş tarihi yok"}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setUpdatingId(g.id)}
                >
                  Güncelle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setDeletingId(g.id)}
                >
                  Sil
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <p className="text-center text-muted-foreground">
          Henüz hedef yok. Yeni hedef ekleyin.
        </p>
      )}

      <Dialog open={!!updatingId} onOpenChange={() => setUpdatingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mevcut tutarı güncelle</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={updateForm.handleSubmit(() =>
              updatingId ? onUpdateAmount(updatingId) : undefined,
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Mevcut tutar ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
                {...updateForm.register("currentAmount", {
                  valueAsNumber: true,
                })}
              />
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
            <DialogTitle>Hedefi sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu hedefi silmek istediğinize emin misiniz?
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
