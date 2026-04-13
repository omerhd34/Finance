"use client";

import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseYmd(s: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const parts = s.trim().split("-");
  if (parts.length !== 3) return undefined;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

export type DatePickerFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Boş tarihe izin verir; alt kısımda «Temizle» gösterir. */
  allowClear?: boolean;
};

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "gg.aa.yyyy",
  disabled,
  className,
  allowClear = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseYmd(value);

  function selectDate(d: Date | undefined) {
    if (!d) return;
    onChange(format(d, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-1 text-left text-sm text-foreground shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="min-w-0 truncate">
            {selected
              ? format(selected, "d MMMM yyyy", { locale: tr })
              : placeholder}
          </span>
          <CalendarIcon
            className="h-4 w-4 shrink-0 text-muted-foreground opacity-80"
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="overflow-hidden p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="w-[min(100vw-2rem,20rem)] p-2 pb-0">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => selectDate(d)}
            locale={tr}
            captionLayout="label"
            navLayout="around"
            startMonth={new Date(2000, 0)}
            endMonth={new Date(2040, 11)}
            defaultMonth={selected ?? new Date()}
            className="w-full"
          />
        </div>
        <div
          className={cn(
            "flex items-center gap-2 border-t border-border bg-muted/40 px-2 py-2",
            allowClear ? "justify-between" : "justify-end",
          )}
        >
          {allowClear ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-primary hover:text-primary"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Temizle
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-primary hover:text-primary"
            onClick={() => selectDate(new Date())}
          >
            Bugün
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
