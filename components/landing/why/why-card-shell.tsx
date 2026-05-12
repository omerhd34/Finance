import type { ReactNode } from "react";
import type { LandingWhyCard } from "@/components/landing/why/content";
import { cn } from "@/lib/common/utils";
import { accentBlobs } from "@/components/landing/why/constants";

type WhyCardShellProps = {
  card: LandingWhyCard;
  className?: string;
  children: ReactNode;
};

export function WhyCardShell({ card, className, children }: WhyCardShellProps) {
  return (
    <article
      className={cn(
        "relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm ring-1 ring-border/25 sm:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full blur-3xl opacity-50",
          accentBlobs[card.accent],
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full blur-3xl opacity-30",
          accentBlobs[card.accent],
        )}
        aria-hidden
      />
      <h3 className="relative z-10 text-base font-semibold tracking-tight text-foreground">
        {card.title}
      </h3>
      <div className="relative z-10 mt-4 flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </article>
  );
}
