"use client";

import Link from "next/link";
import type { Transaction } from "@/types/transaction";
import {
  DEBT_EXPENSE_CATEGORY,
  formatExpenseCategoryLabel,
} from "@/lib/domain/categories";
import { cn, formatMoneyAmount, formatDateShort } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingMessage } from "@/components/ui/loading-message";
import { isDebtMirrorTransaction } from "@/lib/transactions/debt-mirror-transaction";
import {
  RECURRING_DESC_PREFIX,
  TransactionDescriptionText,
} from "@/components/transactions/transaction-description-text";
import { Pencil, Scale, Trash2 } from "lucide-react";

type Props = {
  items: Transaction[];
  loading: boolean;
  currency: string;
  dateSortOrder: "desc" | "asc" | null;
  onDateSortToggle: () => void;
  amountSortOrder: "desc" | "asc" | null;
  onAmountSortToggle: () => void;
  total: number;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  filteredSignedTotalTry: number;
};

export function TransactionsTableCard({
  items,
  loading,
  currency,
  onDateSortToggle,
  onAmountSortToggle,
  total,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  onEdit,
  onDelete,
  filteredSignedTotalTry,
}: Props) {
  const totalTone =
    filteredSignedTotalTry > 0
      ? "positive"
      : filteredSignedTotalTry < 0
        ? "negative"
        : "neutral";

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto px-4 pt-4 sm:px-6 sm:pt-6">
          <Table
            className={cn(
              "[&_th]:px-3 [&_th]:py-3.5 [&_td]:px-3 [&_td]:py-3.5 sm:[&_th]:px-4 sm:[&_td]:px-4",
              "[&_th]:font-semibold [&_th]:text-muted-foreground",
            )}
          >
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    type="button"
                    onClick={onDateSortToggle}
                    className="inline-flex items-center gap-1 text-left transition-colors hover:text-foreground cursor-pointer"
                    aria-label="Tarihe göre sırala"
                  >
                    Tarih
                  </button>
                </TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right pr-8 sm:pr-12">
                  <button
                    type="button"
                    onClick={onAmountSortToggle}
                    className="inline-flex w-full items-center justify-end gap-1 text-right transition-colors hover:text-foreground cursor-pointer"
                    aria-label="Tutara göre sırala"
                  >
                    Tutar
                  </button>
                </TableHead>
                <TableHead className="pl-4 sm:pl-8">Tür</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              aria-busy={loading}
              className={cn(
                loading &&
                  items.length > 0 &&
                  "pointer-events-none opacity-55 transition-opacity",
              )}
            >
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <LoadingMessage variant="table" />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground sm:px-6"
                  >
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {items.map((t) =>
                    (() => {
                      const isRecurringTransaction =
                        Boolean(t.recurringRuleId) ||
                        Boolean(t.recurringSlotKey) ||
                        t.description?.startsWith(RECURRING_DESC_PREFIX) ===
                          true;
                      const isDebtRow = isDebtMirrorTransaction(t);
                      const isBorcCategoryRow =
                        t.category === DEBT_EXPENSE_CATEGORY;
                      const hideEdit = isRecurringTransaction || isDebtRow;
                      const hideDelete = isDebtRow && !isBorcCategoryRow;
                      const noActionButtons = hideEdit && hideDelete;

                      return (
                        <TableRow
                          key={t.id}
                          className={cn(
                            "transition-colors duration-150",
                            t.type === "income"
                              ? "[&>td]:bg-emerald-50/90 hover:[&>td]:bg-emerald-100 dark:[&>td]:bg-emerald-950/50 dark:hover:[&>td]:bg-emerald-950/65"
                              : "[&>td]:bg-red-50/90 hover:[&>td]:bg-red-100 dark:[&>td]:bg-red-950/50 dark:hover:[&>td]:bg-red-950/65",
                          )}
                        >
                          <TableCell>{formatDateShort(t.date)}</TableCell>
                          <TableCell>
                            <Link
                              href={`/islemler?category=${encodeURIComponent(t.category)}&type=${encodeURIComponent(t.type)}`}
                              className="text-foreground underline-offset-4 decoration-muted-foreground/50 hover:underline hover:text-foreground hover:decoration-foreground/40"
                            >
                              {formatExpenseCategoryLabel(
                                t.category,
                                t.subcategory,
                              )}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <span className="block truncate">
                              <TransactionDescriptionText
                                description={t.description}
                              />
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums pr-8 sm:pr-12">
                            {formatMoneyAmount(t.amount, currency)}
                          </TableCell>
                          <TableCell className="pl-4 sm:pl-8">
                            <Badge
                              variant={
                                t.type === "income" ? "income" : "expense"
                              }
                            >
                              {t.type === "income" ? "Gelir" : "Gider"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            <div className="inline-flex min-h-9 items-center justify-end gap-0.5">
                              {!hideEdit ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Düzenle"
                                  onClick={() => onEdit(t)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              ) : null}
                              {!hideDelete ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive cursor-pointer"
                                  aria-label="Sil"
                                  onClick={() => onDelete(t)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : null}
                              {noActionButtons ? (
                                <span
                                  className="inline-flex items-center"
                                  aria-hidden
                                >
                                  <span className="size-9 shrink-0" />
                                  <span className="size-9 shrink-0" />
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })(),
                  )}
                </>
              )}
            </TableBody>
          </Table>
          {items.length > 0 ? (
            <div
              className={cn(
                "flex flex-col gap-3 border-t-2 border-border px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4",
                totalTone === "positive" && "bg-sky-500/5 dark:bg-sky-950/35",
                totalTone === "negative" &&
                  "bg-amber-500/5 dark:bg-amber-950/35",
                totalTone === "neutral" && "bg-muted/25",
              )}
              aria-live="polite"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full ring-1",
                    totalTone === "positive" &&
                      "bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300",
                    totalTone === "negative" &&
                      "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
                    totalTone === "neutral" &&
                      "bg-muted text-muted-foreground ring-border",
                  )}
                >
                  <Scale className="size-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Net toplam
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tüm filtrelenmiş kayıtlar (gelir − gider)
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  "text-right text-base font-semibold tabular-nums pr-8 sm:pr-12",
                  totalTone === "positive" && "text-sky-700 dark:text-sky-300",
                  totalTone === "negative" &&
                    "text-amber-700 dark:text-amber-300",
                  totalTone === "neutral" && "text-muted-foreground",
                )}
              >
                {filteredSignedTotalTry > 0
                  ? "+"
                  : filteredSignedTotalTry < 0
                    ? "-"
                    : ""}
                {formatMoneyAmount(Math.abs(filteredSignedTotalTry), currency)}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-sm text-muted-foreground">
            Toplam {total} kayıt — sayfa {page} / {totalPages}
            {loading && items.length > 0 ? (
              <span className="ml-2 text-xs text-muted-foreground/90">
                Yükleniyor…
              </span>
            ) : null}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={loading || page <= 1}
              onClick={onPrevPage}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={loading || page >= totalPages}
              onClick={onNextPage}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
