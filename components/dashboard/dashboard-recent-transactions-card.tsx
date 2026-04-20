import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/types/transaction";
import {
  currencySymbolLabel,
  formatDateShort,
  formatMoneyAmount,
} from "@/lib/utils";

type Props = {
  transactions: Transaction[];
  currency: string;
};

export function DashboardRecentTransactionsCard({
  transactions,
  currency,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <History
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Son işlemler
          </CardTitle>
          <CardDescription>En son 5 işlem</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/islemler">Tümünü gör</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead className="text-right">
                Tutar ({currencySymbolLabel(currency)})
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
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="max-w-[140px] truncate">
                    {t.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.type === "income" ? "income" : "expense"}>
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
      </CardContent>
    </Card>
  );
}
