import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/common/utils";

type Props = {
  icon: LucideIcon;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
  iconStrokeWidth?: number;
};

export function DashboardSectionHeader({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconStrokeWidth,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={iconStrokeWidth} />
        </div>
        <div className="min-w-0 space-y-1.5 pt-0.5">
          <h3 className="text-lg font-semibold leading-tight tracking-tight">
            {title}
          </h3>
          <p className="text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}
