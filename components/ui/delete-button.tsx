"use client";

import * as React from "react";
import { cn } from "@/lib/common/utils";

export interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export const DeleteButton = React.forwardRef<
  HTMLButtonElement,
  DeleteButtonProps
>(
  (
    {
      className,
      label = "Sil",
      loading = false,
      loadingLabel = "Siliniyor…",
      disabled,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    const content = children ?? (loading ? loadingLabel : label);
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "group/del relative inline-flex h-9 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm outline-none transition-all duration-300 ease-out",
          "hover:-translate-y-0.5 hover:bg-destructive hover:shadow-lg hover:shadow-destructive/40",
          "focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:translate-y-0 active:scale-[0.97]",
          "disabled:pointer-events-none disabled:opacity-60",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out",
            "group-hover/del:translate-x-full",
          )}
          aria-hidden
        />
        <TrashIcon loading={loading} />
        <span className="relative z-10">{content}</span>
      </button>
    );
  },
);
DeleteButton.displayName = "DeleteButton";

export interface DeleteIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tooltip?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost" | "outline";
  loading?: boolean;
}

export const DeleteIconButton = React.forwardRef<
  HTMLButtonElement,
  DeleteIconButtonProps
>(
  (
    {
      className,
      label,
      tooltip,
      size = "md",
      variant = "ghost",
      loading = false,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const sizes = {
      sm: "h-8 w-8",
      md: "h-9 w-9",
      lg: "h-10 w-10",
    } as const;
    const variants = {
      solid:
        "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/30",
      ghost:
        "bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive",
      outline:
        "border border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10 hover:border-destructive",
    } as const;
    const tip = tooltip ?? label;
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        disabled={disabled || loading}
        className={cn(
          "group/delicon relative inline-flex cursor-pointer items-center justify-center rounded-md outline-none transition-all duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "hover:-translate-y-0.5 active:translate-y-0 active:scale-90",
          "disabled:pointer-events-none disabled:opacity-60",
          sizes[size],
          variants[variant],
          className,
        )}
        {...props}
      >
        <TrashIcon loading={loading} />
        {tip ? (
          <span
            className={cn(
              "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-all duration-200 ease-out",
              "group-hover/delicon:translate-y-0 group-hover/delicon:opacity-100",
              "group-focus-visible/delicon:translate-y-0 group-focus-visible/delicon:opacity-100",
            )}
            role="tooltip"
          >
            {tip}
          </span>
        ) : null}
      </button>
    );
  },
);
DeleteIconButton.displayName = "DeleteIconButton";

/**
 */
function TrashIcon({ loading }: { loading?: boolean }) {
  return (
    <span
      data-delete-icon
      className={cn(
        "relative inline-flex h-4 w-4 shrink-0 items-center justify-center",
        loading && "animate-pulse",
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-0 top-px h-4 w-4 origin-bottom-left transition-transform duration-300 ease-out group-hover/del:-translate-y-[2px] group-hover/del:-rotate-22 group-hover/delicon:-translate-y-[2px] group-hover/delicon:-rotate-22"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 origin-top transition-transform duration-300 ease-out group-hover/del:animate-[delete-shake_0.5s_ease-in-out_0.1s] group-hover/delicon:animate-[delete-shake_0.5s_ease-in-out_0.1s]"
      >
        <path d="M19 8l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>

      <span className="pointer-events-none absolute left-1/2 top-0 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-current opacity-0 group-hover/del:animate-[delete-crumb-fall_0.7s_ease-in_0.15s] group-hover/delicon:animate-[delete-crumb-fall_0.7s_ease-in_0.15s]" />
    </span>
  );
}
