"use client";

import { useEffect, useMemo, useState } from "react";
import { formatExpenseCategoryLabel } from "@/lib/domain/categories";
import { buildRecurringRulePayload } from "@/lib/recurring/recurring-payload";
import { isRecurringReminderDue } from "@/lib/recurring/recurring-reminder";
import type { RecurringFormValues } from "@/lib/recurring/recurring-schema";
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
import { DeleteRecurringDialog } from "@/components/recurring/delete-recurring-dialog";
import { DueRemindersCard } from "@/components/recurring/due-reminders-card";
import { EditRecurringDialog } from "@/components/recurring/edit-recurring-dialog";
import {
  DEFAULT_RECURRING_FILTERS,
  RecurringFilters,
  type RecurringFiltersState,
} from "@/components/recurring/recurring-filters";
import { RecurringRulesSection } from "@/components/recurring/recurring-rules-section";
import { RecurringToolbar } from "@/components/recurring/recurring-toolbar";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";

export default function RecurringPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.recurring);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [newOpen, setNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [initialListReady, setInitialListReady] = useState(false);
  const [filters, setFilters] = useState<RecurringFiltersState>(
    DEFAULT_RECURRING_FILTERS,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await dispatch(processDueRecurring()).unwrap();
      } catch {
        /* ignore */
      }
      try {
        await dispatch(fetchRecurringRules()).unwrap();
      } catch {
        /* hata recurring.error üzerinden */
      } finally {
        if (!cancelled) setInitialListReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const dueReminders = useMemo(
    () => items.filter(isRecurringReminderDue),
    [items],
  );

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase("tr-TR");
    return items.filter((r) => {
      if (filters.mode !== "all" && r.mode !== filters.mode) return false;
      if (filters.frequency !== "all" && r.frequency !== filters.frequency)
        return false;
      if (filters.type !== "all" && r.type !== filters.type) return false;
      if (search) {
        const haystack = [
          r.description ?? "",
          formatExpenseCategoryLabel(r.category, r.subcategory),
        ]
          .join(" ")
          .toLocaleLowerCase("tr-TR");
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [items, filters.search, filters.mode, filters.frequency, filters.type]);

  const editingResolved = useMemo(() => {
    if (!editingId) return null;
    return items.find((x) => x.id === editingId) ?? null;
  }, [editingId, items]);

  async function onCreate(
    values: RecurringFormValues,
    amountEntryCurrency: string,
  ) {
    await dispatch(
      addRecurringRule(buildRecurringRulePayload(values, amountEntryCurrency)),
    ).unwrap();
    void dispatch(fetchRecurringRules());
  }

  async function onEditSave(
    ruleId: string,
    values: RecurringFormValues,
    amountEntryCurrency: string,
  ) {
    await dispatch(
      updateRecurringRule({
        id: ruleId,
        body: buildRecurringRulePayload(values, amountEntryCurrency),
      }),
    ).unwrap();
    try {
      await dispatch(processDueRecurring()).unwrap();
    } catch {
      /* process-due isteğe bağlı */
    }
    setEditingId(null);
    void dispatch(fetchRecurringRules());
  }

  async function onDelete() {
    if (!deletingId) return;
    await dispatch(deleteRecurringRule(deletingId));
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

  return (
    <DataLoadingShell ready={initialListReady}>
      <div className="space-y-8">
        <DashboardEmailVerificationBanner />
        <p className="text-sm text-muted-foreground">
          Kira, abonelik ve maaş gibi düzenli ödemeleri bir kez tanımlayarak
          kolayca takip edin. Otomatik modda vade günü geldiğinde işlem kaydı
          sistem tarafından oluşturulur; hatırlatıcı modda ise bildirim alır ve
          kaydı siz onaylayarak eklersiniz. Tutarı sonradan güncellerseniz,
          geçmişte oluşmuş kayıtlar değişmez; yeni tutar yalnızca sonraki
          dönemlerde geçerli olur.
        </p>

        <DueRemindersCard
          items={dueReminders}
          currency={currency}
          actionId={actionId}
          onFulfill={onFulfill}
          onSkip={onSkip}
        />

        <RecurringToolbar
          count={filteredItems.length}
          totalCount={items.length}
          newOpen={newOpen}
          onNewOpenChange={setNewOpen}
          onCreate={onCreate}
        />

        <RecurringFilters
          filters={filters}
          onFiltersChange={(patch) => setFilters((s) => ({ ...s, ...patch }))}
          onClearFilters={() => setFilters(DEFAULT_RECURRING_FILTERS)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <RecurringRulesSection
          items={filteredItems}
          loading={loading}
          currency={currency}
          filtered={items.length > 0 && filteredItems.length === 0}
          onEdit={setEditingId}
          onDelete={setDeletingId}
        />

        <EditRecurringDialog
          rule={editingResolved}
          open={Boolean(editingId)}
          onOpenChange={(o) => !o && setEditingId(null)}
          currency={currency}
          onSave={onEditSave}
        />

        <DeleteRecurringDialog
          open={Boolean(deletingId)}
          onOpenChange={(o) => !o && setDeletingId(null)}
          onConfirm={() => void onDelete()}
        />
      </div>
    </DataLoadingShell>
  );
}
