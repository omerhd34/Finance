import type { ReactNode } from "react";
import type { LandingWhyCard } from "@/components/landing/why/content";
import { cn } from "@/lib/common/utils";
import { accentBlobs } from "@/components/landing/why/constants";

type WhyCardShellProps = {
  card: LandingWhyCard;
  className?: string;
  children: ReactNode;
  alignContent?: "center" | "start" | "fill";
};

export function WhyCardShell({
  card,
  className,
  children,
  alignContent = "center",
}: WhyCardShellProps) {
  return (
    <article
      className={cn(
        "relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-border/30",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-80",
          accentBlobs[card.accent],
        )}
        aria-hidden
      />
      <h3 className="relative z-10 mb-3.5 text-[15px] font-medium tracking-[-0.01em] text-foreground">
        {card.title}
      </h3>
      <div
        className={cn(
          "relative z-10 flex flex-col",
          alignContent === "fill" && "flex-1",
          alignContent === "start" && "justify-start",
          alignContent === "center" && "flex-1 justify-center",
        )}
      >
        {children}
      </div>
    </article>
  );
}
