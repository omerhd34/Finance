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
  calculatePrivatePension,
  DEFAULT_MONTHLY_GROSS_MINIMUM_WAGE,
  PensionExitType,
  PensionPaymentFrequency,
} from "@/lib/calculations/private-pension";
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
import {
  formatCurrency,
  formatPercent,
  parseDecimal,
} from "./calculation-helpers";
import { ExportTableButtons } from "./export-table-buttons";
import { NumberField, ResultHeadline, ResultRow } from "./interest-shared";
import { PensionBalanceChart } from "./pension-balance-chart";

const SELECT_TRIGGER_CLASS =
  "h-12 cursor-pointer rounded-xl border-emerald-600/20 bg-white/85 text-sm font-medium text-emerald-900 focus:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50";
const SELECT_CONTENT_CLASS =
  "border-emerald-600/20 bg-[#f3fbf6] text-emerald-900 dark:border-emerald-500/20 dark:bg-[#0f1f18] dark:text-emerald-100";
const SELECT_ITEM_CLASS =
  "cursor-pointer text-emerald-900 dark:text-emerald-100";
const FIELD_LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45";
const MONTH_NAMES = [
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
];
const BIRTH_YEAR_RANGE = 100;

const RETIREMENT_AGE_THRESHOLD = 56;
const MIN_YEARS_FOR_MATURED = 10;

const EXIT_TYPE_LABELS: Record<PensionExitType, string> = {
  early: "Erken çıkış (10 yıl öncesi)",
  matured: "10+ yıl, emekli olmadan",
  retired: "10+ yıl, emeklilik hakkıyla",
};

function detectExitType(years: number, retirementAge: number): PensionExitType {
  if (years >= MIN_YEARS_FOR_MATURED) {
    return retirementAge >= RETIREMENT_AGE_THRESHOLD ? "retired" : "matured";
  }
  return "early";
}

