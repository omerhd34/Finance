"use client";

import { BadgePercent, Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateSimpleInterest } from "@/lib/calculations/deposit-interest";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
  parseDecimal,
  RatePeriod,
  toAnnualRatePercent,
} from "./calculation-helpers";
import {
  NumberField,
  RateInput,
  ResultHeadline,
  ResultRow,
} from "./interest-shared";

export function SimpleInterestForm() {
  const [principalText, setPrincipalText] = useState("");
  const [rateText, setRateText] = useState("");
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>("yearly");
  const [termDaysText, setTermDaysText] = useState("");

  const principal = parseDecimal(principalText);
  const annualRatePercent = toAnnualRatePercent(
    parseDecimal(rateText),
    ratePeriod,
  );
  const termDays = Math.floor(parseDecimal(termDaysText));

  const result = useMemo(
    () =>
      calculateSimpleInterest({
        principal,
        annualRatePercent,
        termDays,
      }),
    [annualRatePercent, principal, termDays],
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
              id="simple-principal"
              label="Anapara"
              value={principalText}
              onChange={setPrincipalText}
              placeholder="100.000"
              format="currency"
            />
            <RateInput
              id="simple-rate"
              rateText={rateText}
              onRateChange={setRateText}
              ratePeriod={ratePeriod}
              onRatePeriodChange={setRatePeriod}
              annualRatePercent={annualRatePercent}
            />
            <NumberField
              id="simple-term-days"
              label="Vade günü"
              value={termDaysText}
              onChange={setTermDaysText}
              inputMode="numeric"
              placeholder="32"
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
              label="Vade sonu tutar"
              value={formatCurrency(result.maturityAmount)}
            />

            <div className="grid gap-2">
              <ResultRow
                label="Toplam faiz"
                value={formatCurrency(result.interest)}
              />
              <ResultRow
                label="Vade getirisi"
                value={`%${formatPercent(result.termReturnPercent)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
