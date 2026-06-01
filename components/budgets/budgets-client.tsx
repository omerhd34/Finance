"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/client/api-client";
import { parseApiErrorForUser } from "@/lib/email/email-verification-client";
import { formatMoneyAmount } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/common/utils";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";
import {
  BudgetFormDialog,
  type CategoryBudgetRow,
} from "@/components/budgets/budget-form-dialog";
import {
  BudgetsFilters,
  DEFAULT_BUDGETS_FILTERS,
  type BudgetsFiltersState,
} from "@/components/budgets/budgets-filters";

export type { CategoryBudgetRow };

type Props = { currency: string };

export function BudgetsClient({ currency }: Props) {
  const { data: session } = useSession();
  const globalEmailNotificationsOn =
    session?.user?.notificationsEnabled !== false;

  const [items, setItems] = useState<CategoryBudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryBudgetRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filters, setFilters] = useState<BudgetsFiltersState>(
    DEFAULT_BUDGETS_FILTERS,
  );

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase("tr-TR");
    const filtered = items.filter((b) => {
      if (search) {
        const haystack = b.category.toLocaleLowerCase("tr-TR");
        if (!haystack.includes(search)) return false;
      }
      if (filters.status !== "all") {
        const pct =
          b.monthlyLimit > 0 ? (b.spentThisMonth / b.monthlyLimit) * 100 : 0;
        const overLimit = b.spentThisMonth >= b.monthlyLimit;
        const near =
          !overLimit &&
          pct >= b.alertThresholdPercent - 0.0001 &&
          b.monthlyLimit > 0;
        const status: "normal" | "near" | "over" = overLimit
          ? "over"
          : near
            ? "near"
            : "normal";
        if (status !== filters.status) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (filters.sort) {
        case "category-asc":
          return a.category.localeCompare(b.category, "tr-TR");
        case "usage-desc":
        case "usage-asc": {
          const ap = a.monthlyLimit > 0 ? a.spentThisMonth / a.monthlyLimit : 0;
          const bp = b.monthlyLimit > 0 ? b.spentThisMonth / b.monthlyLimit : 0;
          return filters.sort === "usage-desc" ? bp - ap : ap - bp;
        }
        case "limit-desc":
          return b.monthlyLimit - a.monthlyLimit;
        case "limit-asc":
          return a.monthlyLimit - b.monthlyLimit;
        default:
          return 0;
      }
    });
    return sorted;
  }, [items, filters.search, filters.status, filters.sort]);

  const isFiltered = items.length > 0 && filteredItems.length === 0;

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await apiClient.get<{ items: CategoryBudgetRow[] }>(
        "/api/category-budgets",
      );
      setItems(data.items);
    } catch (e: unknown) {
      setListError(parseApiErrorForUser(e, "Bütçeler yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(row: CategoryBudgetRow) {
    setEditing(row);
    setFormOpen(true);
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/api/category-budgets/${deletingId}`);
      setDeletingId(null);
      await load();
    } catch (e: unknown) {
      setListError(parseApiErrorForUser(e, "Silinemedi"));
    }
  }

  return (
    <DataLoadingShell ready={!loading}>
      <div className="space-y-6">
        <DashboardEmailVerificationBanner />
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

        {items.length > 0 && (
          <BudgetsFilters
            filters={filters}
            onFiltersChange={(patch) => setFilters((s) => ({ ...s, ...patch }))}
            onClearFilters={() => setFilters(DEFAULT_BUDGETS_FILTERS)}
          />
        )}

        {listError && (
          <p className="text-sm text-destructive" role="alert">
            {listError}
          </p>
        )}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Henüz bütçe yok. Örneğin Market harcamaları için aylık bir limit
            ekleyebilirsiniz.
          </p>
        )}
        {isFiltered && (
          <p className="text-sm text-muted-foreground">
            Filtre kriterlerine uyan bütçe bulunamadı.
          </p>
        )}

        <ul className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((b) => {
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{b.category}</p>
                    </div>
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
                      {formatMoneyAmount(b.spentThisMonth, currency)} /{" "}
                      {formatMoneyAmount(b.monthlyLimit, currency)}
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
                          ? "Genel e-posta bildirimleri kapalıdır, bu kategori için e-posta gönderilmez."
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
                    href={`/islemler?category=${encodeURIComponent(b.category)}&type=expense`}
                    className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Bu kategorideki işlemler
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <BudgetFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editing={editing}
          onSaved={load}
        />

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
              <DeleteButton onClick={() => void onConfirmDelete()} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DataLoadingShell>
  );
}
