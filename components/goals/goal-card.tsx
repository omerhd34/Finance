"use client";

import { differenceInCalendarDays } from "date-fns";
import {
  goalProgressIndicatorClassName,
  goalProgressPercent,
} from "@/lib/goal-progress";
import { formatDateTR, formatMoney } from "@/lib/utils";
import type { Goal } from "@/types/goal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = {
  goal: Goal;
  currency: string;
  onUpdate: () => void;
  onDelete: () => void;
};

export function GoalCard({ goal: g, currency, onUpdate, onDelete }: Props) {
  const pct = goalProgressPercent(g);
  const daysLeft = g.deadline
    ? differenceInCalendarDays(g.deadline, new Date())
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">{g.title}</CardTitle>
        <CardDescription>
          Hedef: {formatMoney(g.targetAmount, currency)} · Mevcut:{" "}
          {formatMoney(g.currentAmount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress
          value={pct}
          indicatorClassName={goalProgressIndicatorClassName(pct)}
        />
        <p className="text-xs text-muted-foreground">
          {g.deadline
            ? `Bitiş: ${formatDateTR(g.deadline)} · Kalan gün: ${
                daysLeft !== null && daysLeft >= 0 ? daysLeft : 0
              }`
            : "Bitiş tarihi yok"}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onUpdate}
          className="cursor-pointer"
        >
          Güncelle
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive cursor-pointer"
          onClick={onDelete}
        >
          Sil
        </Button>
      </CardFooter>
    </Card>
  );
}
