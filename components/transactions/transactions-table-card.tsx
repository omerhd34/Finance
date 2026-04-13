"use client";

import Link from "next/link";
import type { Transaction } from "@/types/transaction";
import {
  currencySymbolLabel,
  formatMoneyAmount,
  formatDateShort,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  items: Transaction[];
  loading: boolean;
  currency: string;
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Tutar ({currencySymbolLabel(currency)})</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDateShort(t.date)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/transactions?category=${encodeURIComponent(t.category)}&type=${encodeURIComponent(t.type)}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {t.category}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {t.description ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Düzenle"
                        onClick={() => onEdit(t)}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border p-4 sm:flex-row">
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
