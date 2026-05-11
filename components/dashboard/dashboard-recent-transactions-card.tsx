import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardSectionActionLink } from "@/components/dashboard/dashboard-section-action-link";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
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
      <DashboardSectionHeader
        icon={History}
        title="Son işlemler"
        description="En son 5 işlem"
        action={<DashboardSectionActionLink href="/islemler" label="Tümünü gör" />}
      />
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
                      <TableCell>
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
