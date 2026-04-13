"use client";

import { NewGoalDialog } from "./new-goal-dialog";
import type { NewGoalFormValues } from "@/lib/goals-schema";

type Props = {
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  currency: string;
  onCreate: (values: NewGoalFormValues) => Promise<void>;
};

export function GoalsPageHeader({
  newOpen,
  onNewOpenChange,
  currency,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">Hedefler</h2>
        <p className="text-sm text-muted-foreground">
          Tasarruf hedeflerinizi takip edin.
        </p>
      </div>
      <NewGoalDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        currency={currency}
        onSubmit={onCreate}
      />
    </div>
  );
}
