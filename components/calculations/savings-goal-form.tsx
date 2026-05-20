"use client";

import {
  BadgePercent,
  Calculator,
  ChevronDown,
  ChevronUp,
  ListOrdered,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildSavingsSchedule,
  calculateDuration,
  calculateFutureValue,
  calculateRequiredContribution,
  FREQUENCY_LABELS,
  MONTHS_PER_PERIOD,
  PERIOD_UNIT_LABELS,
  SavingsFrequency,
  SavingsMode,
} from "@/lib/calculations/savings-goal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, parseDecimal } from "./calculation-helpers";
import { ExportTableButtons } from "./export-table-buttons";
import { NumberField, ResultHeadline, ResultRow } from "./interest-shared";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR");

function periodLabelForRow(periodNo: number, frequency: SavingsFrequency) {
  const unit =
    frequency === "weekly"
      ? "hafta"
      : frequency === "monthly"
        ? "ay"
        : frequency === "yearly"
          ? "yıl"
          : "dönem";
  return `${periodNo}. ${unit}`;
}

const SELECT_TRIGGER_CLASS =
  "h-12 cursor-pointer rounded-xl border-emerald-600/20 bg-white/85 text-sm font-medium text-emerald-900 focus:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50";
const SELECT_CONTENT_CLASS =
  "border-emerald-600/20 bg-[#f3fbf6] text-emerald-900 dark:border-emerald-500/20 dark:bg-[#0f1f18] dark:text-emerald-100";
const SELECT_ITEM_CLASS =
  "cursor-pointer text-emerald-900 dark:text-emerald-100";
const FIELD_LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45";

const FREQUENCIES: SavingsFrequency[] = [
  "weekly",
  "monthly",
  "quarterly",
  "semiannual",
  "ninemonthly",
  "yearly",
];

const PERIOD_PLACEHOLDER: Record<SavingsFrequency, string> = {
  weekly: "104",
  monthly: "24",
  quarterly: "8",
  semiannual: "4",
  ninemonthly: "3",
  yearly: "5",
};

function formatPeriodCount(periods: number, frequency: SavingsFrequency) {
  if (!Number.isFinite(periods) || periods <= 0) {
    return `0 ${PERIOD_UNIT_LABELS[frequency]}`;
  }

  const unit = PERIOD_UNIT_LABELS[frequency];
  const rounded = Math.ceil(periods);
  const formatted = new Intl.NumberFormat("tr-TR").format(rounded);

  if (frequency === "weekly") {
    if (rounded < 52) return `${formatted} hafta`;
    const years = Math.floor(rounded / 52);
    const weeks = rounded % 52;
    const tail = weeks > 0 ? ` ${weeks} hafta` : "";
    return `${formatted} hafta (${years} yıl${tail})`;
  }

  if (frequency === "yearly") {
    return `${formatted} yıl`;
  }

  const monthsPerPeriod = MONTHS_PER_PERIOD[frequency];
  const totalMonths = rounded * monthsPerPeriod;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (frequency === "monthly") {
    if (rounded < 12) return `${formatted} ay`;
    const tail = months > 0 ? ` ${months} ay` : "";
    return `${formatted} ay (${years} yıl${tail})`;
  }

  if (years > 0) {
    const tail = months > 0 ? ` ${months} ay` : "";
    return `${formatted} ${unit} (${years} yıl${tail})`;
  }
  return `${formatted} ${unit} (${totalMonths} ay)`;
}

