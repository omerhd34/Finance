"use client";

import {
  EXPENSE_SUBCATEGORY_NONE,
  EXPENSE_CATEGORY_TREE,
  expenseCategorySelectGroupLabelClassName,
  getExpenseSubcategories,
} from "@/lib/domain/categories";
import { Label } from "@/components/ui/label";
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
  category: string;
  subcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  disabled?: boolean;
};

export function ExpenseCategoryPair({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  disabled,
}: Props) {
  const subs = getExpenseSubcategories(category);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            onCategoryChange(v);
            onSubcategoryChange(EXPENSE_SUBCATEGORY_NONE);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORY_TREE.map((g, i) => (
              <SelectGroup key={g.group}>
                <SelectLabel
                  className={expenseCategorySelectGroupLabelClassName(i)}
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
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Alt kategori</Label>
        <Select
          value={subs.length ? subcategory : EXPENSE_SUBCATEGORY_NONE}
          onValueChange={onSubcategoryChange}
          disabled={disabled || subs.length === 0}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EXPENSE_SUBCATEGORY_NONE}>
              Belirtilmedi
            </SelectItem>
            {subs.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
