"use client";

import { formatDateTR, formatMoney } from "@/lib/utils";
import type { RecurringRule } from "@/types/recurring";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  items: RecurringRule[];
  currency: string;
  actionId: string | null;
  onFulfill: (id: string) => void;
  onSkip: (id: string) => void;
};

export function DueRemindersCard({
  items,
  currency,
  actionId,
  onFulfill,
  onSkip,
}: Props) {
  if (items.length === 0) return null;

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="text-base">Vadesi gelen hatırlatıcılar</CardTitle>
        <CardDescription>
          Aşağıdaki kalemler için işlem oluşturabilir veya bir sonraki tarihe
          erteleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-lg border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {r.category}
                {r.description ? ` — ${r.description}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {r.type === "income" ? "Gelir" : "Gider"} ·{" "}
                {formatMoney(r.amount, currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                Vade: {formatDateTR(r.nextDueDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90"
                disabled={actionId === r.id}
                onClick={() => void onFulfill(r.id)}
              >
                İşlemi oluştur
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionId === r.id}
                onClick={() => void onSkip(r.id)}
              >
                Sonraki tarihe ertele
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
