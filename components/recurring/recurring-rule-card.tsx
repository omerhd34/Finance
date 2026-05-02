"use client";

import {
  RECURRING_FREQUENCY_LABEL,
  RECURRING_MODE_LABEL,
} from "@/lib/recurring/recurring-labels";
import { formatDateTR, formatMoney } from "@/lib/common/utils";
import type { RecurringRule } from "@/types/recurring";
import { formatExpenseCategoryLabel } from "@/lib/domain/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  rule: RecurringRule;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function RecurringRuleCard({
  rule: r,
  currency,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-medium">
            {formatExpenseCategoryLabel(r.category, r.subcategory)}
          </p>
          {r.description && (
            <p className="truncate text-sm text-muted-foreground">
              {r.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {r.type === "income" ? "Gelir" : "Gider"} ·{" "}
            {formatMoney(r.amount, currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            Sonraki: {formatDateTR(r.nextDueDate)}
            {r.endDate && ` - Bitiş: ${formatDateTR(r.endDate)}`}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:contents">
            {!r.isActive && <Badge variant="secondary">Pasif</Badge>}
            <Badge variant="outline" className="text-[11px] sm:text-xs">
              {RECURRING_MODE_LABEL[r.mode] ?? r.mode}
            </Badge>
            <Badge variant="outline" className="text-[11px] sm:text-xs">
              {RECURRING_FREQUENCY_LABEL[r.frequency] ?? r.frequency}
              {r.interval > 1 ? ` ×${r.interval}` : ""}
            </Badge>
          </div>
          <div className="flex items-center justify-start gap-2 sm:contents">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Düzenle"
              onClick={onEdit}
              className="h-9 w-9 cursor-pointer sm:h-10 sm:w-10"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 cursor-pointer text-destructive sm:h-10 sm:w-10"
              aria-label="Sil"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
