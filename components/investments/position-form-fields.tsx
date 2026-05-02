"use client";

import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  displayAmountToTry,
  normalizeUserCurrency,
  tryAmountToDisplay,
  type UserDisplayCurrency,
} from "@/lib/common/currency";
import { cn, sentenceCaseFirstTr } from "@/lib/common/utils";
import { useCommodityLiveQuotes } from "@/hooks/use-commodity-live-quotes";
import { useCryptoLiveQuotes } from "@/hooks/use-crypto-live-quotes";
import { useCurrencySymbols } from "@/hooks/use-currency-symbols";
import { useFxLiveQuotes } from "@/hooks/use-fx-live-quotes";
import { useGoldLivePrices } from "@/hooks/use-gold-live-prices";
import { usePlatinumLivePrices } from "@/hooks/use-platinum-live-prices";
import { useSilverLivePrices } from "@/hooks/use-silver-live-prices";
import { useStockLiveQuotes } from "@/hooks/use-stock-live-quotes";
import type { GoldSubtype } from "@/lib/investments/gold-subtypes";
import {
  GOLD_SUBTYPE_OPTIONS,
  GOLD_SUBTYPE_VALUES,
  goldMiktarLabel,
} from "@/lib/investments/gold-subtypes";
import {
  COMMODITY_COST_ENTRY_CURRENCIES,
  type PositionFormValues,
} from "@/lib/investments/investments-schema";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  form: UseFormReturn<PositionFormValues>;
  currency: string;
  stockPlaceholders?: boolean;
};

