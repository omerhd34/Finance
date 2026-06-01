"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/client/api-client";
import { parseApiErrorForUser } from "@/lib/email/email-verification-client";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_TREE,
  expenseCategorySelectGroupLabelClassName,
} from "@/lib/domain/categories";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/common/utils";

export type CategoryBudgetRow = {
  id: string;
  category: string;
  monthlyLimit: number;
  alertThresholdPercent: number;
  emailAlertsEnabled: boolean;
  spentThisMonth: number;
  monthKey: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CategoryBudgetRow | null;
  onSaved: () => void | Promise<void>;
};

export function BudgetFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: Props) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [monthlyLimitError, setMonthlyLimitError] = useState<string | null>(
    null,
  );
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMonthlyLimitError(null);
    setThresholdError(null);
    setSaveError(null);
    if (editing) {
      setCategory(editing.category);
      setMonthlyLimit(String(editing.monthlyLimit));
      setThreshold(String(editing.alertThresholdPercent));
      setEmailAlerts(editing.emailAlertsEnabled);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
      setMonthlyLimit("");
      setThreshold("80");
      setEmailAlerts(true);
    }
  }, [open, editing]);

  function clearFormErrors() {
    setMonthlyLimitError(null);
    setThresholdError(null);
    setSaveError(null);
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
      clearFormErrors();
      onOpenChange(false);
      await onSaved();
    } catch (e: unknown) {
      setSaveError(parseApiErrorForUser(e, "Kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) clearFormErrors();
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
                {EXPENSE_CATEGORY_TREE.map((g, i) => (
                  <SelectGroup key={g.group}>
                    <SelectLabel
                      className={expenseCategorySelectGroupLabelClassName(i)}
                    >
                      {g.group}
                    </SelectLabel>
                    {g.categories.map((row) => (
                      <SelectItem
                        key={row.category}
                        value={row.category}
                        className="cursor-pointer"
                      >
                        {row.category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
            <Label htmlFor="budget-limit">Aylık limit</Label>
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
            onClick={() => onOpenChange(false)}
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
  );
}
