"use client";

import {
  BadgePercent,
  Calculator,
  ChevronDown,
  ChevronUp,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import {
  calculateLoanInstallment,
  LOAN_TAX_DEFAULTS,
  LoanType,
} from "@/lib/calculations/loan-installment";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
  parseDecimal,
} from "./calculation-helpers";
import { ExportTableButtons } from "./export-table-buttons";
import { NumberField, ResultHeadline, ResultRow } from "./interest-shared";

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  housing: "Konut Kredisi",
  vehicle: "Taşıt Kredisi",
  consumer: "İhtiyaç Kredisi",
};

const VEHICLE_LOAN_MIN = 5_000;
const VEHICLE_LOAN_MAX = 400_000;

const PRINCIPAL_PLACEHOLDER: Record<LoanType, string> = {
  consumer: "100.000",
  housing: "1.500.000",
  vehicle: "400.000",
};

const TERM_MONTHS_PLACEHOLDER: Record<LoanType, string> = {
  consumer: "24",
  housing: "120",
  vehicle: "48",
};

const RATE_PLACEHOLDER: Record<LoanType, string> = {
  consumer: "4,99",
  housing: "2,79",
  vehicle: "4,49",
};

export function LoanForm({ loanType }: { loanType: LoanType }) {
  const taxDefaults = LOAN_TAX_DEFAULTS[loanType];

  const [principalText, setPrincipalText] = useState("");
  const [monthlyRateText, setMonthlyRateText] = useState("");
  const [termMonthsText, setTermMonthsText] = useState("");
  const [appraisalFeeText, setAppraisalFeeText] = useState("");
  const [mortgageFeeText, setMortgageFeeText] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const principal = parseDecimal(principalText);
  const monthlyRatePercent = parseDecimal(monthlyRateText);
  const annualRatePercent = monthlyRatePercent * 12;
  const termMonths = Math.floor(parseDecimal(termMonthsText));
  const kkdfPercent = taxDefaults.kkdfPercent;
  const bsmvPercent = taxDefaults.bsmvPercent;
  const appraisalFee =
    loanType === "housing" ? parseDecimal(appraisalFeeText) : 0;
  const mortgageFee =
    loanType === "housing" ? parseDecimal(mortgageFeeText) : 0;

  const result = useMemo(
    () =>
      calculateLoanInstallment({
        principal,
        annualRatePercent,
        termMonths,
        kkdfPercent,
        bsmvPercent,
        appraisalFee,
        mortgageFee,
      }),
    [
      annualRatePercent,
      appraisalFee,
      bsmvPercent,
      kkdfPercent,
      mortgageFee,
      principal,
      termMonths,
    ],
  );

  const hasTaxes = kkdfPercent > 0 || bsmvPercent > 0;

  const hasSchedule = result.schedule.length > 0;

  return (
    <div className="space-y-5">
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
                id="loan-principal"
                label="Kredi tutarı"
                value={principalText}
                onChange={setPrincipalText}
                placeholder={PRINCIPAL_PLACEHOLDER[loanType]}
                format="currency"
                hint={
                  loanType === "vehicle"
                    ? principal > 0 &&
                      (principal < VEHICLE_LOAN_MIN ||
                        principal > VEHICLE_LOAN_MAX)
                      ? `Bankalar taşıt kredisini 5.000 - 400.000 TL arasında kullandırıyor. Lütfen bu aralıkta bir tutar girin.`
                      : ""
                    : undefined
                }
                hintTone={
                  loanType === "vehicle" &&
                  principal > 0 &&
                  (principal < VEHICLE_LOAN_MIN || principal > VEHICLE_LOAN_MAX)
                    ? "warning"
                    : undefined
                }
              />
              <NumberField
                id="loan-rate"
                label="Aylık faiz oranı (%)"
                value={monthlyRateText}
                onChange={setMonthlyRateText}
                placeholder={RATE_PLACEHOLDER[loanType]}
              />
              <NumberField
                id="loan-term-months"
                label="Vade (ay)"
                value={termMonthsText}
                onChange={setTermMonthsText}
                inputMode="numeric"
                placeholder={TERM_MONTHS_PLACEHOLDER[loanType]}
                hint={
                  loanType === "vehicle"
                    ? termMonths > 48
                      ? "400.000 TL ve altı kredilerde en fazla 48 ay vade uygulanır."
                      : ""
                    : undefined
                }
                hintTone={
                  loanType === "vehicle" && termMonths > 48
                    ? "warning"
                    : undefined
                }
              />
              {loanType === "housing" && (
                <>
                  <NumberField
                    id="loan-appraisal-fee"
                    label="Ekspertiz ücreti (TL)"
                    value={appraisalFeeText}
                    onChange={setAppraisalFeeText}
                    placeholder="10.000"
                    format="currency"
                  />
                  <NumberField
                    id="loan-mortgage-fee"
                    label="İpotek ücreti (TL)"
                    value={mortgageFeeText}
                    onChange={setMortgageFeeText}
                    placeholder="3.750"
                    format="currency"
                  />
                </>
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
              <ResultHeadline
                label="Aylık taksit"
                value={formatCurrency(result.monthlyPayment)}
              />

              <div className="grid gap-2">
                <ResultRow
                  label="Toplam faiz"
                  value={formatCurrency(
                    Math.max(0, result.totalInstallments - principal),
                  )}
                />
                <ResultRow
                  label="Toplam ödeme"
                  value={formatCurrency(result.totalPayment)}
                />
                <ResultRow
                  label="Yıllık maliyet oranı"
                  value={`%${formatPercent(result.effectiveAnnualRatePercent, 4)}`}
                />
                {appraisalFee > 0 && (
                  <ResultRow
                    label="Ekspertiz ücreti"
                    value={formatCurrency(appraisalFee)}
                  />
                )}
                {mortgageFee > 0 && (
                  <ResultRow
                    label="İpotek ücreti"
                    value={formatCurrency(mortgageFee)}
                  />
                )}
                {result.totalFees > 0 && (
                  <ResultRow
                    label="Ücretler toplamı"
                    value={formatCurrency(result.totalFees)}
                  />
                )}
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
                {showSchedule ? "Ödeme planını gizle" : "Ödeme planını gör"}
                {showSchedule ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {hasSchedule && showSchedule && (
        <Card className="overflow-hidden border-emerald-600/20 bg-card/95 shadow-[0_18px_48px_rgba(16,185,129,0.08)] dark:border-emerald-500/18">
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 p-2.5 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300">
                  <ListOrdered className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Ödeme Planı
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {result.schedule.length} aylık anüite planı
                  </p>
                </div>
              </div>
              <ExportTableButtons
                data={{
                  title: `${LOAN_TYPE_LABELS[loanType]} Ödeme Planı`,
                  filename: `${loanType}-odeme-plani`,
                  sheetName: "Ödeme Planı",
                  columns: [
                    { header: "Vade (Ay)", key: "installmentNo", align: "left" },
                    { header: "Taksit", key: "installmentAmount", align: "right", format: (v) => formatCurrency(Number(v)) },
                    { header: "Anapara", key: "principalPaid", align: "right", format: (v) => formatCurrency(Number(v)) },
                    { header: "Faiz", key: "interestPaid", align: "right", format: (v) => formatCurrency(Number(v)) },
                    ...(hasTaxes
                      ? [
                          { header: "KKDF", key: "kkdfPaid", align: "right" as const, format: (v: unknown) => formatCurrency(Number(v)) },
                          { header: "BSMV", key: "bsmvPaid", align: "right" as const, format: (v: unknown) => formatCurrency(Number(v)) },
                        ]
                      : []),
                    { header: "Bakiye", key: "remainingPrincipal", align: "right", format: (v) => formatCurrency(Number(v)) },
                  ],
                  rows: result.schedule.map((row) => ({
                    installmentNo: row.installmentNo,
                    installmentAmount: row.installmentAmount,
                    principalPaid: row.principalPaid,
                    interestPaid: row.interestPaid,
                    kkdfPaid: row.kkdfPaid,
                    bsmvPaid: row.bsmvPaid,
                    remainingPrincipal: row.remainingPrincipal,
                  })),
                }}
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Vade (Ay)</th>
                    <th className="px-3 py-2 text-right">Taksit</th>
                    <th className="px-3 py-2 text-right">Anapara</th>
                    <th className="px-3 py-2 text-right">Faiz</th>
                    {hasTaxes && (
                      <>
                        <th className="px-3 py-2 text-right">KKDF</th>
                        <th className="px-3 py-2 text-right">BSMV</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-right">Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[12.5px]">
                  {result.schedule.map((row) => (
                    <tr key={row.installmentNo} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-left text-muted-foreground">
                        {row.installmentNo}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.installmentAmount)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.principalPaid)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.interestPaid)}
                      </td>
                      {hasTaxes && (
                        <>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.kkdfPaid)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.bsmvPaid)}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(row.remainingPrincipal)}
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
