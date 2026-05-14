"use client";

import { useEffect, useMemo, useState } from "react";
import { displayAmountToTry } from "@/lib/common/currency";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import type { NewDebtFormValues } from "@/lib/debts/debts-schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addDebt,
  deleteDebt,
  fetchDebts,
  recordDebtPayment,
  recordDebtPrincipalIncrease,
  updateDebt,
} from "@/store/slices/debtsSlice";
import { DebtsPageHeader } from "@/components/debts/debts-page-header";
import { DebtsSummaryCards } from "@/components/debts/debts-summary-cards";
import { DebtsList } from "@/components/debts/debts-list";
import { buildDebtMaturityRows } from "@/lib/debts/debt-maturity-buckets";
import { Card } from "@/components/ui/card";
import { DashboardDebtMaturityChart } from "@/components/dashboard/dashboard-debt-maturity-chart";
import { EditDebtDialog } from "@/components/debts/edit-debt-dialog";
import { PayDebtDialog } from "@/components/debts/pay-debt-dialog";
import { AddDebtPrincipalDialog } from "@/components/debts/add-debt-principal-dialog";
import { DeleteDebtDialog } from "@/components/debts/delete-debt-dialog";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";

export default function DebtsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.debts);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [tab, setTab] = useState<"RECEIVABLE" | "PAYABLE">("RECEIVABLE");
  const [newOpen, setNewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [addingPrincipalId, setAddingPrincipalId] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDebtsReady, setInitialDebtsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await dispatch(fetchDebts()).unwrap();
      } catch {
        /* hata debts.error üzerinden */
      } finally {
        if (!cancelled) setInitialDebtsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const filtered = useMemo(
    () => items.filter((d) => d.direction === tab),
    [items, tab],
  );

  const totals = useMemo(() => {
    let recv = 0;
    let pay = 0;
    for (const d of items) {
      const r = debtRemaining(d);
      if (d.direction === "RECEIVABLE") recv += r;
      else pay += r;
    }
    return { recv, pay };
  }, [items]);

  const maturityRows = useMemo(() => buildDebtMaturityRows(items), [items]);

  async function onCreate(values: NewDebtFormValues) {
    await dispatch(
      addDebt({
        direction: values.direction,
        counterparty: values.counterparty,
        totalAmount: displayAmountToTry(values.totalAmount, currency),
        paidAmount: displayAmountToTry(values.paidAmount, currency),
        dueDate: values.dueDate ? new Date(values.dueDate + "T12:00:00") : null,
        note: values.note?.trim() ? values.note.trim() : null,
      }),
    ).unwrap();
    void dispatch(fetchDebts());
  }

  async function onEditSave(values: NewDebtFormValues) {
    if (!editingId) return;
    await dispatch(
      updateDebt({
        id: editingId,
        body: {
          direction: values.direction,
          counterparty: values.counterparty,
          totalAmount: displayAmountToTry(values.totalAmount, currency),
          paidAmount: displayAmountToTry(values.paidAmount, currency),
          dueDate: values.dueDate
            ? new Date(values.dueDate + "T12:00:00")
            : null,
          note: values.note?.trim() ? values.note.trim() : null,
        },
      }),
    );
    setEditingId(null);
    void dispatch(fetchDebts());
  }

  async function onPaySubmit(amountDisplay: number) {
    if (!payingId) return;
    const d = items.find((x) => x.id === payingId);
    if (!d) return;
    const addTry = displayAmountToTry(amountDisplay, currency);
    await dispatch(
      recordDebtPayment({
        id: payingId,
        amountTry: addTry,
      }),
    ).unwrap();
    setPayingId(null);
    void dispatch(fetchDebts());
  }

  async function onPrincipalSubmit(amountDisplay: number) {
    if (!addingPrincipalId) return;
    const addTry = displayAmountToTry(amountDisplay, currency);
    await dispatch(
      recordDebtPrincipalIncrease({
        id: addingPrincipalId,
        amountTry: addTry,
      }),
    ).unwrap();
    setAddingPrincipalId(null);
    void dispatch(fetchDebts());
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    await dispatch(deleteDebt(deletingId));
    setDeletingId(null);
    void dispatch(fetchDebts());
  }

  const editingDebt = items.find((x) => x.id === editingId);

  return (
    <DataLoadingShell ready={initialDebtsReady}>
      <div className="space-y-6">
        <DebtsPageHeader
          newOpen={newOpen}
          onNewOpenChange={setNewOpen}
          onCreate={onCreate}
        />

        <DebtsSummaryCards
          totalReceivable={totals.recv}
          totalPayable={totals.pay}
          currency={currency}
        />

        {error && <p className="text-destructive">{error}</p>}
        <DebtsList
          tab={tab}
          onTabChange={setTab}
          items={filtered}
          loading={loading}
          currency={currency}
          onPay={setPayingId}
          onAddPrincipal={setAddingPrincipalId}
          onEdit={setEditingId}
          onDelete={setDeletingId}
        />

        <Card className="overflow-hidden">
          <DashboardDebtMaturityChart
            data={maturityRows}
            currency={currency}
            chartHeight={360}
          />
        </Card>

        <AddDebtPrincipalDialog
          open={!!addingPrincipalId}
          onOpenChange={(o) => !o && setAddingPrincipalId(null)}
          onSubmit={onPrincipalSubmit}
        />

        <PayDebtDialog
          open={!!payingId}
          onOpenChange={(o) => !o && setPayingId(null)}
          onPay={onPaySubmit}
          receivableIncomeHint={
            items.find((x) => x.id === payingId)?.direction === "RECEIVABLE"
          }
          payableExpenseHint={
            items.find((x) => x.id === payingId)?.direction === "PAYABLE"
          }
        />

        <EditDebtDialog
          debt={editingDebt}
          open={!!editingId}
          onOpenChange={(o) => !o && setEditingId(null)}
          currency={currency}
          onSave={onEditSave}
        />

        <DeleteDebtDialog
          open={!!deletingId}
          onOpenChange={(o) => !o && setDeletingId(null)}
          onConfirm={() => void onConfirmDelete()}
        />
      </div>
    </DataLoadingShell>
  );
}
