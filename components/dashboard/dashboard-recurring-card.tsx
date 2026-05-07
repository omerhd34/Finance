import Link from "next/link";
import { ArrowUpRight, CalendarClock, Repeat2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  RECURRING_FREQUENCY_LABEL,
  RECURRING_MODE_LABEL,
} from "@/lib/dashboard/dashboard-recurring-labels";
import type { RecurringRule } from "@/types/recurring";
import { formatExpenseCategoryLabel } from "@/lib/domain/categories";
import { cn, formatDateShort, formatMoneyAmount } from "@/lib/common/utils";

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
    <Card className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
        <div className="flex min-w-0 flex-1 gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
            aria-hidden
          >
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold leading-tight tracking-tight">
              <span>Tekrarlayan işlemler</span>
            </h3>
            <p className="text-sm leading-snug text-muted-foreground">
              {activeRecurringCount === 0
                ? "Aktif tekrarlayan kural yok"
                : `${activeRecurringCount} aktif kural`}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          asChild
        >
          <Link href="/tekrarlayanlar" className="gap-1.5">
            Tümünü gör
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="p-4 sm:p-6">
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
          <ul className="grid min-w-0 gap-3 max-sm:[&>li:nth-child(n+3)]:hidden sm:[&>li:nth-child(n+3)]:block xl:grid-cols-2 [&>li:nth-child(n+4)]:hidden xl:[&>li:nth-child(n+4)]:block">
            {upcomingRecurring.map((rule) => {
              const title = formatExpenseCategoryLabel(
                rule.category,
                rule.subcategory,
              );
              const amount = formatMoneyAmount(rule.amount, currency);
              const desc = rule.description?.trim();
              const nextDate = formatDateShort(rule.nextDueDate);

              return (
                <li key={rule.id} className="min-w-0">
                  <div
                    className={cn(
                      "flex h-full min-h-0 flex-col rounded-xl border border-border/60 bg-muted/15 shadow-sm ring-1 ring-black/4 transition-colors hover:bg-muted/25 dark:ring-white/6",
                      "px-3.5 py-3 max-sm:gap-0",
                      "sm:px-5 sm:pb-5 sm:pt-4",
                    )}
                  >
                    {/* Özet: yalnızca &lt; sm */}
                    <div className="min-w-0 sm:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 leading-snug">
                          <span className="line-clamp-2 font-semibold tracking-tight text-foreground">
                            {title}
                          </span>
                        </p>
                        <p
                          className="shrink-0 text-right text-base font-semibold tabular-nums tracking-tight text-foreground"
                          title={amount}
                        >
                          {amount}
                        </p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-border/40 pt-2.5">
                        <Badge
                          variant={
                            rule.type === "income" ? "income" : "expense"
                          }
                          className="rounded-md px-2 py-px text-[10px] font-semibold"
                        >
                          {rule.type === "income" ? "Gelir" : "Gider"}
                        </Badge>
                        <time
                          className="text-[11px] leading-none tabular-nums text-muted-foreground"
                          dateTime={rule.nextDueDate}
                        >
                          {nextDate}
                        </time>
                      </div>
                    </div>

                    {/* Tam detay: sm ve üzeri */}
                    <div className="hidden min-h-0 flex-1 sm:flex sm:flex-col">
                      <div className="flex min-h-0 flex-1 gap-3.5 sm:gap-4">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
                          aria-hidden
                        >
                          <Repeat2 className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-3 sm:gap-y-1 md:gap-x-4">
                            <div className="min-w-0 space-y-1">
                              <p className="wrap-anywhere font-semibold leading-snug">
                                {title}
                              </p>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {desc || "—"}
                              </p>
                            </div>
                            <p className="min-w-0 self-start text-right text-lg font-semibold tabular-nums tracking-tight text-foreground wrap-anywhere sm:pt-0.5">
                              {amount}
                            </p>
                          </div>
                          <div className="mt-auto flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
                              Sonraki - {nextDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
