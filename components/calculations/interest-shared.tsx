"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CompoundingFrequency,
  COMPOUNDING_OPTIONS,
  RATE_PERIOD_OPTIONS,
  RatePeriod,
  formatPercent,
  formatTrNumber,
} from "./calculation-helpers";

const FIELD_LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45";

const INPUT_CLASS =
  "h-12 rounded-xl border-emerald-600/20 bg-white/85 font-mono text-emerald-900 placeholder:text-emerald-700/40 focus-visible:border-emerald-500/45 focus-visible:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50";

const SELECT_TRIGGER_CLASS =
  "h-12 rounded-xl border-emerald-600/20 bg-white/85 text-sm font-medium text-emerald-900 focus:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50";

const SELECT_CONTENT_CLASS =
  "border-emerald-600/20 bg-[#f3fbf6] text-emerald-900 dark:border-emerald-500/20 dark:bg-[#0f1f18] dark:text-emerald-100";

const SELECT_ITEM_CLASS =
  "cursor-pointer text-emerald-900 dark:text-emerald-100";

export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = "decimal",
  hint,
  hintTone,
  format,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
  hint?: string;
  hintTone?: "default" | "warning";
  format?: "currency";
}) {
  const handleChange = (raw: string) => {
    if (format === "currency") {
      onChange(formatTrNumber(raw));
    } else {
      onChange(raw);
    }
  };
  const hintClass =
    hintTone === "warning"
      ? "text-xs font-medium text-rose-600 dark:text-rose-400"
      : "text-xs text-emerald-800/60 dark:text-emerald-300/35";
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export function RateInput({
  id,
  rateText,
  onRateChange,
  ratePeriod,
  onRatePeriodChange,
  annualRatePercent,
}: {
  id: string;
  rateText: string;
  onRateChange: (next: string) => void;
  ratePeriod: RatePeriod;
  onRatePeriodChange: (next: RatePeriod) => void;
  annualRatePercent: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={FIELD_LABEL_CLASS}>
        Faiz oranı (%)
      </Label>
      <div className="flex gap-2">
        <Select
          value={ratePeriod}
          onValueChange={(value) => onRatePeriodChange(value as RatePeriod)}
        >
          <SelectTrigger
            aria-label="Faiz oranı dönemi"
            className={`${SELECT_TRIGGER_CLASS} w-32 shrink-0`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            {RATE_PERIOD_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={SELECT_ITEM_CLASS}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          value={rateText}
          onChange={(e) => onRateChange(e.target.value)}
          inputMode="decimal"
          placeholder="45"
          className={`${INPUT_CLASS} flex-1`}
        />
      </div>
      {ratePeriod !== "yearly" && (
        <p className="text-xs text-emerald-800/60 dark:text-emerald-300/35">
          Yıllık karşılığı: %{formatPercent(annualRatePercent)}
        </p>
      )}
    </div>
  );
}

export function CompoundingFrequencyField({
  value,
  onChange,
}: {
  value: CompoundingFrequency;
  onChange: (next: CompoundingFrequency) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="compounding-frequency" className={FIELD_LABEL_CLASS}>
        Faizlendirme sıklığı
      </Label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as CompoundingFrequency)}
      >
        <SelectTrigger
          id="compounding-frequency"
          aria-label="Faizlendirme sıklığı"
          className={SELECT_TRIGGER_CLASS}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={SELECT_CONTENT_CLASS}>
          {COMPOUNDING_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={SELECT_ITEM_CLASS}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/60 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

export function ResultHeadline({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-5">
      <p className="text-[14px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
        {value}
      </p>
    </div>
  );
}
