"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  displayAmountToTry,
  FALLBACK_TL_PER_FOREIGN_UNIT,
} from "@/lib/common/currency";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import {
  convertDebtAssetToTry,
  debtAssetUnitLabel,
  isTryAssetUnit,
  normalizeDebtAssetUnit,
  type DebtAssetTryRates,
} from "@/lib/debts/debt-asset-units";
import { useCommodityLiveQuotes } from "@/hooks/use-commodity-live-quotes";
import { useCryptoLiveQuotes } from "@/hooks/use-crypto-live-quotes";
import { useCurrencySymbols } from "@/hooks/use-currency-symbols";
import { useFxLiveQuotes } from "@/hooks/use-fx-live-quotes";
import { useGoldLivePrices } from "@/hooks/use-gold-live-prices";
import { useSilverLivePrices } from "@/hooks/use-silver-live-prices";
import { useStockLiveQuotes } from "@/hooks/use-stock-live-quotes";
import { apiClient } from "@/lib/client/api-client";
import type { NewDebtFormValues } from "@/lib/debts/debts-schema";
import { getBillingPeriodForDate } from "@/lib/common/billing-period";
import { formatPeriodRangeLabel } from "@/lib/dashboard/dashboard-stats";
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
import {
  DebtsSummaryCards,
  type DebtTotalsByUnit,
} from "@/components/debts/debts-summary-cards";
import { DebtsPeriodSummaryCards } from "@/components/debts/debts-period-summary-cards";
import { DebtsList } from "@/components/debts/debts-list";
import { buildDebtMaturityRows } from "@/lib/debts/debt-maturity-buckets";
import { Card } from "@/components/ui/card";
import { DashboardDebtMaturityChart } from "@/components/dashboard/dashboard-debt-maturity-chart";
import { EditDebtDialog } from "@/components/debts/edit-debt-dialog";
import { PayDebtDialog } from "@/components/debts/pay-debt-dialog";
import { AddDebtPrincipalDialog } from "@/components/debts/add-debt-principal-dialog";
import { DeleteDebtDialog } from "@/components/debts/delete-debt-dialog";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";

function maybeConvertToStored(amount: number, unit: string, currency: string) {
  return isTryAssetUnit(unit) ? displayAmountToTry(amount, currency) : amount;
}

type PeriodSummaryResponse = {
  monthKey: string;
  periodStart: string;
  periodEnd: string;
  paidThisPeriod: {
    receivableTry: number;
    payableTry: number;
  };
};