function calculateAgeFromParts(
  day: number,
  month: number,
  year: number,
  today: Date = new Date(),
): number {
  if (!day || !month || !year) return 0;
  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

function daysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

const PAYMENT_FREQUENCY_LABELS: Record<PensionPaymentFrequency, string> = {
  monthly: "Aylık",
  quarterly: "3 Aylık",
  semiannual: "6 Aylık",
  yearly: "Yıllık",
};

export function PrivatePensionForm() {
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [retirementAgeText, setRetirementAgeText] = useState("");
  const [paymentFrequency, setPaymentFrequency] =
    useState<PensionPaymentFrequency>("monthly");
  const [contributionText, setContributionText] = useState("");
  const [annualIncreaseText, setAnnualIncreaseText] = useState("");
  const [initialContributionText, setInitialContributionText] = useState("");
  const [annualReturnText, setAnnualReturnText] = useState("");
  const [fundExpenseText, setFundExpenseText] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: BIRTH_YEAR_RANGE + 1 },
        (_, idx) => currentYear - idx,
      ),
    [currentYear],
  );
  const dayCount = daysInMonth(Number(birthMonth), Number(birthYear));
  const dayOptions = useMemo(
    () => Array.from({ length: dayCount }, (_, idx) => idx + 1),
    [dayCount],
  );

  const handleMonthChange = (value: string) => {
    setBirthMonth(value);
    const nextMax = daysInMonth(Number(value), Number(birthYear));
    if (birthDay && Number(birthDay) > nextMax) {
      setBirthDay("");
    }
  };

  const handleYearChange = (value: string) => {
    setBirthYear(value);
    const nextMax = daysInMonth(Number(birthMonth), Number(value));
    if (birthDay && Number(birthDay) > nextMax) {
      setBirthDay("");
    }
  };

  const age = useMemo(
    () =>
      calculateAgeFromParts(
        Number(birthDay),
        Number(birthMonth),
        Number(birthYear),
      ),
    [birthDay, birthMonth, birthYear],
  );
  const retirementAge = Math.max(
    0,
    Math.floor(parseDecimal(retirementAgeText)),
  );
  const years = Math.max(0, retirementAge - age);
  const contributionAmount = parseDecimal(contributionText);
  const initialContribution = parseDecimal(initialContributionText);
  const annualContributionIncreasePercent = parseDecimal(annualIncreaseText);
  const annualReturnPercent = parseDecimal(annualReturnText);
  const fundExpensePercent = parseDecimal(fundExpenseText);
  const exitType = detectExitType(years, retirementAge);

  const result = useMemo(
    () =>
      calculatePrivatePension({
        contributionAmount,
        paymentFrequency,
        initialContribution,
        annualContributionIncreasePercent,
        years,
        annualReturnPercent,
        fundExpensePercent,
        monthlyMinimumWageGross: DEFAULT_MONTHLY_GROSS_MINIMUM_WAGE,
        exitType,
      }),
    [
      annualContributionIncreasePercent,
      annualReturnPercent,
      contributionAmount,
      exitType,
      fundExpensePercent,
      initialContribution,
      paymentFrequency,
      years,
    ],
  );

  const hasSchedule = result.schedule.length > 0;

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
              <Label className={FIELD_LABEL_CLASS}>Doğum tarihiniz</Label>
              <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger
                    aria-label="Doğum günü"
                    className={SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Gün" />
                  </SelectTrigger>
                  <SelectContent className={`${SELECT_CONTENT_CLASS} max-h-72`}>
                    {dayOptions.map((d) => (
                      <SelectItem
                        key={d}
                        value={String(d)}
                        className={SELECT_ITEM_CLASS}
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={birthMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger
                    aria-label="Doğum ayı"
                    className={SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Ay" />
                  </SelectTrigger>
                  <SelectContent className={`${SELECT_CONTENT_CLASS} max-h-72`}>
                    {MONTH_NAMES.map((name, idx) => (
                      <SelectItem
                        key={name}
                        value={String(idx + 1)}
                        className={SELECT_ITEM_CLASS}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={birthYear} onValueChange={handleYearChange}>
                  <SelectTrigger
                    aria-label="Doğum yılı"
                    className={SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Yıl" />
                  </SelectTrigger>
                  <SelectContent className={`${SELECT_CONTENT_CLASS} max-h-72`}>
                    {yearOptions.map((y) => (
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
              </div>
              <p className="text-xs text-emerald-800/60 dark:text-emerald-300/35">
                {age > 0 ? `Mevcut yaşınız: ${age}` : "Gün, ay ve yıl seçin."}
              </p>
            </div>
            <NumberField
              id="pension-retirement-age"
              label="Emekli olmayı planladığınız yaş"
              value={retirementAgeText}
              onChange={setRetirementAgeText}
              inputMode="numeric"
              placeholder="56"
              hint={
                retirementAge > 0 && retirementAge < 56
                  ? "Emeklilik yaşı en az 56 olmalıdır."
                  : "BES emeklilik hakkı için en az 10 yıl sistemde kalınmalı ve yaş 56 olmalıdır."
              }
              hintTone={
                retirementAge > 0 && retirementAge < 56 ? "warning" : "default"
              }
            />
            <div className="space-y-2">
              <Label htmlFor="pension-frequency" className={FIELD_LABEL_CLASS}>
                Ödeme sıklığınız
              </Label>
              <Select
                value={paymentFrequency}
                onValueChange={(next) =>
                  setPaymentFrequency(next as PensionPaymentFrequency)
                }
              >
                <SelectTrigger
                  id="pension-frequency"
                  aria-label="Ödeme sıklığınız"
                  className={SELECT_TRIGGER_CLASS}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  {Object.entries(PAYMENT_FREQUENCY_LABELS).map(
                    ([value, label]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className={SELECT_ITEM_CLASS}
                      >
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              id="pension-contribution"
              label="Katkı payınız"
              value={contributionText}
              onChange={setContributionText}
              placeholder="2.500"
              format="currency"
              hint="Seçtiğiniz ödeme sıklığında ödeyeceğiniz tutar."
            />
            <NumberField
              id="pension-increase"
              label="Katkı payı yıllık artış oranınız (%)"
              value={annualIncreaseText}
              onChange={setAnnualIncreaseText}
              placeholder="10"
              hint={
                annualContributionIncreasePercent > 10
                  ? "Yıllık artış oranı en fazla %10 olabilir."
                  : "En fazla %10 kabul edilir."
              }
              hintTone={
                annualContributionIncreasePercent > 10 ? "warning" : "default"
              }
            />
            <NumberField
              id="pension-return"
              label="Yıllık nominal getiri (%)"
              value={annualReturnText}
              onChange={setAnnualReturnText}
              placeholder="35"
              hint="TGK düşülmeden önceki brüt yıllık getiri."
            />
            <NumberField
              id="pension-fund-expense"
              label="Fon toplam gider kesintisi (%)"
              value={fundExpenseText}
              onChange={setFundExpenseText}
              placeholder="1,91"
              hint="Brüt getiriden düşülür; boşsa 0 kabul edilir."
            />
            <NumberField
              id="pension-initial"
              label="Başlangıç katkı payı tutarınız"
              value={initialContributionText}
              onChange={setInitialContributionText}
              placeholder="25.000"
              format="currency"
              hint="Düzenli ödemeler dışında sisteme girişte yatırılan tutar."
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
              label="Net ele geçecek tutar"
              value={formatCurrency(result.netBalance)}
            />
            <div className="grid gap-2">
              <ResultRow
                label="Çıkış senaryosu"
                value={EXIT_TYPE_LABELS[exitType]}
              />
              <ResultRow
                label="Toplam katkı"
                value={formatCurrency(result.totalContribution)}
              />
              <ResultRow label="Birikim süresi" value={`${years} yıl`} />
              <ResultRow
                label="Devlet katkısı"
                value={formatCurrency(result.totalStateBonus)}
              />
              {result.vestingPercent < 1 && (
                <ResultRow
                  label="Hak ediş oranı"
                  value={`%${formatPercent(result.vestingPercent * 100, 0)}`}
                />
              )}
              <ResultRow
                label="Toplam fon getirisi"
                value={formatCurrency(result.totalInterest)}
              />
              <ResultRow
                label={`Stopaj kesintisi (%${formatPercent(result.withholdingPercent * 100, 0)})`}
                value={`-${formatCurrency(result.withholdingAmount)}`}
              />
              <ResultRow
                label="Brüt birikim"
                value={formatCurrency(result.grossBalance)}
              />
            </div>
          </div>

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
                    Yıllık Birikim Planı
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {result.schedule.length} yıllık BES birikim planı
                  </p>
                </div>
              </div>
              <ExportTableButtons
                data={{
                  title: "BES Yıllık Birikim Planı",
                  filename: "bes-birikim-plani",
                  sheetName: "BES Birikim",
                  meta: [
                    {
                      label: "Toplam katkı",
                      value: formatCurrency(result.totalContribution),
                    },
                    {
                      label: "Brüt birikim",
                      value: formatCurrency(result.grossBalance),
                    },
                    {
                      label: "Net ele geçecek",
                      value: formatCurrency(result.netBalance),
                    },
                  ],
                  columns: [
                    { header: "Yıl", key: "yearLabel", align: "left" },
                    { header: "Yaş", key: "ageLabel", align: "left" },
                    {
                      header: "Yatırılan",
                      key: "contribution",
                      align: "right",
                      format: (v) => formatCurrency(Number(v)),
                    },
                    {
                      header: "Devlet Katkısı",
                      key: "stateBonus",
                      align: "right",
                      format: (v) => formatCurrency(Number(v)),
                    },
                    {
                      header: "Getiri",
                      key: "interest",
                      align: "right",
                      format: (v) => formatCurrency(Number(v)),
                    },
                    {
                      header: "Toplam Birikim",
                      key: "totalBalance",
                      align: "right",
                      format: (v) => formatCurrency(Number(v)),
                    },
                  ],
                  rows: result.schedule.map((row) => ({
                    yearLabel: `${row.year}. yıl`,
                    ageLabel: age > 0 ? `${age + row.year} yaş` : "—",
                    contribution: row.contribution,
                    stateBonus: row.stateBonus,
                    interest: row.interest,
                    totalBalance: row.totalBalance,
                  })),
                }}
              />
            </div>
            <div className="rounded-xl border border-border/70 bg-background/40 p-4">
              <PensionBalanceChart
                schedule={result.schedule}
                startingAge={age}
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-px whitespace-nowrap px-3 py-2 text-left">
                      Yıl
                    </th>
                    <th className="w-px whitespace-nowrap px-3 py-2 text-left">
                      Yaş
                    </th>
                    <th className="px-3 py-2 text-right">Yatırılan</th>
                    <th className="px-3 py-2 text-right">Devlet Katkısı</th>
                    <th className="px-3 py-2 text-right">Getiri</th>
                    <th className="px-3 py-2 text-right">Toplam Birikim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[12.5px]">
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/30">
                      <td className="w-px whitespace-nowrap px-3 py-2 text-left text-muted-foreground">
                        {row.year}. yıl
                      </td>
                      <td className="w-px whitespace-nowrap px-3 py-2 text-left text-muted-foreground">
                        {age > 0 ? `${age + row.year} yaş` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.contribution)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.stateBonus)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.totalBalance)}
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
