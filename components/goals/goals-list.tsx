"use client";

import type { Goal } from "@/types/goal";
import { GoalCard } from "./goal-card";

type Props = {
  items: Goal[];
  loading: boolean;
  currency: string;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
};

export function GoalsList({
  items,
  loading,
  currency,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            currency={currency}
            onUpdate={() => onUpdate(g.id)}
            onDelete={() => onDelete(g.id)}
          />
        ))}
      </div>
      {!loading && items.length === 0 && (
        <p className="text-center text-muted-foreground">
          Henüz hedef yok. Yeni hedef ekleyin.
        </p>
      )}
    </>
  );
}