export function PositionFormFields({
  form,
  currency,
  stockPlaceholders = false,
}: Props) {
  const assetType = form.watch("assetType");
  const goldSubtype = form.watch("goldSubtype");
  const ticker = form.watch("ticker");
  const avgCostEntryCurrency = form.watch("avgCostEntryCurrency");
  const prevAvgCostCurrencyRef = useRef<UserDisplayCurrency | null>(null);
  const goldLive = useGoldLivePrices(assetType === "GOLD");
  const silverLive = useSilverLivePrices(assetType === "SILVER");
  const platinumLive = usePlatinumLivePrices(assetType === "PLATINUM");
  const stockLive = useStockLiveQuotes(assetType === "STOCK");
  const fxLive = useFxLiveQuotes(assetType === "FX");
  const cryptoLive = useCryptoLiveQuotes(assetType === "CRYPTO");
  const commodityLive = useCommodityLiveQuotes(assetType === "COMMODITY");
  const currencySymbols = useCurrencySymbols(assetType === "FX");

  useEffect(() => {
    if (assetType !== "COMMODITY") return;
    if (form.getValues("avgCostEntryCurrency") == null) {
      form.setValue("avgCostEntryCurrency", normalizeUserCurrency(currency));
    }
  }, [assetType, currency, form]);

  useEffect(() => {
    if (assetType !== "COMMODITY") {
      prevAvgCostCurrencyRef.current = null;
      return;
    }
    const cur = normalizeUserCurrency(avgCostEntryCurrency ?? currency);
    if (prevAvgCostCurrencyRef.current === null) {
      prevAvgCostCurrencyRef.current = cur;
      return;
    }
    const prev = prevAvgCostCurrencyRef.current;
    if (prev === cur) return;
    const amt = form.getValues("avgCostPerUnit");
    if (typeof amt !== "number" || !Number.isFinite(amt) || amt <= 0) {
      prevAvgCostCurrencyRef.current = cur;
      return;
    }
    const tryAmt = displayAmountToTry(amt, prev);
    const nextDisplay = tryAmountToDisplay(tryAmt, cur);
    form.setValue("avgCostPerUnit", nextDisplay, {
      shouldValidate: true,
      shouldDirty: true,
    });
    prevAvgCostCurrencyRef.current = cur;
  }, [assetType, avgCostEntryCurrency, currency, form]);

  useEffect(() => {
    if (assetType !== "GOLD" || !goldSubtype) return;
    const liveTry = goldLive.prices[goldSubtype as GoldSubtype];
    if (typeof liveTry === "number" && liveTry > 0) {
      const display = tryAmountToDisplay(liveTry, currency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [assetType, goldSubtype, goldLive.prices, currency, form]);

  useEffect(() => {
    if (assetType !== "SILVER") return;
    const liveTry = silverLive.priceTryPerGram;
    if (typeof liveTry === "number" && liveTry > 0) {
      const display = tryAmountToDisplay(liveTry, currency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [assetType, silverLive.priceTryPerGram, currency, form]);

  useEffect(() => {
    if (assetType !== "PLATINUM") return;
    const liveTry = platinumLive.priceTryPerGram;
    if (typeof liveTry === "number" && liveTry > 0) {
      const display = tryAmountToDisplay(liveTry, currency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [assetType, platinumLive.priceTryPerGram, currency, form]);

  useEffect(() => {
    if (assetType !== "STOCK") return;
    const code = ticker?.trim().toUpperCase();
    if (!code) {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
      return;
    }
    const tryPx = stockLive.byTicker[code];
    if (typeof tryPx === "number" && tryPx > 0) {
      const display = tryAmountToDisplay(tryPx, currency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [assetType, ticker, stockLive.byTicker, currency, form]);

  useEffect(() => {
    if (assetType !== "FX") return;
    const code = ticker?.trim().toUpperCase();
    if (!code) {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
      return;
    }
    const tryPx = fxLive.byCode[code];
    if (typeof tryPx === "number" && tryPx > 0) {
      const display = tryAmountToDisplay(tryPx, currency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [assetType, ticker, fxLive.byCode, currency, form]);

  useEffect(() => {
    if (assetType !== "CRYPTO") return;
    const code = ticker?.trim().toUpperCase();
    if (!code) {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
      return;
    }
    const tryPx = cryptoLive.byTicker[code];
    if (typeof tryPx === "number" && tryPx > 0) {
      const display = tryAmountToDisplay(tryPx, currency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [assetType, ticker, cryptoLive.byTicker, currency, form]);

  useEffect(() => {
    if (assetType !== "COMMODITY") return;
    const code = ticker?.trim().toUpperCase();
    if (!code) {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
      return;
    }
    const tryPx = commodityLive.byTicker[code];
    const displayCurrency = normalizeUserCurrency(
      avgCostEntryCurrency ?? currency,
    );
    if (typeof tryPx === "number" && tryPx > 0) {
      const display = tryAmountToDisplay(tryPx, displayCurrency);
      form.setValue("marketPricePerUnit", String(display), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      form.setValue("marketPricePerUnit", "", { shouldValidate: true });
    }
  }, [
    assetType,
    ticker,
    commodityLive.byTicker,
    currency,
    avgCostEntryCurrency,
    form,
  ]);

  return (
    <>
      <div className="space-y-2">
        <Label>Tür</Label>
        <Select
          value={form.watch("assetType")}
          onValueChange={(
            v:
              | "GOLD"
              | "SILVER"
              | "PLATINUM"
              | "COMMODITY"
              | "STOCK"
              | "FX"
              | "CRYPTO",
          ) => {
            form.setValue("assetType", v);
            if (v === "GOLD") {
              form.setValue("ticker", "");
              form.setValue(
                "goldSubtype",
                form.getValues("goldSubtype") ?? "GRAM",
              );
            } else {
              form.setValue("goldSubtype", undefined);
              form.setValue("marketPricePerUnit", "");
              if (v === "SILVER") {
                form.setValue("ticker", "");
                form.setValue("title", "");
              }
              if (v === "FX" || v === "CRYPTO" || v === "COMMODITY") {
                form.setValue("title", "");
                form.setValue("ticker", "");
              }
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assetType === "SILVER" ? (
              <SelectItem value="SILVER" className="cursor-pointer">
                Gümüş (eski kayıt)
              </SelectItem>
            ) : null}
            {assetType === "PLATINUM" ? (
              <SelectItem value="PLATINUM" className="cursor-pointer">
                Platin (eski kayıt)
              </SelectItem>
            ) : null}
            <SelectItem value="GOLD" className="cursor-pointer">
              Altın
            </SelectItem>
            <SelectItem value="FX" className="cursor-pointer">
              Döviz
            </SelectItem>
            <SelectItem value="STOCK" className="cursor-pointer">
              Hisse senedi
            </SelectItem>
            <SelectItem value="COMMODITY" className="cursor-pointer">
              Emtia
            </SelectItem>
            <SelectItem value="CRYPTO" className="cursor-pointer">
              Kripto
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {assetType === "GOLD" && (
        <div className="space-y-2">
          <Label>Altın türü</Label>
          <Select
            value={goldSubtype ?? "GRAM"}
            onValueChange={(val) =>
              form.setValue(
                "goldSubtype",
                val as (typeof GOLD_SUBTYPE_VALUES)[number],
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              {GOLD_SUBTYPE_OPTIONS.map(({ value, label }) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="cursor-pointer"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.goldSubtype && (
            <p className="text-sm text-destructive">
              {form.formState.errors.goldSubtype.message}
            </p>
          )}
        </div>
      )}
      {assetType === "STOCK" && (
        <>
          <div className="space-y-2">
            <Label>Hisse kodu</Label>
            <Input
              placeholder={
                stockPlaceholders
                  ? "THYAO / ODAS / PGSUS / ASELS / ..."
                  : undefined
              }
              {...form.register("ticker")}
            />
            {form.formState.errors.ticker && (
              <p className="text-sm text-destructive">
                {form.formState.errors.ticker.message}
              </p>
            )}
          </div>
        </>
      )}
      {assetType === "FX" && (
        <div className="space-y-2">
          <Label>Döviz kodu</Label>
          <Select
            value={ticker?.trim() ? ticker.trim().toUpperCase() : undefined}
            onValueChange={(code) => {
              const row = currencySymbols.items.find((x) => x.code === code);
              form.setValue("ticker", code, { shouldValidate: true });
              form.setValue("title", row?.name ?? code, {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  currencySymbols.loading
                    ? "Semboller yükleniyor…"
                    : "Döviz seçin"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {currencySymbols.items.map(({ code, name }) => (
                <SelectItem key={code} value={code} className="cursor-pointer">
                  {code} — {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(form.formState.errors.ticker || form.formState.errors.title) && (
            <p className="text-sm text-destructive">
              {form.formState.errors.ticker?.message ??
                form.formState.errors.title?.message}
            </p>
          )}
          {currencySymbols.error ? (
            <p className="text-sm text-muted-foreground">
              {currencySymbols.error}
            </p>
          ) : null}
        </div>
      )}
      {assetType === "COMMODITY" && (
        <div className="space-y-2">
          <Label>Emtia</Label>
          <Select
            value={ticker?.trim() ? ticker.trim().toUpperCase() : undefined}
            onValueChange={(code) => {
              const row = commodityLive.symbols.find((x) => x.code === code);
              form.setValue("ticker", code, { shouldValidate: true });
              form.setValue("title", row?.name ?? code, {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  commodityLive.loading ? "Liste yükleniyor…" : "Emtia seçin"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {commodityLive.symbols.map(({ code, name }) => (
                <SelectItem key={code} value={code} className="cursor-pointer">
                  {sentenceCaseFirstTr(code)} — {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(form.formState.errors.ticker || form.formState.errors.title) && (
            <p className="text-sm text-destructive">
              {form.formState.errors.ticker?.message ??
                form.formState.errors.title?.message}
            </p>
          )}
          {commodityLive.error ? (
            <p className="text-sm text-muted-foreground">
              {commodityLive.error}
            </p>
          ) : null}
        </div>
      )}
      {assetType === "CRYPTO" && (
        <div className="space-y-2">
          <Label>Kripto</Label>
          <Select
            value={ticker?.trim() ? ticker.trim().toUpperCase() : undefined}
            onValueChange={(code) => {
              const row = cryptoLive.symbols.find((x) => x.code === code);
              form.setValue("ticker", code, { shouldValidate: true });
              form.setValue("title", row?.name ?? code, {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  cryptoLive.loading ? "Liste yükleniyor…" : "Kripto seçin"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {cryptoLive.symbols.map(({ code, name }) => (
                <SelectItem key={code} value={code} className="cursor-pointer">
                  {sentenceCaseFirstTr(code)} — {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(form.formState.errors.ticker || form.formState.errors.title) && (
            <p className="text-sm text-destructive">
              {form.formState.errors.ticker?.message ??
                form.formState.errors.title?.message}
            </p>
          )}
          {cryptoLive.error ? (
            <p className="text-sm text-muted-foreground">{cryptoLive.error}</p>
          ) : null}
        </div>
      )}
      <div className="space-y-2">
        <Label>
          {assetType === "GOLD"
            ? goldMiktarLabel(goldSubtype)
            : assetType === "SILVER" || assetType === "PLATINUM"
              ? "Miktar (gram)"
              : assetType === "FX"
                ? "Miktar (satın aldığınız döviz tutarı)"
                : assetType === "CRYPTO"
                  ? "Miktar (coin)"
                  : assetType === "COMMODITY"
                    ? "Miktar (birim)"
                    : "Adet (lot)"}
        </Label>
        <Input
          type="number"
          step="any"
          {...form.register("quantity", { valueAsNumber: true })}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Alış fiyatı</Label>
          {assetType === "COMMODITY" ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <Input
                  className="sm:min-w-0 sm:flex-1"
                  type="number"
                  step="0.01"
                  {...form.register("avgCostPerUnit", { valueAsNumber: true })}
                />
                <Controller
                  name="avgCostEntryCurrency"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? normalizeUserCurrency(currency)}
                      onValueChange={(v) =>
                        field.onChange(
                          v as (typeof COMMODITY_COST_ENTRY_CURRENCIES)[number],
                        )
                      }
                    >
                      <SelectTrigger className="w-full cursor-pointer sm:w-[110px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMODITY_COST_ENTRY_CURRENCIES.map((code) => (
                          <SelectItem
                            key={code}
                            value={code}
                            className="cursor-pointer"
                          >
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          ) : (
            <Input
              type="number"
              step="0.01"
              {...form.register("avgCostPerUnit", { valueAsNumber: true })}
            />
          )}
          {form.formState.errors.avgCostPerUnit && (
            <p className="text-sm text-destructive">
              {form.formState.errors.avgCostPerUnit.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Güncel fiyat</Label>
          <div
            className={
              assetType === "COMMODITY"
                ? "flex flex-col gap-2 sm:flex-row sm:items-stretch"
                : undefined
            }
          >
            <Controller
              name="marketPricePerUnit"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  className={cn(
                    "cursor-not-allowed bg-muted",
                    assetType === "COMMODITY" && "sm:min-w-0 sm:flex-1",
                  )}
                  placeholder={
                    assetType === "GOLD"
                      ? goldLive.loading
                        ? "Canlı fiyat yükleniyor…"
                        : goldLive.error
                          ? "Fiyat alınamadı"
                          : "Bu tür için kur yok"
                      : assetType === "SILVER"
                        ? silverLive.loading
                          ? "Canlı fiyat yükleniyor…"
                          : silverLive.error
                            ? "Fiyat alınamadı"
                            : "Gram fiyatı yok"
                        : assetType === "PLATINUM"
                          ? platinumLive.loading
                            ? "Canlı fiyat yükleniyor…"
                            : platinumLive.error
                              ? "Fiyat alınamadı"
                              : "Gram fiyatı yok"
                          : assetType === "STOCK"
                            ? stockLive.loading
                              ? "Hisse listesi yükleniyor…"
                              : stockLive.error
                                ? "Fiyat alınamadı"
                                : !ticker?.trim()
                                  ? "Hisse kodu girin"
                                  : !stockLive.byTicker[
                                        ticker.trim().toUpperCase()
                                      ]
                                    ? "Bu kod listede yok"
                                    : ""
                            : assetType === "FX"
                              ? fxLive.loading
                                ? "Döviz kurları yükleniyor…"
                                : fxLive.error
                                  ? "Fiyat alınamadı"
                                  : !ticker?.trim()
                                    ? "Döviz seçin"
                                    : !fxLive.byCode[
                                          ticker.trim().toUpperCase()
                                        ]
                                      ? "Bu döviz için kur yok"
                                      : ""
                              : assetType === "CRYPTO"
                                ? cryptoLive.loading
                                  ? "Kripto fiyatları yükleniyor…"
                                  : cryptoLive.error
                                    ? "Fiyat alınamadı"
                                    : !ticker?.trim()
                                      ? "Kripto seçin"
                                      : !cryptoLive.byTicker[
                                            ticker.trim().toUpperCase()
                                          ]
                                        ? "Bu kod listede yok"
                                        : ""
                                : assetType === "COMMODITY"
                                  ? commodityLive.loading
                                    ? "Emtia fiyatları yükleniyor…"
                                    : commodityLive.error
                                      ? "Fiyat alınamadı"
                                      : !ticker?.trim()
                                        ? "Emtia seçin"
                                        : !commodityLive.byTicker[
                                              ticker.trim().toUpperCase()
                                            ]
                                          ? "Bu kod listede yok"
                                          : ""
                                  : ""
                  }
                />
              )}
            />
            {assetType === "COMMODITY" ? (
              <Badge
                variant="outline"
                className="h-9 shrink-0 justify-center px-3 font-medium tabular-nums text-muted-foreground sm:w-[110px]"
                aria-label={`Birim: ${normalizeUserCurrency(avgCostEntryCurrency ?? currency)}`}
              >
                {normalizeUserCurrency(avgCostEntryCurrency ?? currency)}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Not</Label>
        <Textarea rows={2} {...form.register("note")} />
      </div>
    </>
  );
}
