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

export type RecurringModeFilter = "all" | "AUTO" | "REMINDER";
export type RecurringFrequencyFilter = "all" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type RecurringTypeFilter = "all" | "income" | "expense";

export type RecurringFiltersState = {
  search: string;
  mode: RecurringModeFilter;
  frequency: RecurringFrequencyFilter;
  type: RecurringTypeFilter;
};

export const DEFAULT_RECURRING_FILTERS: RecurringFiltersState = {
  search: "",
  mode: "all",
  frequency: "all",
  type: "all",
};

type Props = {
  filters: RecurringFiltersState;
  onFiltersChange: (patch: Partial<RecurringFiltersState>) => void;
  onClearFilters: () => void;
};

export function RecurringFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
        <CardDescription>
          Tekrarlayan işlemleri moda, sıklığa ve türe göre daraltın. Mod
          filtresi (Otomatik / Hatırlatıcı) sıklık ve türden bağımsız çalışır.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Arama</Label>
            <Input
              placeholder="Açıklama veya kategori ara"
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Mod</Label>
            <Select
              value={filters.mode}
              onValueChange={(v) =>
                onFiltersChange({ mode: v as RecurringModeFilter })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="AUTO">Otomatik</SelectItem>
                <SelectItem value="REMINDER">Hatırlatıcı</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Sıklık</Label>
            <Select
              value={filters.frequency}
              onValueChange={(v) =>
                onFiltersChange({ frequency: v as RecurringFrequencyFilter })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="WEEKLY">Haftalık</SelectItem>
                <SelectItem value="MONTHLY">Aylık</SelectItem>
                <SelectItem value="YEARLY">Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="shrink-0">Tür</Label>
            <Select
              value={filters.type}
              onValueChange={(v) =>
                onFiltersChange({ type: v as RecurringTypeFilter })
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
