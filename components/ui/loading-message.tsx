import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variantLayout: Record<
  "page" | "panel" | "section" | "table",
  { container: string; wrap: string; icon: string }
> = {
  page: {
    container: "min-h-[50vh]",
    wrap: "rounded-full bg-primary/10 p-4 ring-1 ring-primary/15 shadow-sm",
    icon: "h-8 w-8",
  },
  panel: {
    container: "min-h-80",
    wrap: "rounded-full bg-primary/10 p-3 ring-1 ring-primary/15",
    icon: "h-7 w-7",
  },
  section: {
    container: "min-h-40",
    wrap: "rounded-full bg-primary/10 p-3 ring-1 ring-primary/15",
    icon: "h-6 w-6",
  },
  table: {
    container: "min-h-48 py-10",
    wrap: "rounded-full bg-primary/10 p-2.5 ring-1 ring-primary/15",
    icon: "h-5 w-5",
  },
};

export type LoadingMessageVariant = keyof typeof variantLayout;

type LoadingMessageProps = {
  variant?: LoadingMessageVariant;
  className?: string;
  ariaLabel?: string;
};

export function LoadingMessage({
  variant = "page",
  className,
  ariaLabel = "Yükleniyor",
}: LoadingMessageProps) {
  const v = variantLayout[variant];

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        v.container,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <span className={cn("inline-flex items-center justify-center", v.wrap)}>
        <Loader2
          className={cn("animate-spin text-primary", v.icon)}
          aria-hidden
        />
      </span>
    </div>
  );
}
