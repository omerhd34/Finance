"use client";

import { ALL_TRANSACTION_FILTER_CATEGORIES } from "@/lib/transactions-filter-categories";
import type { TransactionFilters } from "@/store/slices/transactionSlice";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  filters: TransactionFilters;
  onFiltersChange: (patch: Partial<TransactionFilters>) => void;
  onClearFilters: () => void;
};

export function TransactionsFiltersCard({
  filters,
  onFiltersChange,
  onClearFilters,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
        <CardDescription>Tarih aralığı ve kategori ile daraltın.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Arama</Label>
            <Input
              placeholder="Açıklama veya kategori"
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Tür</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(v) =>
                onFiltersChange({
                  type: v === "all" ? "" : (v as "income" | "expense"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="income">Gelir</SelectItem>
                <SelectItem value="expense">Gider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Kategori</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(v) =>
                onFiltersChange({ category: v === "all" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {ALL_TRANSACTION_FILTER_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Başlangıç</Label>
            <DatePickerField
              value={filters.dateFrom}
              onChange={(v) => onFiltersChange({ dateFrom: v })}
              allowClear
              placeholder="Tarih seçin"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Bitiş</Label>
            <DatePickerField
              value={filters.dateTo}
              onChange={(v) => onFiltersChange({ dateTo: v })}
              allowClear
              placeholder="Tarih seçin"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              className="w-full cursor-pointer"
              onClick={onClearFilters}
            >
              Filtreleri temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
