"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Transaction } from "@/types/transaction";
import type { TransactionEditFormValues } from "@/lib/schemas/validations";
import { displayAmountToTry } from "@/lib/common/currency";
import {
  downloadTransactionsCsv,
  downloadTransactionsPdfFiltered,
  fetchTransactionsForExport,
} from "@/lib/transactions/transactions-export";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteTransaction,
  fetchTransactions,
  setFilters,
  setPage,
  toggleAmountListSort,
  toggleDateListSort,
  updateTransaction,
  type TransactionFilters,
} from "@/store/slices/transactionSlice";
import { processDueRecurring } from "@/store/slices/recurringSlice";
import { apiClient } from "@/lib/client/api-client";
import {
  expenseByCategoryForLastNMonths,
  formatLastNMonthsPeriodRangeLabel,
  lastNMonthsBars,
  recommendedCategoryPieMonths,
} from "@/lib/dashboard/dashboard-stats";
import { formValueToExpenseSubcategory } from "@/lib/domain/categories";
import { dedupeTransactionsForDisplay } from "@/lib/transactions/dedupe-transactions-display";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { TransactionsChartsSection } from "@/components/transactions/transactions-charts-section";
import { TransactionsFiltersCard } from "@/components/transactions/transactions-filters-card";
import { TransactionsPageHeader } from "@/components/transactions/transactions-page-header";
import { TransactionsTableCard } from "@/components/transactions/transactions-table-card";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { LogoLoading } from "@/components/ui/logo-loading";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";

function TransactionsPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const {
    items,
    loading,
    error,
    filters,
    total,
    page,
    pageSize,
    signedTotalTry,
    listSortBy,
    listSortOrder,
  } = useAppSelector((s) => s.transactions);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const monthStartDay = useAppSelector((s) => s.auth.user?.monthStartDay ?? 1);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [barsChartMonths, setBarsChartMonths] = useState(12);
  const [pieChartMonths, setPieChartMonths] = useState(1);
  const pieChartMonthsTouchedRef = useRef(false);
  const [chartItems, setChartItems] = useState<Transaction[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [initialTableHydrated, setInitialTableHydrated] = useState(false);

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

  const handlePieChartMonthsChange = useCallback((months: number) => {
    pieChartMonthsTouchedRef.current = true;
    setPieChartMonths(months);
  }, []);

  useLayoutEffect(() => {
    if (chartLoading) return;
    if (pieChartMonthsTouchedRef.current) return;
    const recommended = recommendedCategoryPieMonths(
      chartItems,
      new Date(),
      monthStartDay,
    );
    setPieChartMonths((prev) => (prev === recommended ? prev : recommended));
  }, [chartItems, monthStartDay, chartLoading]);

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
  const barsRangeLabel = useMemo(
    () =>
      formatLastNMonthsPeriodRangeLabel(
        barsChartMonths,
        chartNow,
        monthStartDay,
      ),
    [barsChartMonths, chartNow, monthStartDay],
  );
  const pieRangeLabel = useMemo(
    () =>
      formatLastNMonthsPeriodRangeLabel(
        pieChartMonths,
        chartNow,
        monthStartDay,
      ),
    [pieChartMonths, chartNow, monthStartDay],
  );

  useLayoutEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const patch: Partial<TransactionFilters> = {};
    const cat = params.get("category");
    if (cat !== null) patch.category = cat;
    const typ = params.get("type");
    if (typ === "income" || typ === "expense") patch.type = typ;
    const from = params.get("from");
    if (from !== null) patch.dateFrom = from;
    const to = params.get("to");
    if (to !== null) patch.dateTo = to;
    const q = params.get("search");
    if (q !== null) patch.search = q;
    if (Object.keys(patch).length > 0) {
      dispatch(setFilters(patch));
    }
    if (params.get("new") === "1") {
      setNewTransactionOpen(true);
    }
  }, [searchParamsKey, dispatch]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let createdFromRecurring = 0;
      try {
        createdFromRecurring = await dispatch(processDueRecurring()).unwrap();
      } catch {}
      if (createdFromRecurring === 0) {
        try {
          await dispatch(
            fetchTransactions({
              filters,
              page,
              pageSize,
              listSortBy,
              listSortOrder,
            }),
          ).unwrap();
        } catch {}
      }
      if (!cancelled) setInitialTableHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, filters, page, pageSize, listSortBy, listSortOrder]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const displayItems = useMemo(
    () => dedupeTransactionsForDisplay(items),
    [items],
  );

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
          subcategory:
            values.type === "expense"
              ? (formValueToExpenseSubcategory(values.subcategory) ?? null)
              : null,
          description: values.description || undefined,
          date: d.toISOString(),
          type: t.recurringRuleId || t.recurringSlotKey ? t.type : values.type,
        },
      }),
    );
    setEditing(null);
    void dispatch(
      fetchTransactions({
        filters,
        page,
        pageSize,
        listSortBy,
        listSortOrder,
      }),
    );
    void loadChartTransactions();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await dispatch(deleteTransaction(deleting.id));
    setDeleting(null);
    void dispatch(
      fetchTransactions({
        filters,
        page,
        pageSize,
        listSortBy,
        listSortOrder,
      }),
    );
    void loadChartTransactions();
  }

  async function afterTransactionCreated() {
    await dispatch(
      fetchTransactions({
        filters,
        page,
        pageSize,
        listSortBy,
        listSortOrder,
      }),
    );
    void loadChartTransactions();
  }

  const pageDataReady = !chartLoading && initialTableHydrated;

  return (
    <DataLoadingShell ready={pageDataReady}>
      <div className="space-y-6">
        <DashboardEmailVerificationBanner />
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
          onClearFilters={() => {
            dispatch(
              setFilters({
                type: "",
                category: "",
                dateFrom: "",
                dateTo: "",
                search: "",
              }),
            );
            if (searchParamsKey.length > 0) {
              router.replace(pathname, { scroll: false });
            }
          }}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <TransactionsTableCard
          items={displayItems}
          loading={loading}
          currency={currency}
          dateSortOrder={
            listSortBy === "date" ? listSortOrder : null
          }
          onDateSortToggle={() => dispatch(toggleDateListSort())}
          amountSortOrder={
            listSortBy === "amount" ? listSortOrder : null
          }
          onAmountSortToggle={() => dispatch(toggleAmountListSort())}
          total={total}
          page={page}
          totalPages={totalPages}
          onPrevPage={() => dispatch(setPage(page - 1))}
          onNextPage={() => dispatch(setPage(page + 1))}
          onEdit={setEditing}
          onDelete={setDeleting}
          filteredSignedTotalTry={signedTotalTry}
        />

        <TransactionsChartsSection
          bars={transactionsChartBars}
          pie={transactionsChartPie}
          barsMonths={barsChartMonths}
          pieMonths={pieChartMonths}
          barsRangeLabel={barsRangeLabel}
          pieRangeLabel={pieRangeLabel}
          onBarsMonthsChange={setBarsChartMonths}
          onPieMonthsChange={handlePieChartMonthsChange}
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
    </DataLoadingShell>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LogoLoading />}>
      <TransactionsPageContent />
    </Suspense>
  );
}
