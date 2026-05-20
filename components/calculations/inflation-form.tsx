"use client";

import { BadgePercent, Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calculateCpiEquivalent,
  formatCpiPeriod,
} from "@/lib/calculations/inflation";
import { TURKEY_CPI_DATA } from "@/lib/data/cpi-turkey";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatPercent,
  parseDecimal,
} from "./calculation-helpers";
import { NumberField, ResultHeadline, ResultRow } from "./interest-shared";

const SELECT_TRIGGER_CLASS =
  "h-12 cursor-pointer rounded-xl border-emerald-600/20 bg-white/85 text-sm font-medium text-emerald-900 focus:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50";
const SELECT_CONTENT_CLASS =
  "border-emerald-600/20 bg-[#f3fbf6] text-emerald-900 dark:border-emerald-500/20 dark:bg-[#0f1f18] dark:text-emerald-100";
const SELECT_ITEM_CLASS =
  "cursor-pointer text-emerald-900 dark:text-emerald-100";
const FIELD_LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45";

const MONTH_LABELS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

const AVAILABLE_YEARS = Array.from(
  new Set(TURKEY_CPI_DATA.map((record) => record.year)),
).sort((a, b) => a - b);

const YEAR_TO_MONTHS = new Map<number, Set<number>>();
for (const record of TURKEY_CPI_DATA) {
  const set = YEAR_TO_MONTHS.get(record.year) ?? new Set<number>();
  set.add(record.month);
  YEAR_TO_MONTHS.set(record.year, set);
}

const FIRST_RECORD = TURKEY_CPI_DATA[0];
const LAST_RECORD = TURKEY_CPI_DATA.at(-1);

function formatIndex(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

function getRecord(year: number, month: number) {
  return TURKEY_CPI_DATA.find(
    (record) => record.year === year && record.month === month,
  );
}

function PeriodSelect({
  idPrefix,
  label,
  year,
  month,
  onYearChange,
  onMonthChange,
}: {
  idPrefix: string;
  label: string;
  year: number;
  month: number;
  onYearChange: (next: number) => void;
  onMonthChange: (next: number) => void;
}) {
  const availableMonths = YEAR_TO_MONTHS.get(year) ?? new Set<number>();
  return (
    <div className="space-y-2 md:col-span-2">
      <Label className={FIELD_LABEL_CLASS}>{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Select
          value={String(year)}
          onValueChange={(next) => {
            const nextYear = Number(next);
            onYearChange(nextYear);
            const monthsForYear = YEAR_TO_MONTHS.get(nextYear);
            if (monthsForYear && !monthsForYear.has(month)) {
              const firstAvailable = Array.from(monthsForYear).sort(
                (a, b) => a - b,
              )[0];
              if (firstAvailable !== undefined) onMonthChange(firstAvailable);
            }
          }}
        >
          <SelectTrigger
            id={`${idPrefix}-year`}
            aria-label={`${label} yılı`}
            className={SELECT_TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            {AVAILABLE_YEARS.map((y) => (
              <SelectItem
                key={y}
                value={String(y)}
                className={SELECT_ITEM_CLASS}
              >
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(month)}
          onValueChange={(next) => onMonthChange(Number(next))}
        >
          <SelectTrigger
            id={`${idPrefix}-month`}
            aria-label={`${label} ayı`}
            className={SELECT_TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            {MONTH_LABELS.map((monthLabel, idx) => {
              const monthNumber = idx + 1;
              const enabled = availableMonths.has(monthNumber);
              return (
                <SelectItem
                  key={monthNumber}
                  value={String(monthNumber)}
                  disabled={!enabled}
                  className={SELECT_ITEM_CLASS}
                >
                  {monthLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function InflationForm() {
  const [amountText, setAmountText] = useState("");
  const [startYear, setStartYear] = useState(FIRST_RECORD?.year ?? 2005);
  const [startMonth, setStartMonth] = useState(FIRST_RECORD?.month ?? 1);
  const [endYear, setEndYear] = useState(LAST_RECORD?.year ?? 2026);
  const [endMonth, setEndMonth] = useState(LAST_RECORD?.month ?? 4);

  const amount = parseDecimal(amountText);

  const startRecord = getRecord(startYear, startMonth) ?? FIRST_RECORD;
  const endRecord = getRecord(endYear, endMonth) ?? LAST_RECORD;

  const result = useMemo(
    () =>
      calculateCpiEquivalent({
        amount,
        startIndex: startRecord?.index ?? 0,
        endIndex: endRecord?.index ?? 0,
      }),
    [amount, endRecord?.index, startRecord?.index],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="overflow-hidden border-emerald-600/20 bg-linear-to-b from-[#f5fffa] via-[#eefcf5] to-[#eaf9f1] text-emerald-950 shadow-[0_18px_48px_rgba(16,185,129,0.10)] dark:border-emerald-500/18 dark:bg-linear-to-b dark:from-[#0b1410] dark:via-[#091210] dark:to-[#071110] dark:text-white">
        <CardContent className="space-y-5 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 p-2.5 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-emerald-900 dark:text-emerald-50">
              Bilgileri Girin
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <NumberField
              id="inflation-amount"
              label="Tutar"
              value={amountText}
              onChange={setAmountText}
              placeholder="555.555"
              format="currency"
            />
            <div className="md:col-span-1" />
            <PeriodSelect
              idPrefix="inflation-start"
              label="Başlangıç dönemi"
              year={startYear}
              month={startMonth}
              onYearChange={setStartYear}
              onMonthChange={setStartMonth}
            />
            <PeriodSelect
              idPrefix="inflation-end"
              label="Bitiş dönemi"
              year={endYear}
              month={endMonth}
              onYearChange={setEndYear}
              onMonthChange={setEndMonth}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-emerald-600/20 bg-card/95 shadow-[0_18px_48px_rgba(16,185,129,0.08)] dark:border-emerald-500/18">
        <CardContent className="space-y-4 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 p-2.5 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300">
              <BadgePercent className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Sonuç</h2>
          </div>

          <div className="space-y-2">
            <ResultHeadline
              label="Bitiş dönemi eşdeğer tutar"
              value={formatCurrency(result.equivalentAmount)}
            />
            <div className="grid gap-2">
              <ResultRow
                label="Başlangıç tutarı"
                value={formatCurrency(amount)}
              />
              <ResultRow
                label="Tutar farkı"
                value={formatCurrency(result.differenceAmount)}
              />
              <ResultRow
                label="Enflasyon oranı"
                value={`%${formatPercent(result.inflationRatePercent)}`}
              />
              {startRecord && endRecord && (
                <>
                  <ResultRow
                    label={`${formatCpiPeriod(startRecord)} TÜFE`}
                    value={formatIndex(startRecord.index)}
                  />
                  <ResultRow
                    label={`${formatCpiPeriod(endRecord)} TÜFE`}
                    value={formatIndex(endRecord.index)}
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
