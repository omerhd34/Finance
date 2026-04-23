"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { tryAmountToDisplay } from "@/lib/currency";
import { useCryptoLiveQuotes } from "@/hooks/use-crypto-live-quotes";
import { useCurrencySymbols } from "@/hooks/use-currency-symbols";
import { useFxLiveQuotes } from "@/hooks/use-fx-live-quotes";
import { useGoldLivePrices } from "@/hooks/use-gold-live-prices";
import { useStockLiveQuotes } from "@/hooks/use-stock-live-quotes";
import type { GoldSubtype } from "@/lib/gold-subtypes";
import {
  GOLD_SUBTYPE_OPTIONS,
  GOLD_SUBTYPE_VALUES,
  goldMiktarLabel,
} from "@/lib/gold-subtypes";
import type { PositionFormValues } from "@/lib/investments-schema";
import { currencySymbolLabel } from "@/lib/utils";
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
  const goldLive = useGoldLivePrices(assetType === "GOLD");
  const stockLive = useStockLiveQuotes(assetType === "STOCK");
  const fxLive = useFxLiveQuotes(assetType === "FX");
  const cryptoLive = useCryptoLiveQuotes(assetType === "CRYPTO");
  const currencySymbols = useCurrencySymbols(assetType === "FX");

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

  return (
    <>
      <div className="space-y-2">
        <Label>Tür</Label>
        <Select
          value={form.watch("assetType")}
          onValueChange={(v: "GOLD" | "STOCK" | "FX" | "CRYPTO") => {
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
              if (v === "FX" || v === "CRYPTO") {
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
            <SelectItem value="GOLD" className="cursor-pointer">
              Altın
            </SelectItem>
            <SelectItem value="STOCK" className="cursor-pointer">
              Hisse senedi
            </SelectItem>
            <SelectItem value="FX" className="cursor-pointer">
              Döviz
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
            <Label>Başlık</Label>
            <Input
              placeholder={
                stockPlaceholders ? "Örn. Türk Hava Yolları" : undefined
              }
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Hisse kodu</Label>
            <Input
              placeholder={stockPlaceholders ? "THYAO" : undefined}
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
          <Label>Para birimi</Label>
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
                    : "Para birimi seçin"
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
          {cryptoLive.error ? (
            <p className="text-sm text-muted-foreground">{cryptoLive.error}</p>
          ) : null}
        </div>
      )}
      <div className="space-y-2">
        <Label>
          {assetType === "GOLD"
            ? goldMiktarLabel(goldSubtype)
            : assetType === "FX"
              ? "Miktar (satın aldığınız döviz tutarı)"
              : assetType === "CRYPTO"
                ? "Miktar (coin)"
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
          <Label>Alış fiyatı ({currencySymbolLabel(currency)})</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("avgCostPerUnit", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Güncel fiyat ({currencySymbolLabel(currency)})</Label>
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
                className="cursor-not-allowed bg-muted"
                placeholder={
                  assetType === "GOLD"
                    ? goldLive.loading
                      ? "Canlı fiyat yükleniyor…"
                      : goldLive.error
                        ? "Fiyat alınamadı"
                        : "Bu tür için kur yok"
                    : assetType === "STOCK"
                      ? stockLive.loading
                        ? "Hisse listesi yükleniyor…"
                        : stockLive.error
                          ? "Fiyat alınamadı"
                          : !ticker?.trim()
                            ? "Hisse kodu girin"
                            : !stockLive.byTicker[ticker.trim().toUpperCase()]
                              ? "Bu kod listede yok"
                              : ""
                      : assetType === "FX"
                        ? fxLive.loading
                          ? "Döviz kurları yükleniyor…"
                          : fxLive.error
                            ? "Fiyat alınamadı"
                            : !ticker?.trim()
                              ? "Para birimi seçin"
                              : !fxLive.byCode[ticker.trim().toUpperCase()]
                                ? "Bu para birimi için kur yok"
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
                          : ""
                }
              />
            )}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Not</Label>
        <Textarea rows={2} {...form.register("note")} />
      </div>
    </>
  );
}
