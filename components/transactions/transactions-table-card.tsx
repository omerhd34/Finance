"use client";

import Link from "next/link";
import type { Transaction } from "@/types/transaction";
import {
  cn,
  currencySymbolLabel,
  formatMoneyAmount,
  formatDateShort,
} from "@/lib/utils";
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
import { Pencil, Trash2 } from "lucide-react";

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
}: Props) {
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
                <TableHead className="text-right">
                  <button
                    type="button"
                    onClick={onAmountSortToggle}
                    className="inline-flex w-full items-center justify-end gap-1 text-right transition-colors hover:text-foreground cursor-pointer"
                    aria-label="Tutara göre sırala"
                  >
                    Tutar ({currencySymbolLabel(currency)})
                  </button>
                </TableHead>
                <TableHead>Tür</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
                items.map((t) =>
                  (() => {
                    const isRecurringTransaction =
                      Boolean(t.recurringRuleId) ||
                      Boolean(t.recurringSlotKey) ||
                      t.description?.startsWith("[Tekrarlayan]") === true;

                    return (
                      <TableRow
                        key={t.id}
                        className={
                          isRecurringTransaction
                            ? "[&>td]:bg-emerald-500/10 hover:[&>td]:bg-emerald-500/15 "
                            : "hover:bg-primary/3 transition-colors duration-150"
                        }
                      >
                        <TableCell>{formatDateShort(t.date)}</TableCell>
                        <TableCell>
                          <Link
                            href={`/islemler?category=${encodeURIComponent(t.category)}&type=${encodeURIComponent(t.type)}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {t.category}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {t.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatMoneyAmount(t.amount, currency)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={t.type === "income" ? "income" : "expense"}
                          >
                            {t.type === "income" ? "Gelir" : "Gider"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isRecurringTransaction ? (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive cursor-pointer"
                            aria-label="Sil"
                            onClick={() => onDelete(t)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })(),
                )
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-sm text-muted-foreground">
            Toplam {total} kayıt — sayfa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={page <= 1}
              onClick={onPrevPage}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={page >= totalPages}
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
