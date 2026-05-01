import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardKpiCard({
  icon: Icon,
  iconClassName,
  glowClassName,
  label,
  value,
  valueClassName,
}: {
  icon: LucideIcon;
  iconClassName: string;
  glowClassName: string;
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50",
        "bg-linear-to-br from-card via-card/90 to-muted/30",
        "shadow-sm ring-1 ring-black/5 dark:ring-white/10",
        "hover:border-border hover:shadow-md",
        "hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-80 blur-3xl",
          glowClassName,
        )}
      />
      <CardHeader className="relative space-y-0 p-5 pb-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
              iconClassName,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5 ">
            <CardDescription className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </CardDescription>
            <CardTitle
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.625rem]",
                valueClassName,
              )}
            >
              {value}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
