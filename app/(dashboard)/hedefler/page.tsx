"use client";

import { useEffect, useState } from "react";
import { displayAmountToTry } from "@/lib/currency";
import type { NewGoalFormValues } from "@/lib/goals-schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteGoal,
  fetchGoals,
  updateGoal,
  addGoal,
} from "@/store/slices/goalsSlice";
import { GoalsPageHeader } from "@/components/goals/goals-page-header";
import { GoalsList } from "@/components/goals/goals-list";
import { UpdateGoalAmountDialog } from "@/components/goals/update-goal-amount-dialog";
import { DeleteGoalDialog } from "@/components/goals/delete-goal-dialog";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function GoalsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.goals);
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchGoals());
  }, [dispatch]);

  async function onCreate(values: NewGoalFormValues) {
    await dispatch(
      addGoal({
        title: values.title,
        targetAmount: displayAmountToTry(values.targetAmount, currency),
        deadline: values.deadline
          ? new Date(values.deadline + "T12:00:00")
          : null,
      }),
    ).unwrap();
    void dispatch(fetchGoals());
  }

  async function onUpdateAmount(goalId: string, currentAmountDisplay: number) {
    await dispatch(
      updateGoal({
        id: goalId,
        body: {
          currentAmount: displayAmountToTry(currentAmountDisplay, currency),
        },
      }),
    );
    setUpdatingId(null);
    void dispatch(fetchGoals());
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    await dispatch(deleteGoal(deletingId));
    setDeletingId(null);
    void dispatch(fetchGoals());
  }

  const updatingGoal = items.find((x) => x.id === updatingId);

  return (
    <div className="space-y-6">
      <GoalsPageHeader
        newOpen={newOpen}
        onNewOpenChange={setNewOpen}
        currency={currency}
        onCreate={onCreate}
      />

      {error && <p className="text-destructive">{error}</p>}
      {loading ? (
        <LoadingMessage variant="page" />
      ) : (
        <GoalsList
          items={items}
          loading={loading}
          currency={currency}
          onUpdate={setUpdatingId}
          onDelete={setDeletingId}
        />
      )}

      <UpdateGoalAmountDialog
        goal={updatingGoal}
        open={!!updatingId}
        onOpenChange={(o) => !o && setUpdatingId(null)}
        currency={currency}
        onSave={onUpdateAmount}
      />

      <DeleteGoalDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
