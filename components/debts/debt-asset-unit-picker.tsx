"use client";

import {
  DEBT_ASSET_CATEGORIES,
  DEBT_ASSET_UNIT_OPTIONS,
  categoryForUnit,
  type DebtAssetCategory,
  type DebtAssetUnit,
} from "@/lib/debts/debt-asset-units";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SymbolOption = { code: string; name: string };
export type SymbolOptionsByGroup = {
  CASH: ReadonlyArray<SymbolOption>;
  STOCK: ReadonlyArray<SymbolOption>;
  CRYPTO: ReadonlyArray<SymbolOption>;
  COMMODITY: ReadonlyArray<SymbolOption>;
};

type SubOption = {
  key: string;
  label: string;
  unit: DebtAssetUnit;
  symbol: string | null;
};

const TL_OPTION: SubOption = {
  key: "TL",
  label: "TL — Türk lirası",
  unit: "TL",
  symbol: null,
};

const CASH_PRIORITY: Record<string, number> = { USD: 0, EUR: 1, GBP: 2 };

function buildSubOptions(
  category: DebtAssetCategory,
  symbols: SymbolOptionsByGroup,
  currentUnit: DebtAssetUnit,
  currentSymbol: string | null,
): SubOption[] {
  if (category === "CASH") {
    const seen = new Set<string>(["TL", "TRY"]);
    const fxItems: SubOption[] = [];
    for (const s of symbols.CASH) {
      if (seen.has(s.code)) continue;
      seen.add(s.code);
      fxItems.push({
        key: `FX::${s.code}`,
        label: s.name && s.name !== s.code ? `${s.code} — ${s.name}` : s.code,
        unit: "FX",
        symbol: s.code,
      });
    }
    if (
      (currentUnit === "USD" ||
        currentUnit === "EUR" ||
        currentUnit === "GBP") &&
      !seen.has(currentUnit)
    ) {
      const opt = DEBT_ASSET_UNIT_OPTIONS.find((o) => o.value === currentUnit);
      fxItems.push({
        key: `FX::${currentUnit}`,
        label: opt?.label ?? currentUnit,
        unit: "FX",
        symbol: currentUnit,
      });
    }
    fxItems.sort((a, b) => {
      const pa = CASH_PRIORITY[a.symbol ?? ""];
      const pb = CASH_PRIORITY[b.symbol ?? ""];
      if (pa !== undefined || pb !== undefined) {
        return (pa ?? 99) - (pb ?? 99);
      }
      return a.label.localeCompare(b.label, "tr");
    });
    return [TL_OPTION, ...fxItems];
  }
  if (category === "GOLD") {
    return DEBT_ASSET_UNIT_OPTIONS.filter((o) => o.group === "GOLD").map(
      (o) => ({
        key: o.value,
        label: o.label,
        unit: o.value,
        symbol: null,
      }),
    );
  }
  if (category === "STOCK") {
    return symbols.STOCK.map((s) => ({
      key: `STOCK::${s.code}`,
      label: s.name && s.name !== s.code ? s.name : s.code,
      unit: "STOCK" as const,
      symbol: s.code,
    }));
  }
  if (category === "CRYPTO") {
    return symbols.CRYPTO.map((s) => ({
      key: `CRYPTO::${s.code}`,
      label: s.name && s.name !== s.code ? s.name : s.code,
      unit: "CRYPTO" as const,
      symbol: s.code,
    }));
  }
  void currentUnit;
  void currentSymbol;
  return symbols.COMMODITY.map((s) => ({
    key: `COMMODITY::${s.code}`,
    label: s.name && s.name !== s.code ? s.name : s.code,
    unit: "COMMODITY" as const,
    symbol: s.code,
  }));
}

function currentSubKey(unit: DebtAssetUnit, symbol: string | null): string {
  if (unit === "TL") return "TL";
  if (unit === "USD" || unit === "EUR" || unit === "GBP") {
    return `FX::${unit}`;
  }
  if (unit === "FX") {
    return symbol ? `FX::${symbol}` : "";
  }
  if (unit === "STOCK" || unit === "CRYPTO" || unit === "COMMODITY") {
    return symbol ? `${unit}::${symbol}` : "";
  }
  return unit;
}

type Props = {
  unit: string;
  symbol: string;
  onChange: (next: { unit: DebtAssetUnit; symbol: string }) => void;
  symbolOptionsByGroup: SymbolOptionsByGroup;
  errorMessage?: string;
};

export function DebtAssetUnitPicker({
  unit,
  symbol,
  onChange,
  symbolOptionsByGroup,
  errorMessage,
}: Props) {
  const normalizedUnit = unit as DebtAssetUnit;
  const category = categoryForUnit(normalizedUnit);
  const subOptions = buildSubOptions(
    category,
    symbolOptionsByGroup,
    normalizedUnit,
    symbol || null,
  );
  const subKey = currentSubKey(normalizedUnit, symbol || null);
  const subLabel =
    category === "CASH"
      ? "Para birimi"
      : category === "GOLD"
        ? "Tür"
        : category === "STOCK"
          ? "Hisse"
          : category === "CRYPTO"
            ? "Kripto"
            : "Sembol";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Birim</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            const nextCategory = v as DebtAssetCategory;
            const nextSubs = buildSubOptions(
              nextCategory,
              symbolOptionsByGroup,
              normalizedUnit,
              symbol || null,
            );
            const first = nextSubs[0];
            if (first) {
              onChange({ unit: first.unit, symbol: first.symbol ?? "" });
              return;
            }
            if (nextCategory === "STOCK")
              onChange({ unit: "STOCK", symbol: "" });
            else if (nextCategory === "CRYPTO")
              onChange({ unit: "CRYPTO", symbol: "" });
            else if (nextCategory === "COMMODITY")
              onChange({ unit: "COMMODITY", symbol: "" });
            else if (nextCategory === "GOLD")
              onChange({ unit: "GOLD_GRAM", symbol: "" });
            else onChange({ unit: "TL", symbol: "" });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEBT_ASSET_CATEGORIES.map((c) => (
              <SelectItem
                key={c.value}
                value={c.value}
                className="cursor-pointer"
              >
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{subLabel}</Label>
        <Select
          value={subKey || undefined}
          onValueChange={(v) => {
            const opt = subOptions.find((o) => o.key === v);
            if (!opt) return;
            onChange({ unit: opt.unit, symbol: opt.symbol ?? "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`${subLabel} seçin`} />
          </SelectTrigger>
          <SelectContent>
            {subOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Canlı fiyatlar yükleniyor…
              </div>
            ) : (
              subOptions.map((o) => (
                <SelectItem
                  key={o.key}
                  value={o.key}
                  className="cursor-pointer"
                >
                  {o.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
