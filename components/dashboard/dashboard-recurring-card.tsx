import Link from "next/link";
import { CalendarClock, Repeat2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RECURRING_FREQUENCY_LABEL,
  RECURRING_MODE_LABEL,
} from "@/lib/dashboard-recurring-labels";
import type { RecurringRule } from "@/types/recurring";
import { formatDateShort, formatMoneyAmount } from "@/lib/utils";

type Props = {
  activeRecurringCount: number;
  upcomingRecurring: RecurringRule[];
  currency: string;
};

export function DashboardRecurringCard({
  activeRecurringCount,
  upcomingRecurring,
  currency,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Tekrarlayan işlemler
          </CardTitle>
          <CardDescription>
            {activeRecurringCount === 0
              ? "Aktif tekrarlayan kural yok"
              : `${activeRecurringCount} aktif kural · Yaklaşan vadeler`}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/tekrarlayanlar">Tümünü gör</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcomingRecurring.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Henüz tekrarlayan kural yok veya tüm kurallar pasif.{" "}
            <Link
              href="/tekrarlayanlar"
              className="text-primary underline-offset-4 hover:underline"
            >
              Kural ekleyin
            </Link>
          </p>
        ) : (
          <ul className="space-y-2.5">
            {upcomingRecurring.map((rule) => (
              <li key={rule.id}>
                <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-3 shadow-sm ring-1 ring-black/4 transition-colors hover:bg-muted/25 dark:ring-white/6 sm:px-4">
                  <div className="flex gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
                      aria-hidden
                    >
                      <Repeat2 className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-semibold leading-snug">
                            {rule.category}
                          </p>
                          {rule.description ? (
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {rule.description}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-lg font-semibold tabular-nums tracking-tight text-foreground sm:pt-0.5 sm:text-right">
                          {formatMoneyAmount(rule.amount, currency)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 border-t border-border/50 pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium"
                          >
                            {RECURRING_MODE_LABEL[rule.mode] ?? rule.mode}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {RECURRING_FREQUENCY_LABEL[rule.frequency] ??
                              rule.frequency}
                          </Badge>
                          <Badge
                            variant={
                              rule.type === "income" ? "income" : "expense"
                            }
                            className="text-[10px] font-medium"
                          >
                            {rule.type === "income" ? "Gelir" : "Gider"}
                          </Badge>
                        </div>
                        <p className="text-[11px] tabular-nums text-muted-foreground sm:text-right">
                          <span className="text-muted-foreground/90">
                            Sonraki
                          </span>{" "}
                          · {formatDateShort(rule.nextDueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
