"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Transaction } from "@/types/transaction";
import type { TransactionEditFormValues } from "@/lib/validations";
import { displayAmountToTry } from "@/lib/currency";
import {
  downloadTransactionsCsv,
  downloadTransactionsPdfFiltered,
  fetchTransactionsForExport,
} from "@/lib/transactions-export";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteTransaction,
  fetchTransactions,
  setFilters,
  setPage,
  updateTransaction,
  type TransactionFilters,
} from "@/store/slices/transactionSlice";
import { processDueRecurring } from "@/store/slices/recurringSlice";
import { apiClient } from "@/lib/api-client";
import {
  expenseByCategoryForLastNMonths,
  formatPeriodRangeLabel,
  getLastNMonthsPeriodRange,
  lastNMonthsBars,
} from "@/lib/dashboard-stats";
import { dedupeTransactionsForDisplay } from "@/lib/dedupe-transactions-display";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { TransactionsChartsSection } from "@/components/transactions/transactions-charts-section";
import { TransactionsFiltersCard } from "@/components/transactions/transactions-filters-card";
import { TransactionsPageHeader } from "@/components/transactions/transactions-page-header";
import { TransactionsTableCard } from "@/components/transactions/transactions-table-card";
import { LogoLoading } from "@/components/ui/logo-loading";

function TransactionsPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { items, loading, error, filters, total, page, pageSize } =
    useAppSelector((s) => s.transactions);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const monthStartDay = useAppSelector((s) => s.auth.user?.monthStartDay ?? 1);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [dateSortOrder, setDateSortOrder] = useState<"desc" | "asc" | null>(
    null,
  );
  const [amountSortOrder, setAmountSortOrder] = useState<"desc" | "asc" | null>(
    null,
  );
  const [barsChartMonths, setBarsChartMonths] = useState(3);
  const [pieChartMonths, setPieChartMonths] = useState(3);
  const [chartItems, setChartItems] = useState<Transaction[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);

  const loadChartTransactions = useCallback(async () => {
    setChartLoading(true);
    try {
      const { data } = await apiClient.get<{ items: Transaction[] }>(
        "/api/transactions?limit=2000",
      );
      setChartItems(data.items);
    } catch {
      setChartItems([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChartTransactions();
  }, [loadChartTransactions]);

  const chartNow = useMemo(() => new Date(), []);
  const transactionsChartBars = useMemo(
    () => lastNMonthsBars(chartItems, barsChartMonths, chartNow, monthStartDay),
    [chartItems, barsChartMonths, chartNow, monthStartDay],
  );
  const transactionsChartPie = useMemo(
    () =>
      expenseByCategoryForLastNMonths(
        chartItems,
        pieChartMonths,
        chartNow,
        monthStartDay,
      ),
    [chartItems, pieChartMonths, chartNow, monthStartDay],
  );
  const barsRangeLabel = useMemo(() => {
    const { start, end } = getLastNMonthsPeriodRange(
      barsChartMonths,
      chartNow,
      monthStartDay,
    );
    return formatPeriodRangeLabel(start, end);
  }, [barsChartMonths, chartNow, monthStartDay]);
  const pieRangeLabel = useMemo(() => {
    const { start, end } = getLastNMonthsPeriodRange(
      pieChartMonths,
      chartNow,
      monthStartDay,
    );
    return formatPeriodRangeLabel(start, end);
  }, [pieChartMonths, chartNow, monthStartDay]);

  useEffect(() => {
    void (async () => {
      try {
        await dispatch(processDueRecurring()).unwrap();
      } catch {
        /* process-due isteğe bağlı; hata olsa da listeyi yükleyelim */
      }
      await dispatch(fetchTransactions({ filters, page, pageSize }));
    })();
  }, [dispatch, filters, page, pageSize]);

  useEffect(() => {
    const patch: Partial<TransactionFilters> = {};
    const cat = searchParams.get("category");
    if (cat !== null) patch.category = cat;
    const typ = searchParams.get("type");
    if (typ === "income" || typ === "expense") patch.type = typ;
    const from = searchParams.get("from");
    if (from !== null) patch.dateFrom = from;
    const to = searchParams.get("to");
    if (to !== null) patch.dateTo = to;
    const q = searchParams.get("search");
    if (q !== null) patch.search = q;
    if (Object.keys(patch).length > 0) {
      dispatch(setFilters(patch));
    }
  }, [searchParams, dispatch]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const displayItems = useMemo(
    () => dedupeTransactionsForDisplay(items),
    [items],
  );

  const sortedDisplayItems = useMemo(() => {
    if (dateSortOrder) {
      return [...displayItems].sort((a, b) =>
        dateSortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }
    if (!amountSortOrder) return displayItems;
    return [...displayItems].sort((a, b) =>
      amountSortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount,
    );
  }, [displayItems, dateSortOrder, amountSortOrder]);

  async function exportCsv() {
    setExporting("csv");
    try {
      const rows = await fetchTransactionsForExport(filters);
      downloadTransactionsCsv(rows, currency);
    } finally {
      setExporting(null);
    }
  }

  async function exportPdf() {
    setExporting("pdf");
    try {
      const rows = await fetchTransactionsForExport(filters);
      await downloadTransactionsPdfFiltered(rows, currency);
    } finally {
      setExporting(null);
    }
  }

  async function saveEdit(
    transactionId: string,
    values: TransactionEditFormValues,
  ) {
    const t = items.find((x) => x.id === transactionId) ?? editing;
    if (!t) return;
    const d = new Date(values.date + "T12:00:00");
    await dispatch(
      updateTransaction({
        id: transactionId,
        body: {
          amount: displayAmountToTry(values.amount, currency),
          category: values.category,
          description: values.description || undefined,
          date: d.toISOString(),
          type: t.recurringRuleId || t.recurringSlotKey ? t.type : values.type,
        },
      }),
    );
    setEditing(null);
    void dispatch(fetchTransactions({ filters, page, pageSize }));
    void loadChartTransactions();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await dispatch(deleteTransaction(deleting.id));
    setDeleting(null);
    void dispatch(fetchTransactions({ filters, page, pageSize }));
    void loadChartTransactions();
  }

  async function afterTransactionCreated() {
    await dispatch(fetchTransactions({ filters, page, pageSize }));
    void loadChartTransactions();
  }

  if (loading || chartLoading) {
    return <LogoLoading />;
  }

  return (
    <div className="space-y-6">
      <TransactionsPageHeader
        exporting={exporting}
        onExportCsv={exportCsv}
        onExportPdf={exportPdf}
        newTransactionOpen={newTransactionOpen}
        onNewTransactionOpenChange={setNewTransactionOpen}
        onTransactionCreated={afterTransactionCreated}
      />

      <TransactionsFiltersCard
        filters={filters}
        onFiltersChange={(patch) => dispatch(setFilters(patch))}
        onClearFilters={() =>
          dispatch(
            setFilters({
              type: "",
              category: "",
              dateFrom: "",
              dateTo: "",
              search: "",
            }),
          )
        }
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <TransactionsTableCard
        items={sortedDisplayItems}
        loading={loading}
        currency={currency}
        dateSortOrder={dateSortOrder}
        onDateSortToggle={() => {
          setAmountSortOrder(null);
          setDateSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
        }}
        amountSortOrder={amountSortOrder}
        onAmountSortToggle={() => {
          setDateSortOrder(null);
          setAmountSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
        }}
        total={total}
        page={page}
        totalPages={totalPages}
        onPrevPage={() => dispatch(setPage(page - 1))}
        onNextPage={() => dispatch(setPage(page + 1))}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <TransactionsChartsSection
        bars={transactionsChartBars}
        pie={transactionsChartPie}
        barsMonths={barsChartMonths}
        pieMonths={pieChartMonths}
        barsRangeLabel={barsRangeLabel}
        pieRangeLabel={pieRangeLabel}
        onBarsMonthsChange={setBarsChartMonths}
        onPieMonthsChange={setPieChartMonths}
        loading={chartLoading}
      />

      <EditTransactionDialog
        transaction={editing}
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        currency={currency}
        onSave={saveEdit}
      />

      <DeleteTransactionDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LogoLoading />}>
      <TransactionsPageContent />
    </Suspense>
  );
}
