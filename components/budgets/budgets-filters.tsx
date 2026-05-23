"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BudgetStatusFilter = "all" | "normal" | "near" | "over";
export type BudgetSortKey =
  | "category-asc"
  | "usage-desc"
  | "usage-asc"
  | "limit-desc"
  | "limit-asc";

export type BudgetsFiltersState = {
  search: string;
  status: BudgetStatusFilter;
  sort: BudgetSortKey;
};

export const DEFAULT_BUDGETS_FILTERS: BudgetsFiltersState = {
  search: "",
  status: "all",
  sort: "category-asc",
};

type Props = {
  filters: BudgetsFiltersState;
  onFiltersChange: (patch: Partial<BudgetsFiltersState>) => void;
  onClearFilters: () => void;
};

export function BudgetsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
        <CardDescription>
          Bütçeleri kategoriye, duruma ve sıralamaya göre daraltın. Durum
          filtresi, kart üstündeki uyarı eşiğine göre değerlendirilir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Arama</Label>
            <Input
              placeholder="Kategori ara"
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Durum</Label>
            <Select
              value={filters.status}
              onValueChange={(v) =>
                onFiltersChange({ status: v as BudgetStatusFilter })
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  Tümü
                </SelectItem>
                <SelectItem value="normal" className="cursor-pointer">
                  Normal
                </SelectItem>
                <SelectItem value="near" className="cursor-pointer">
                  Eşiğe yakın
                </SelectItem>
                <SelectItem value="over" className="cursor-pointer">
                  Limit aşıldı
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Sıralama</Label>
            <Select
              value={filters.sort}
              onValueChange={(v) =>
                onFiltersChange({ sort: v as BudgetSortKey })
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category-asc" className="cursor-pointer">
                  Kategori (A-Z)
                </SelectItem>
                <SelectItem value="usage-desc" className="cursor-pointer">
                  Doluluk (yüksek → düşük)
                </SelectItem>
                <SelectItem value="usage-asc" className="cursor-pointer">
                  Doluluk (düşük → yüksek)
                </SelectItem>
                <SelectItem value="limit-desc" className="cursor-pointer">
                  Limit (yüksek → düşük)
                </SelectItem>
                <SelectItem value="limit-asc" className="cursor-pointer">
                  Limit (düşük → yüksek)
                </SelectItem>
              </SelectContent>
            </Select>
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
