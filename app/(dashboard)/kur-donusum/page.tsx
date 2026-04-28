"use client";

import { ArrowRightLeft, BadgeDollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FALLBACK_TL_PER_FOREIGN_UNIT } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type FxResponse = {
  quotes?: Record<string, number> | null;
  updatedAt?: string;
  error?: string;
};

function parseAmount(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const PRIORITY_CODES = ["TL", "USD", "EUR", "GBP"] as const;

function currencyLabel(code: string): string {
  if (code === "USD") return "Dolar";
  if (code === "EUR") return "Euro";
  if (code === "GBP") return "Sterlin";
  return code;
}

export default function CurrencyConverterPage() {
  const [amountText, setAmountText] = useState("1");
  const [fromCode, setFromCode] = useState("EUR");
  const [toCode, setToCode] = useState("TL");
  const [rates, setRates] = useState<Record<string, number>>(
    FALLBACK_TL_PER_FOREIGN_UNIT,
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/fx-prices");
        const data = (await res.json()) as FxResponse;
        if (cancelled) return;

        if (!res.ok || !data.quotes) {
          setLoadError(data.error ?? "Canlı kur verisi alınamadı.");
          return;
        }

        const merged = { ...FALLBACK_TL_PER_FOREIGN_UNIT };
        for (const [code, value] of Object.entries(data.quotes)) {
          if (
            typeof value === "number" &&
            Number.isFinite(value) &&
            value > 0
          ) {
            merged[code.trim().toUpperCase()] = value;
          }
        }
        merged.TL = 1;
        setRates(merged);
        setUpdatedAt(data.updatedAt ?? null);
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError("Ağ hatası nedeniyle canlı kurlar yüklenemedi.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const codes = useMemo(() => {
    const allCodes = Object.keys(rates).sort((a, b) => a.localeCompare(b));
    const prioritized = PRIORITY_CODES.filter((code) =>
      allCodes.includes(code),
    );
    const rest = allCodes.filter(
      (code) => !PRIORITY_CODES.includes(code as never),
    );
    return [...prioritized, ...rest];
  }, [rates]);

  useEffect(() => {
    if (!codes.includes(fromCode)) {
      setFromCode(codes[0] ?? "USD");
    }
    if (!codes.includes(toCode)) {
      setToCode(codes.find((c) => c !== fromCode) ?? codes[0] ?? "EUR");
    }
  }, [codes, fromCode, toCode]);

  function convert() {
    const amount = parseAmount(amountText);
    const fromRate = rates[fromCode] ?? 0;
    const toRate = rates[toCode] ?? 0;

    if (amount <= 0 || fromRate <= 0 || toRate <= 0) {
      setResult(0);
      return;
    }

    if (fromCode === toCode) {
      setResult(round2(amount));
      return;
    }

    const inTl = amount * fromRate;
    const converted = inTl / toRate;
    setResult(round2(converted));
  }

  function swapCurrencies() {
    setFromCode(toCode);
    setToCode(fromCode);
  }

  useEffect(() => {
    convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountText, fromCode, toCode, rates]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8.5rem)] max-w-2xl items-center px-4 py-6">
      <Card className="w-full overflow-hidden rounded-2xl border border-emerald-600/20 bg-linear-to-b from-[#f5fffa] via-[#eefcf5] to-[#eaf9f1] text-emerald-950 shadow-[0_18px_48px_rgba(16,185,129,0.10)] dark:border-emerald-500/18 dark:bg-linear-to-b dark:from-[#0b1410] dark:via-[#091210] dark:to-[#071110] dark:text-white dark:shadow-[0_24px_64px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 p-2.5 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/12 dark:text-emerald-300">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <h2 className="text-[22px] font-semibold tracking-tight text-emerald-900 dark:text-emerald-50">
              Kur Dönüşüm
            </h2>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45">
              Tutar
            </Label>
            <Input
              id="amount"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="h-13 rounded-xl border-emerald-600/20 bg-white/85 font-mono text-lg text-emerald-900 placeholder:text-emerald-700/40 focus-visible:border-emerald-500/45 focus-visible:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50 dark:placeholder:text-emerald-300/20 dark:focus-visible:border-emerald-400/45"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <div className="space-y-2">
              <Label className="text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45">
                Kaynak
              </Label>
              <Select value={fromCode} onValueChange={setFromCode}>
                <SelectTrigger className="h-12 rounded-xl border-emerald-600/20 bg-white/85 text-sm font-medium text-emerald-900 focus:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-emerald-600/20 bg-[#f3fbf6] text-emerald-900 dark:border-emerald-500/20 dark:bg-[#0f1f18] dark:text-emerald-100">
                  {codes.map((code) => (
                    <SelectItem
                      key={code}
                      value={code}
                      className="cursor-pointer text-emerald-900 dark:text-emerald-100"
                    >
                      {currencyLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={swapCurrencies}
              aria-label="Para birimlerini değiştir"
              className="h-12 w-12 justify-self-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 transition-transform hover:bg-emerald-500/18 active:rotate-180 active:scale-95 cursor-pointer dark:border-emerald-400/22 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <div className="-mt-5 space-y-2 sm:mt-0">
              <Label className="text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45">
                Hedef
              </Label>
              <Select value={toCode} onValueChange={setToCode}>
                <SelectTrigger className="h-12 rounded-xl border-emerald-600/20 bg-white/85 text-sm font-medium text-emerald-900 focus:ring-0 dark:border-emerald-500/15 dark:bg-white/4 dark:text-emerald-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-emerald-600/20 bg-[#f3fbf6] text-emerald-900 dark:border-emerald-500/20 dark:bg-[#0f1f18] dark:text-emerald-100">
                  {codes.map((code) => (
                    <SelectItem
                      key={code}
                      value={code}
                      className="cursor-pointer text-emerald-900 dark:text-emerald-100"
                    >
                      {currencyLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            onClick={convert}
            className="h-12 w-full rounded-xl bg-emerald-500 text-sm font-semibold tracking-wide text-white shadow-[0_8px_24px_rgba(16,185,129,0.22)] transition-all hover:bg-emerald-400 active:scale-98 cursor-pointer dark:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            Çevir
          </Button>

          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-600/20 bg-emerald-500/8 px-6 py-5 dark:border-emerald-500/18 dark:bg-emerald-500/6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/45">
                Sonuç
              </p>
              <p className="font-mono text-[28px] leading-none font-medium tracking-tight text-emerald-800 dark:text-emerald-200">
                {formatNumber(result)} {toCode}
              </p>
            </div>
            <div className="self-start rounded-lg border border-emerald-600/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300/70 lg:self-auto">
              1 {fromCode} ={" "}
              {formatNumber(rates[fromCode] / (rates[toCode] || 1))} {toCode}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 text-[11px] text-emerald-800/65 dark:text-emerald-300/28 lg:flex-row lg:items-center lg:gap-2">
            {loadError
              ? `${loadError} Yedek kurlar kullanılıyor.`
              : "Canlı döviz kurları kullanılmaktadır."}
            {updatedAt && (
              <span className="text-left lg:ml-auto lg:text-right">
                Son güncelleme: {new Date(updatedAt).toLocaleString("tr-TR")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
