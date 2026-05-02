"use client";

import {
  EXPENSE_CATEGORY_TREE,
  EXPENSE_CATEGORIES,
  expenseCategorySelectGroupLabelClassName,
  INCOME_CATEGORIES,
} from "@/lib/domain/categories";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  const typeFilter = filters.type || "all";
  const showExpenseCats = typeFilter === "all" || typeFilter === "expense";
  const showIncomeCats = typeFilter === "all" || typeFilter === "income";

  const expenseCategorySet = new Set<string>(EXPENSE_CATEGORIES);
  const incomeCategoriesForFilter =
    showExpenseCats && showIncomeCats
      ? INCOME_CATEGORIES.filter((c) => !expenseCategorySet.has(c))
      : [...INCOME_CATEGORIES];

  const incomeGroupLabelIndex =
    showExpenseCats && showIncomeCats ? EXPENSE_CATEGORY_TREE.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
        <CardDescription>
          İşlemleri tarih, tür ve kategoriye göre daraltın; açıklama aramasıyla
          listede aradığınız kaydı hızlıca bulun.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Arama</Label>
            <Input
              placeholder="Açıklama ara"
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
                {showExpenseCats &&
                  EXPENSE_CATEGORY_TREE.map((g, gi) => (
                    <SelectGroup key={g.group}>
                      <SelectLabel
                        className={expenseCategorySelectGroupLabelClassName(gi)}
                      >
                        {g.group}
                      </SelectLabel>
                      {g.categories.map((row) => (
                        <SelectItem key={row.category} value={row.category}>
                          {row.category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                {showIncomeCats && incomeCategoriesForFilter.length > 0 && (
                  <SelectGroup key="gelir-kategorileri">
                    <SelectLabel
                      className={expenseCategorySelectGroupLabelClassName(
                        incomeGroupLabelIndex,
                      )}
                    >
                      Gelir
                    </SelectLabel>
                    {incomeCategoriesForFilter.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
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
