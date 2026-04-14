"use client";

import type { UseFormReturn } from "react-hook-form";
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

  return (
    <>
      <div className="space-y-2">
        <Label>Tür</Label>
        <Select
          value={form.watch("assetType")}
          onValueChange={(v: "GOLD" | "STOCK") => {
            form.setValue("assetType", v);
            if (v === "GOLD") {
              form.setValue("ticker", "");
              form.setValue(
                "goldSubtype",
                form.getValues("goldSubtype") ?? "GRAM",
              );
            } else {
              form.setValue("goldSubtype", undefined);
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
      <div className="space-y-2">
        <Label>
          {assetType === "GOLD" ? goldMiktarLabel(goldSubtype) : "Adet (lot)"}
        </Label>
        <Input
          type="number"
          step="any"
          {...form.register("quantity", { valueAsNumber: true })}
        />
      </div>
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
        <Input
          type="text"
          inputMode="decimal"
          placeholder={stockPlaceholders ? "Boş bırakılabilir" : undefined}
          {...form.register("marketPricePerUnit")}
        />
      </div>
      <div className="space-y-2">
        <Label>Not</Label>
        <Textarea rows={2} {...form.register("note")} />
      </div>
    </>
  );
}
