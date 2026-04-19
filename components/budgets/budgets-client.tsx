"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, currencySymbolLabel } from "@/lib/utils";
import { LoadingMessage } from "@/components/ui/loading-message";

export type CategoryBudgetRow = {
  id: string;
  category: string;
  monthlyLimit: number;
  alertThresholdPercent: number;
  emailAlertsEnabled: boolean;
  spentThisMonth: number;
  monthKey: string;
};

type Props = { currency: string };

export function BudgetsClient({ currency }: Props) {
  const { data: session } = useSession();
  const globalEmailNotificationsOn =
    session?.user?.notificationsEnabled !== false;

  const [items, setItems] = useState<CategoryBudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [monthlyLimitError, setMonthlyLimitError] = useState<string | null>(
    null,
  );
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryBudgetRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [emailAlerts, setEmailAlerts] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await apiClient.get<{ items: CategoryBudgetRow[] }>(
        "/api/category-budgets",
      );
      setItems(data.items);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = e.response?.data;
        const text =
          msg &&
          typeof msg === "object" &&
          "error" in msg &&
          typeof (msg as { error?: unknown }).error === "string"
            ? (msg as { error: string }).error
            : null;
        setListError(text ?? "Bütçeler yüklenemedi");
      } else {
        setListError("Bütçeler yüklenemedi");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function clearFormErrors() {
    setMonthlyLimitError(null);
    setThresholdError(null);
    setSaveError(null);
  }

  function openCreate() {
    setEditing(null);
    setCategory(EXPENSE_CATEGORIES[0]);
    setMonthlyLimit("");
    setThreshold("80");
    setEmailAlerts(true);
    clearFormErrors();
    setFormOpen(true);
  }

  function openEdit(row: CategoryBudgetRow) {
    setEditing(row);
    setCategory(row.category);
    setMonthlyLimit(String(row.monthlyLimit));
    setThreshold(String(row.alertThresholdPercent));
    setEmailAlerts(row.emailAlertsEnabled);
    clearFormErrors();
    setFormOpen(true);
  }

  async function onSave() {
    const limit = Number(monthlyLimit.replace(",", "."));
    const th = Number(threshold.replace(",", "."));
    setMonthlyLimitError(null);
    setThresholdError(null);
    setSaveError(null);
    if (!Number.isFinite(limit) || limit <= 0) {
      setMonthlyLimitError("Geçerli bir aylık limit girin.");
      return;
    }
    if (!Number.isFinite(th) || th < 1 || th > 100) {
      setThresholdError("Uyarı eşiği %1–100 arasında olmalıdır.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiClient.put(`/api/category-budgets/${editing.id}`, {
          category,
          monthlyLimit: limit,
          alertThresholdPercent: th,
          emailAlertsEnabled: emailAlerts,
        });
      } else {
        await apiClient.post("/api/category-budgets", {
          category,
          monthlyLimit: limit,
          alertThresholdPercent: th,
          emailAlertsEnabled: emailAlerts,
        });
      }
      setFormOpen(false);
      clearFormErrors();
      await load();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const err = e.response?.data;
        const msg =
          err &&
          typeof err === "object" &&
          "error" in err &&
          typeof (err as { error?: unknown }).error === "string"
            ? (err as { error: string }).error
            : null;
        setSaveError(msg ?? "Kaydedilemedi");
      } else {
        setSaveError("Kaydedilemedi");
      }
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/api/category-budgets/${deletingId}`);
      setDeletingId(null);
      await load();
    } catch {
      setListError("Silinemedi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Harcama kategorileri için aylık limit tanımlayın; eşik ve aşım
            durumunda bildirim alırsınız.
          </p>
        </div>
        <Button
          type="button"
          className="cursor-pointer gap-2"
          onClick={() => openCreate()}
        >
          <Plus className="h-4 w-4" />
          Yeni bütçe
        </Button>
      </div>

      {listError && (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      )}
      {loading ? (
        <LoadingMessage variant="page" />
      ) : (
        <>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Henüz bütçe yok. Örneğin Market harcamaları için aylık bir limit
              ekleyebilirsiniz.
            </p>
          )}

          <ul className="grid gap-4 md:grid-cols-2">
            {items.map((b) => {
              const pct = Math.min(
                100,
                b.monthlyLimit > 0
                  ? (b.spentThisMonth / b.monthlyLimit) * 100
                  : 0,
              );
              const warnAt = b.alertThresholdPercent;
              const overLimit = b.spentThisMonth >= b.monthlyLimit;
              const near =
                !overLimit && pct >= warnAt - 0.0001 && b.monthlyLimit > 0;
              return (
                <li
                  key={b.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{b.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.monthKey} dönemi
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        title="Düzenle"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer text-destructive"
                        title="Sil"
                        onClick={() => setDeletingId(b.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harcama</span>
                      <span>
                        {formatMoney(b.spentThisMonth, currency)} /{" "}
                        {formatMoney(b.monthlyLimit, currency)}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      indicatorClassName={cn(
                        overLimit
                          ? "bg-destructive"
                          : near
                            ? "bg-amber-500"
                            : undefined,
                      )}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        Uyarı eşiği: %{Math.round(b.alertThresholdPercent)}
                      </span>
                      <span
                        title={
                          b.emailAlertsEnabled && !globalEmailNotificationsOn
                            ? "Genel e-posta bildirimleri ayarlarda kapalı; bu kategori için e-posta gönderilmez."
                            : undefined
                        }
                      >
                        E-posta:{" "}
                        {globalEmailNotificationsOn && b.emailAlertsEnabled
                          ? "Açık"
                          : "Kapalı"}
                      </span>
                    </div>
                    <Link
                      href={`/transactions?category=${encodeURIComponent(b.category)}&type=expense`}
                      className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Bu kategorideki işlemler
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) clearFormErrors();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Bütçeyi düzenle" : "Yeni kategori bütçesi"}
            </DialogTitle>
          </DialogHeader>
          {saveError && (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          )}
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="budget-cat">Kategori</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={!!editing}
              >
                <SelectTrigger id="budget-cat" className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="cursor-pointer">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editing && (
                <p className="text-xs text-muted-foreground">
                  Kategori düzenlemede değiştirmek için kaydı silip yeniden
                  oluşturun.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget-limit">
                Aylık limit ({currencySymbolLabel(currency)})
              </Label>
              <Input
                id="budget-limit"
                inputMode="decimal"
                value={monthlyLimit}
                onChange={(e) => {
                  setMonthlyLimit(e.target.value);
                  setMonthlyLimitError(null);
                  setSaveError(null);
                }}
                placeholder="5000"
                aria-invalid={monthlyLimitError ? true : undefined}
                className={cn(
                  monthlyLimitError &&
                    "border-destructive focus-visible:ring-destructive/40",
                )}
              />
              {monthlyLimitError && (
                <p className="text-sm text-destructive" role="alert">
                  {monthlyLimitError}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget-th">Uyarı eşiği (%)</Label>
              <Input
                id="budget-th"
                inputMode="numeric"
                value={threshold}
                onChange={(e) => {
                  setThreshold(e.target.value);
                  setThresholdError(null);
                  setSaveError(null);
                }}
                placeholder="80"
                aria-invalid={thresholdError ? true : undefined}
                className={cn(
                  thresholdError &&
                    "border-destructive focus-visible:ring-destructive/40",
                )}
              />
              {thresholdError && (
                <p className="text-sm text-destructive" role="alert">
                  {thresholdError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Harcama limitin bu yüzdesine ulaşınca bildirim gönderilir.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border border-input"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              E-posta ile de bildir.
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setFormOpen(false)}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              disabled={saving}
              onClick={() => void onSave()}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bütçeyi sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu kategori bütçesini silmek istediğinize emin misiniz?
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
              onClick={() => void onConfirmDelete()}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
