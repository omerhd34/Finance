"use client";

import { useEffect, useMemo, useState } from "react";
import { displayAmountToTry } from "@/lib/currency";
import { isRecurringReminderDue } from "@/lib/recurring-reminder";
import type { RecurringFormValues } from "@/lib/recurring-schema";
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
import { RecurringPageIntro } from "@/components/recurring/recurring-page-intro";
import { RecurringRulesSection } from "@/components/recurring/recurring-rules-section";
import { RecurringToolbar } from "@/components/recurring/recurring-toolbar";

export default function RecurringPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.recurring);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [newOpen, setNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

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

  const dueReminders = useMemo(
    () => items.filter(isRecurringReminderDue),
    [items],
  );

  const editingResolved = useMemo(() => {
    if (!editingId) return null;
    return items.find((x) => x.id === editingId) ?? null;
  }, [editingId, items]);

  function buildPayload(values: RecurringFormValues) {
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

  async function onCreate(values: RecurringFormValues) {
    await dispatch(addRecurringRule(buildPayload(values)));
    void dispatch(fetchRecurringRules());
  }

  async function onEditSave(ruleId: string, values: RecurringFormValues) {
    await dispatch(
      updateRecurringRule({
        id: ruleId,
        body: buildPayload(values),
      }),
    );
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
    <div className="space-y-8">
      <RecurringPageIntro />

      <DueRemindersCard
        items={dueReminders}
        currency={currency}
        actionId={actionId}
        onFulfill={onFulfill}
        onSkip={onSkip}
      />

      <RecurringToolbar
        count={items.length}
        newOpen={newOpen}
        onNewOpenChange={setNewOpen}
        currency={currency}
        onCreate={onCreate}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <RecurringRulesSection
        items={items}
        loading={loading}
        currency={currency}
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
  );
}