export function SavingsGoalForm({ mode }: { mode: SavingsMode }) {
  const [frequency, setFrequency] = useState<SavingsFrequency>("monthly");
  const [initialAmountText, setInitialAmountText] = useState("");
  const [contributionText, setContributionText] = useState("");
  const [targetAmountText, setTargetAmountText] = useState("");
  const [periodsText, setPeriodsText] = useState("");
  const [annualReturnText, setAnnualReturnText] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const initialAmount = parseDecimal(initialAmountText);
  const contribution = parseDecimal(contributionText);
  const targetAmount = parseDecimal(targetAmountText);
  const periods = Math.max(0, Math.floor(parseDecimal(periodsText)));
  const annualReturnPercent = parseDecimal(annualReturnText);

  const futureResult = useMemo(
    () =>
      calculateFutureValue({
        initialAmount,
        contribution,
        annualReturnPercent,
        periods,
        frequency,
      }),
    [annualReturnPercent, contribution, frequency, initialAmount, periods],
  );

  const durationResult = useMemo(
    () =>
      calculateDuration({
        initialAmount,
        contribution,
        annualReturnPercent,
        targetAmount,
        frequency,
      }),
    [annualReturnPercent, contribution, frequency, initialAmount, targetAmount],
  );

  const contributionResult = useMemo(
    () =>
      calculateRequiredContribution({
        initialAmount,
        targetAmount,
        annualReturnPercent,
        periods,
        frequency,
      }),
    [annualReturnPercent, frequency, initialAmount, periods, targetAmount],
  );

  const periodLabel = `Birikim süresi (${PERIOD_UNIT_LABELS[frequency]})`;
  const contributionLabel = `${FREQUENCY_LABELS[frequency]} birikim`;

  const showContributionInput = mode !== "contribution";
  const showTargetInput = mode !== "future-value";
  const showPeriodsInput = mode !== "duration";

  const schedulePeriods =
    mode === "duration"
      ? durationResult.reached
        ? Math.ceil(durationResult.periods)
        : 0
      : periods;
  const scheduleContribution =
    mode === "contribution" ? contributionResult.contribution : contribution;

  const schedule = useMemo(
    () =>
      buildSavingsSchedule({
        initialAmount,
        contribution: scheduleContribution,
        annualReturnPercent,
        periods: schedulePeriods,
        frequency,
      }),
    [
      annualReturnPercent,
      frequency,
      initialAmount,
      scheduleContribution,
      schedulePeriods,
    ],
  );

  const hasSchedule = mode !== "contribution" && schedule.length > 0;

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
            <div className="space-y-2">
              <Label htmlFor="savings-frequency" className={FIELD_LABEL_CLASS}>
                Birikim sıklığı
              </Label>
              <Select
                value={frequency}
                onValueChange={(next) => setFrequency(next as SavingsFrequency)}
              >
                <SelectTrigger
                  id="savings-frequency"
                  aria-label="Birikim sıklığı"
                  className={SELECT_TRIGGER_CLASS}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem
                      key={freq}
                      value={freq}
                      className={SELECT_ITEM_CLASS}
                    >
                      {FREQUENCY_LABELS[freq]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <NumberField
              id="savings-initial"
              label="Mevcut birikim (TL)"
              value={initialAmountText}
              onChange={setInitialAmountText}
              placeholder="10.000"
              format="currency"
            />

            {showContributionInput && (
              <NumberField
                id="savings-contribution"
                label={contributionLabel}
                value={contributionText}
                onChange={setContributionText}
                placeholder="1.500"
                format="currency"
              />
            )}

            {showTargetInput && (
              <NumberField
                id="savings-target"
                label="Hedef birikim tutarı (TL)"
                value={targetAmountText}
                onChange={setTargetAmountText}
                placeholder="500.000"
                format="currency"
              />
            )}

            {showPeriodsInput && (
              <NumberField
                id="savings-periods"
                label={periodLabel}
                value={periodsText}
                onChange={setPeriodsText}
                inputMode="numeric"
                placeholder={PERIOD_PLACEHOLDER[frequency]}
              />
            )}

            <NumberField
              id="savings-return"
              label="Yıllık reel getiri (%)"
              value={annualReturnText}
              onChange={setAnnualReturnText}
              placeholder="4,5"
              hint="İsteğe bağlı — boş bırakılırsa %0 kabul edilir."
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

          {mode === "future-value" && (
            <div className="space-y-2">
              <ResultHeadline
                label="Vade sonu toplam birikim"
                value={formatCurrency(futureResult.futureValue)}
              />
              <div className="grid gap-2">
                <ResultRow
                  label="Toplam yatırılan"
                  value={formatCurrency(futureResult.totalContributed)}
                />
                <ResultRow
                  label="Toplam reel getiri"
                  value={formatCurrency(
                    Math.max(0, futureResult.totalInterest),
                  )}
                />
                <ResultRow
                  label="Birikim süresi"
                  value={formatPeriodCount(periods, frequency)}
                />
              </div>
            </div>
          )}

          {mode === "duration" && (
            <div className="space-y-2">
              <ResultHeadline
                label="Hedefe ulaşma süresi"
                value={
                  durationResult.reached
                    ? formatPeriodCount(durationResult.periods, frequency)
                    : "Ulaşılamıyor"
                }
              />
              <div className="grid gap-2">
                <ResultRow
                  label="Toplam yatırılan"
                  value={formatCurrency(durationResult.totalContributed)}
                />
                <ResultRow
                  label="Toplam reel getiri"
                  value={formatCurrency(
                    Math.max(0, durationResult.totalInterest),
                  )}
                />
                {!durationResult.reached && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Girilen düzenli tasarruf ve getiri ile hedefe ulaşılamıyor.
                    Tasarruf miktarını veya getiri oranını artırın.
                  </p>
                )}
              </div>
            </div>
          )}

          {mode === "contribution" && (
            <div className="space-y-2">
              <ResultHeadline
                label={`Gerekli ${FREQUENCY_LABELS[frequency].toLowerCase()} birikim`}
                value={formatCurrency(contributionResult.contribution)}
              />
              <div className="grid gap-2">
                <ResultRow
                  label="Toplam yatırılan"
                  value={formatCurrency(contributionResult.totalContributed)}
                />
                <ResultRow
                  label="Toplam reel getiri"
                  value={formatCurrency(
                    Math.max(0, contributionResult.totalInterest),
                  )}
                />
                <ResultRow
                  label="Birikim süresi"
                  value={formatPeriodCount(periods, frequency)}
                />
              </div>
            </div>
          )}

          {hasSchedule && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSchedule((prev) => !prev)}
              className="w-full cursor-pointer gap-2 border-emerald-500/30 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-800 dark:border-emerald-500/25 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              <ListOrdered className="h-4 w-4" />
              {showSchedule ? "Birikim planını gizle" : "Birikim planını gör"}
              {showSchedule ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {hasSchedule && showSchedule && (
        <Card className="overflow-hidden border-emerald-600/20 bg-card/95 shadow-[0_18px_48px_rgba(16,185,129,0.08)] dark:border-emerald-500/18 lg:col-span-2">
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 p-2.5 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300">
                  <ListOrdered className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Birikim Planı
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {schedule.length} dönemli{" "}
                    {FREQUENCY_LABELS[frequency].toLowerCase()} birikim planı
                  </p>
                </div>
              </div>
              <ExportTableButtons
                data={{
                  title: `Birikim Planı (${FREQUENCY_LABELS[frequency]})`,
                  filename: "birikim-plani",
                  sheetName: "Birikim",
                  columns: [
                    { header: "Dönem", key: "periodLabel", align: "left" },
                    { header: "Tarih", key: "dateLabel", align: "left" },
                    { header: "Anapara", key: "openingBalance", align: "right", format: (v) => formatCurrency(Number(v)) },
                    { header: "Reel Getiri", key: "interest", align: "right", format: (v) => formatCurrency(Number(v)) },
                    { header: "Birikim", key: "contribution", align: "right", format: (v) => formatCurrency(Number(v)) },
                    { header: "Toplam Varlık", key: "closingBalance", align: "right", format: (v) => formatCurrency(Number(v)) },
                  ],
                  rows: schedule.map((row) => ({
                    periodLabel: periodLabelForRow(row.periodNo, frequency),
                    dateLabel: DATE_FORMATTER.format(row.date),
                    openingBalance: row.openingBalance,
                    interest: row.interest,
                    contribution: row.contribution,
                    closingBalance: row.closingBalance,
                  })),
                }}
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-px whitespace-nowrap px-3 py-2 text-left">
                      Dönem
                    </th>
                    <th className="w-px whitespace-nowrap px-3 py-2 text-left">
                      Tarih
                    </th>
                    <th className="px-3 py-2 text-right">Anapara</th>
                    <th className="px-3 py-2 text-right">Reel Getiri</th>
                    <th className="px-3 py-2 text-right">Birikim</th>
                    <th className="px-3 py-2 text-right">Toplam Varlık</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[12.5px]">
                  {schedule.map((row) => (
                    <tr key={row.periodNo} className="hover:bg-muted/30">
                      <td className="w-px whitespace-nowrap px-3 py-2 text-left text-muted-foreground">
                        {periodLabelForRow(row.periodNo, frequency)}
                      </td>
                      <td className="w-px whitespace-nowrap px-3 py-2 text-left text-muted-foreground">
                        {DATE_FORMATTER.format(row.date)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.openingBalance)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.contribution)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.closingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
