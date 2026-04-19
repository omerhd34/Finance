"use client";

import { useEffect } from "react";
import { setLiveExchangeRates } from "@/lib/currency";

export function ExchangeRatesSync() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/exchange-rates");
        if (!res.ok) return;
        const data = (await res.json()) as {
          rates?: Record<string, number> | null;
        };
        if (cancelled || !data.rates) return;
        setLiveExchangeRates(data.rates);
      } catch {
        /* API yoksa yedek sabit kurlar kullanılır */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