export default function DebtsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.debts);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const monthStartDay = useAppSelector((s) => s.auth.user?.monthStartDay ?? 1);
  const [tab, setTab] = useState<"RECEIVABLE" | "PAYABLE">("RECEIVABLE");
  const [newOpen, setNewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [addingPrincipalId, setAddingPrincipalId] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDebtsReady, setInitialDebtsReady] = useState(false);
  const [periodSummary, setPeriodSummary] =
    useState<PeriodSummaryResponse | null>(null);
  const [periodSummaryLoading, setPeriodSummaryLoading] = useState(true);

  const loadPeriodSummary = useCallback(async () => {
    setPeriodSummaryLoading(true);
    try {
      const { data } = await apiClient.get<PeriodSummaryResponse>(
        "/api/debts/period-summary",
      );
      setPeriodSummary(data);
    } catch {
    } finally {
      setPeriodSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await dispatch(fetchDebts()).unwrap();
      } catch {
      } finally {
        if (!cancelled) setInitialDebtsReady(true);
      }
    })();
    void loadPeriodSummary();
    return () => {
      cancelled = true;
    };
  }, [dispatch, loadPeriodSummary]);

  const filtered = useMemo(
    () => items.filter((d) => d.direction === tab),
    [items, tab],
  );

  const goldLive = useGoldLivePrices(true);
  const silverLive = useSilverLivePrices(true);
  const fxLive = useFxLiveQuotes(true);
  const stockLive = useStockLiveQuotes(true);
  const cryptoLive = useCryptoLiveQuotes(true);
  const commodityLive = useCommodityLiveQuotes(true);
  const currencySymbols = useCurrencySymbols(true);

  const commodityBySymbol = useMemo(() => {
    const out: Record<string, number> = { ...commodityLive.byTicker };
    if (
      typeof silverLive.priceTryPerGram === "number" &&
      silverLive.priceTryPerGram > 0
    ) {
      out.GRSLV = silverLive.priceTryPerGram;
    }
    return out;
  }, [commodityLive.byTicker, silverLive.priceTryPerGram]);

  const displayRates: DebtAssetTryRates = useMemo(
    () => ({
      goldBySubtype: goldLive.prices,
      fxByCode: {
        ...FALLBACK_TL_PER_FOREIGN_UNIT,
        ...fxLive.byCode,
      },
      stockBySymbol: stockLive.byTicker,
      cryptoBySymbol: cryptoLive.byTicker,
      commodityBySymbol,
    }),
    [
      goldLive.prices,
      fxLive.byCode,
      stockLive.byTicker,
      cryptoLive.byTicker,
      commodityBySymbol,
    ],
  );

  const snapshotRates: DebtAssetTryRates = useMemo(
    () => ({
      goldBySubtype: goldLive.prices,
      fxByCode: fxLive.byCode,
      stockBySymbol: stockLive.byTicker,
      cryptoBySymbol: cryptoLive.byTicker,
      commodityBySymbol,
    }),
    [
      goldLive.prices,
      fxLive.byCode,
      stockLive.byTicker,
      cryptoLive.byTicker,
      commodityBySymbol,
    ],
  );

  const symbolOptionsByGroup = useMemo(() => {
    const stockSymbols = Object.keys(stockLive.byTicker)
      .sort()
      .map((code) => ({ code, name: code }));
    const cashSymbols = currencySymbols.items.filter(
      (s) => s.code !== "TL" && s.code !== "TRY",
    );
    const commoditySymbols: { code: string; name: string }[] = [];
    if (
      typeof silverLive.priceTryPerGram === "number" &&
      silverLive.priceTryPerGram > 0
    ) {
      commoditySymbols.push({ code: "GRSLV", name: "Gram Gümüş" });
    }
    for (const s of commodityLive.symbols) commoditySymbols.push(s);
    return {
      CASH: cashSymbols,
      STOCK: stockSymbols,
      CRYPTO: cryptoLive.symbols,
      COMMODITY: commoditySymbols,
    } as const;
  }, [
    stockLive.byTicker,
    cryptoLive.symbols,
    commodityLive.symbols,
    currencySymbols.items,
    silverLive.priceTryPerGram,
  ]);

  const totalsByUnit = useMemo(() => {
    const recv = new Map<
      string,
      { unit: string; symbol: string | null; qty: number }
    >();
    const pay = new Map<
      string,
      { unit: string; symbol: string | null; qty: number }
    >();
    for (const d of items) {
      const r = debtRemaining(d);
      if (r <= 0) continue;
      const unit = normalizeDebtAssetUnit(d.assetUnit);
      const symbol = d.assetSymbol ?? null;
      const key = `${unit}::${symbol ?? ""}`;
      const target = d.direction === "RECEIVABLE" ? recv : pay;
      const cur = target.get(key);
      if (cur) cur.qty += r;
      else target.set(key, { unit, symbol, qty: r });
    }
    return {
      recv: Array.from(recv.values()) as DebtTotalsByUnit,
      pay: Array.from(pay.values()) as DebtTotalsByUnit,
    };
  }, [items]);

  const period = useMemo(
    () => getBillingPeriodForDate(new Date(), monthStartDay),
    [monthStartDay],
  );

  const periodLabel = useMemo(
    () => formatPeriodRangeLabel(period.start, period.end),
    [period.start, period.end],
  );

  const dueInPeriodByUnit = useMemo(() => {
    const startMs = period.start.getTime();
    const endMs = period.end.getTime();
    const recv = new Map<
      string,
      { unit: string; symbol: string | null; qty: number }
    >();
    const pay = new Map<
      string,
      { unit: string; symbol: string | null; qty: number }
    >();
    for (const d of items) {
      if (!d.dueDate) continue;
      const dueMs = new Date(d.dueDate).getTime();
      if (dueMs < startMs || dueMs > endMs) continue;
      const r = debtRemaining(d);
      if (r <= 0) continue;
      const unit = normalizeDebtAssetUnit(d.assetUnit);
      const symbol = d.assetSymbol ?? null;
      const key = `${unit}::${symbol ?? ""}`;
      const target = d.direction === "RECEIVABLE" ? recv : pay;
      const cur = target.get(key);
      if (cur) cur.qty += r;
      else target.set(key, { unit, symbol, qty: r });
    }
    return {
      recv: Array.from(recv.values()) as DebtTotalsByUnit,
      pay: Array.from(pay.values()) as DebtTotalsByUnit,
    };
  }, [items, period.start, period.end]);

  const maturityRows = useMemo(() => buildDebtMaturityRows(items), [items]);

  async function onCreate(values: NewDebtFormValues) {
    const unit = normalizeDebtAssetUnit(values.assetUnit);
    const symbol = values.assetSymbol?.trim() || null;
    let tryValueAtCreation: number | undefined;
    if (!isTryAssetUnit(unit)) {
      const snap = convertDebtAssetToTry(
        values.totalAmount,
        unit,
        snapshotRates,
        symbol,
      );
      if (snap != null && snap > 0) tryValueAtCreation = snap;
    }
    await dispatch(
      addDebt({
        direction: values.direction,
        counterparty: values.counterparty,
        totalAmount: maybeConvertToStored(values.totalAmount, unit, currency),
        paidAmount: maybeConvertToStored(values.paidAmount, unit, currency),
        assetUnit: unit,
        assetSymbol: symbol,
        tryValueAtCreation,
        syncTransactions: values.syncTransactions,
        dueDate: values.dueDate ? new Date(values.dueDate + "T12:00:00") : null,
        note: values.note?.trim() ? values.note.trim() : null,
      }),
    ).unwrap();
    void dispatch(fetchDebts());
    void loadPeriodSummary();
  }

  async function onEditSave(values: NewDebtFormValues) {
    if (!editingId) return;
    const unit = normalizeDebtAssetUnit(values.assetUnit);
    const symbol = values.assetSymbol?.trim() || null;
    await dispatch(
      updateDebt({
        id: editingId,
        body: {
          direction: values.direction,
          counterparty: values.counterparty,
          totalAmount: maybeConvertToStored(values.totalAmount, unit, currency),
          paidAmount: maybeConvertToStored(values.paidAmount, unit, currency),
          assetUnit: unit,
          assetSymbol: symbol,
          dueDate: values.dueDate
            ? new Date(values.dueDate + "T12:00:00")
            : null,
          note: values.note?.trim() ? values.note.trim() : null,
        },
      }),
    );
    setEditingId(null);
    void dispatch(fetchDebts());
    void loadPeriodSummary();
  }

  async function onPaySubmit(amountDisplay: number) {
    if (!payingId) return;
    const d = items.find((x) => x.id === payingId);
    if (!d) return;
    const unit = normalizeDebtAssetUnit(d.assetUnit);
    const stored = maybeConvertToStored(amountDisplay, unit, currency);
    let tryValueDelta: number | undefined;
    if (!isTryAssetUnit(unit)) {
      const snap = convertDebtAssetToTry(
        stored,
        unit,
        snapshotRates,
        d.assetSymbol,
      );
      if (snap != null && snap > 0) tryValueDelta = snap;
    }
    await dispatch(
      recordDebtPayment({
        id: payingId,
        amountTry: stored,
        tryValueDelta,
      }),
    ).unwrap();
    setPayingId(null);
    void dispatch(fetchDebts());
    void loadPeriodSummary();
  }

  async function onPrincipalSubmit(amountDisplay: number) {
    if (!addingPrincipalId) return;
    const d = items.find((x) => x.id === addingPrincipalId);
    if (!d) return;
    const unit = normalizeDebtAssetUnit(d.assetUnit);
    const stored = maybeConvertToStored(amountDisplay, unit, currency);
    let tryValueDelta: number | undefined;
    if (!isTryAssetUnit(unit)) {
      const snap = convertDebtAssetToTry(
        stored,
        unit,
        snapshotRates,
        d.assetSymbol,
      );
      if (snap != null && snap > 0) tryValueDelta = snap;
    }
    await dispatch(
      recordDebtPrincipalIncrease({
        id: addingPrincipalId,
        amountTry: stored,
        tryValueDelta,
      }),
    ).unwrap();
    setAddingPrincipalId(null);
    void dispatch(fetchDebts());
    void loadPeriodSummary();
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    await dispatch(deleteDebt(deletingId));
    setDeletingId(null);
    void dispatch(fetchDebts());
    void loadPeriodSummary();
  }

  const editingDebt = items.find((x) => x.id === editingId);
  const payingDebt = items.find((x) => x.id === payingId);
  const principalDebt = items.find((x) => x.id === addingPrincipalId);

  function unitShortFor(d: { assetUnit: string; assetSymbol: string | null }) {
    if (isTryAssetUnit(d.assetUnit)) return currency;
    if (d.assetUnit === "FX" && d.assetSymbol) return d.assetSymbol;
    return debtAssetUnitLabel(d.assetUnit, "short");
  }
  const payingUnitLabel = payingDebt ? unitShortFor(payingDebt) : undefined;
  const principalUnitLabel = principalDebt
    ? unitShortFor(principalDebt)
    : undefined;

  return (
    <DataLoadingShell ready={initialDebtsReady}>
      <div className="space-y-6">
        <DashboardEmailVerificationBanner />
        <DebtsPageHeader
          newOpen={newOpen}
          onNewOpenChange={setNewOpen}
          onCreate={onCreate}
          symbolOptionsByGroup={symbolOptionsByGroup}
        />

        <div className="space-y-4">
          <DebtsSummaryCards
            totalsByUnitReceivable={totalsByUnit.recv}
            totalsByUnitPayable={totalsByUnit.pay}
            currency={currency}
            tryRates={displayRates}
          />

          <DebtsPeriodSummaryCards
            periodLabel={periodLabel}
            loadingPaid={periodSummaryLoading && !periodSummary}
            paidThisPeriodReceivableTry={
              periodSummary?.paidThisPeriod.receivableTry ?? 0
            }
            paidThisPeriodPayableTry={
              periodSummary?.paidThisPeriod.payableTry ?? 0
            }
            dueInPeriodReceivable={dueInPeriodByUnit.recv}
            dueInPeriodPayable={dueInPeriodByUnit.pay}
            currency={currency}
            tryRates={displayRates}
          />
        </div>

        {error && <p className="text-destructive">{error}</p>}
        <DebtsList
          tab={tab}
          onTabChange={setTab}
          items={filtered}
          loading={loading}
          currency={currency}
          tryRates={displayRates}
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
          unitShortLabel={principalUnitLabel}
        />

        <PayDebtDialog
          open={!!payingId}
          onOpenChange={(o) => !o && setPayingId(null)}
          onPay={onPaySubmit}
          receivableIncomeHint={payingDebt?.direction === "RECEIVABLE"}
          payableExpenseHint={payingDebt?.direction === "PAYABLE"}
          unitShortLabel={payingUnitLabel}
        />

        <EditDebtDialog
          debt={editingDebt}
          open={!!editingId}
          onOpenChange={(o) => !o && setEditingId(null)}
          currency={currency}
          onSave={onEditSave}
          symbolOptionsByGroup={symbolOptionsByGroup}
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
