"use client";

import type { RecurringRule } from "@/types/recurring";
import { Card, CardContent } from "@/components/ui/card";
import { RecurringRuleCard } from "./recurring-rule-card";

type Props = {
  items: RecurringRule[];
  loading: boolean;
  currency: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function RecurringRulesSection({
  items,
  loading,
  currency,
  onEdit,
  onDelete,
}: Props) {
  if (loading && items.length === 0) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Henüz tekrarlayan işlem yok. Yeni işlem ekleyerek başlayın.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <RecurringRuleCard
          key={r.id}
          rule={r}
          currency={currency}
          onEdit={() => onEdit(r.id)}
          onDelete={() => onDelete(r.id)}
        />
      ))}
    </div>
  );
}
