import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/types/transaction";
import { TransactionDescriptionText } from "@/components/transactions/transaction-description-text";
import { formatExpenseCategoryLabel } from "@/lib/domain/categories";
import { formatDateShort, formatMoneyAmount } from "@/lib/common/utils";

type Props = {
  transactions: Transaction[];
  currency: string;
};

export function DashboardRecentTransactionsCard({
  transactions,
  currency,
}: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
        <div className="flex min-w-0 gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
            aria-hidden
          >
            <History className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <h3 className="text-lg font-semibold leading-tight tracking-tight">
              Son işlemler
            </h3>
            <p className="text-sm leading-snug text-muted-foreground">
              En son 5 işlem
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full shrink-0 gap-1.5 sm:w-auto"
          asChild
        >
          <Link
            href="/islemler"
            className="flex w-full items-center justify-center gap-1.5 sm:inline-flex sm:w-auto"
          >
            Tümünü gör
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="p-4 sm:p-6">
        <div className="-mx-1 overflow-x-auto sm:mx-0">
          <div className="min-w-[640px] px-1 sm:min-w-0 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      Tutar
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Henüz işlem yok.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDateShort(t.date)}</TableCell>
                      <TableCell>
                        {formatExpenseCategoryLabel(t.category, t.subcategory)}
                      </TableCell>
                      <TableCell className="max-w-[140px]">
                        <span className="block truncate">
                          <TransactionDescriptionText
                            description={t.description}
                          />
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.type === "income" ? "income" : "expense"}
                        >
                          {t.type === "income" ? "Gelir" : "Gider"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {t.type === "income" ? (
                          <span className="inline-flex items-center text-emerald-500">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            {formatMoneyAmount(t.amount, currency)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-500">
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                            {formatMoneyAmount(t.amount, currency)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
