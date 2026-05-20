"use client";

import { BadgePercent, Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calculateVat,
  COMMON_VAT_RATES,
  VatMode,
} from "@/lib/calculations/vat";
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

const CUSTOM_VALUE = "custom";

export function VatForm({ mode }: { mode: VatMode }) {
  const [amountText, setAmountText] = useState("");
  const [rateChoice, setRateChoice] = useState<string>("20");
  const [customRateText, setCustomRateText] = useState("");

  const amount = parseDecimal(amountText);
  const vatRatePercent =
    rateChoice === CUSTOM_VALUE
      ? parseDecimal(customRateText)
      : Number(rateChoice);

  const result = useMemo(
    () => calculateVat({ amount, vatRatePercent, mode }),
    [amount, vatRatePercent, mode],
  );

  const headlineLabel =
    mode === "exclusive" ? "KDV Dahil Tutar" : "KDV Hariç Tutar";
  const headlineValue =
    mode === "exclusive"
      ? formatCurrency(result.grossAmount)
      : formatCurrency(result.netAmount);

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
              id="vat-amount"
              label={
                mode === "exclusive" ? "KDV hariç tutar" : "KDV dahil tutar"
              }
              value={amountText}
              onChange={setAmountText}
              placeholder="10.000"
              format="currency"
            />
            <div className="space-y-2">
              <Label htmlFor="vat-rate" className={FIELD_LABEL_CLASS}>
                KDV oranı
              </Label>
              <Select value={rateChoice} onValueChange={setRateChoice}>
                <SelectTrigger
                  id="vat-rate"
                  aria-label="KDV oranı"
                  className={SELECT_TRIGGER_CLASS}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  {COMMON_VAT_RATES.map((rate) => (
                    <SelectItem
                      key={rate}
                      value={String(rate)}
                      className={SELECT_ITEM_CLASS}
                    >
                      %{rate}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value={CUSTOM_VALUE}
                    className={SELECT_ITEM_CLASS}
                  >
                    Özel oran
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rateChoice === CUSTOM_VALUE && (
              <NumberField
                id="vat-custom-rate"
                label="Özel KDV oranı (%)"
                value={customRateText}
                onChange={setCustomRateText}
                placeholder="20"
              />
            )}
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
            <ResultHeadline label={headlineLabel} value={headlineValue} />

            <div className="grid gap-2">
              {mode === "exclusive" ? (
                <ResultRow
                  label="KDV hariç tutar"
                  value={formatCurrency(result.netAmount)}
                />
              ) : (
                <ResultRow
                  label="KDV dahil tutar"
                  value={formatCurrency(result.grossAmount)}
                />
              )}
              <ResultRow
                label="KDV tutarı"
                value={formatCurrency(result.vatAmount)}
              />
              <ResultRow
                label="Uygulanan oran"
                value={`%${formatPercent(vatRatePercent)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
