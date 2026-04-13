"use client";

import {
  RECURRING_FREQUENCY_LABEL,
  RECURRING_MODE_LABEL,
} from "@/lib/recurring-labels";
import { formatDateTR, formatMoney } from "@/lib/utils";
import type { RecurringRule } from "@/types/recurring";
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
          <p className="truncate font-medium">{r.category}</p>
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
            {r.endDate && ` · Bitiş: ${formatDateTR(r.endDate)}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {!r.isActive && <Badge variant="secondary">Pasif</Badge>}
          <Badge variant="outline">
            {RECURRING_MODE_LABEL[r.mode] ?? r.mode}
          </Badge>
          <Badge variant="outline">
            {RECURRING_FREQUENCY_LABEL[r.frequency] ?? r.frequency}
            {r.interval > 1 ? ` ×${r.interval}` : ""}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Düzenle"
            onClick={onEdit}
            className="cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="text-destructive cursor-pointer"
            aria-label="Sil"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
