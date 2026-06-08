"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeUserCurrency } from "@/lib/common/currency";
import {
  FALLBACK_USER_CURRENCY_CODES,
  normalizeCurrencyCode,
  sortUserCurrencyCodes,
  userCurrencyName,
} from "@/lib/common/user-currencies";
import { cn, currencySymbolLabel } from "@/lib/common/utils";
import { useCurrencySymbols } from "@/hooks/use-currency-symbols";

type UserCurrencySelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  disabled?: boolean;
};

function formatCurrencyOption(code: string, name?: string): string {
  const normalized = normalizeCurrencyCode(code);
  const symbol = currencySymbolLabel(normalized);
  const label = name ?? userCurrencyName(normalized);
  if (label && label !== normalized) {
    return `${normalized} (${symbol}) — ${label}`;
  }
  return `${normalized} (${symbol})`;
}

export function UserCurrencySelect({
  id,
  value,
  onValueChange,
  triggerClassName,
  disabled = false,
}: UserCurrencySelectProps) {
  const { items, loading } = useCurrencySymbols(true);

  const options = useMemo(() => {
    const nameByCode = new Map<string, string>();
    for (const item of items) {
      const code = normalizeCurrencyCode(
        item.code === "TRY" ? "TL" : item.code,
      );
      nameByCode.set(code, item.name);
    }

    const codes =
      items.length === 0
        ? [...FALLBACK_USER_CURRENCY_CODES]
        : sortUserCurrencyCodes(
            items.map((item) =>
              normalizeCurrencyCode(item.code === "TRY" ? "TL" : item.code),
            ),
          );

    return codes.map((code) => ({
      code,
      name: nameByCode.get(code) ?? userCurrencyName(code),
    }));
  }, [items]);

  const selected = normalizeUserCurrency(value);

  return (
    <Select
      value={selected}
      onValueChange={(next) => onValueChange(normalizeUserCurrency(next))}
      disabled={disabled || loading}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border-border/70 bg-muted/25 shadow-none",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={loading ? "Yükleniyor…" : "Para birimi"} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={4}
        className="max-h-[min(24rem,70vh)]"
      >
        {options.map((entry) => (
          <SelectItem
            key={entry.code}
            value={entry.code}
            className="cursor-pointer"
          >
            {formatCurrencyOption(entry.code, entry.name)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
