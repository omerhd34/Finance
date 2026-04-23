/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type StockLiveQuotesState = {
  byTicker: Record<string, number>;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const initial: StockLiveQuotesState = {
  byTicker: {},
  loading: false,
  error: null,
  updatedAt: null,
};

export function useStockLiveQuotes(enabled: boolean): StockLiveQuotesState {
  const [state, setState] = useState<StockLiveQuotesState>(initial);

  useEffect(() => {
    if (!enabled) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/stock-prices");
        const data = (await res.json()) as {
          quotes?: Record<string, number> | null;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        if (!res.ok || !data.quotes) {
          setState({
            byTicker: {},
            loading: false,
            error: data.error ?? "Canlı hisse fiyatı alınamadı",
            updatedAt: null,
          });
          return;
        }

        const byTicker: Record<string, number> = {};
        for (const [k, v] of Object.entries(data.quotes)) {
          const code = k.trim().toUpperCase();
          if (!code) continue;
          if (typeof v === "number" && Number.isFinite(v) && v > 0) {
            byTicker[code] = v;
          }
        }

        setState({
          byTicker,
          loading: false,
          error: null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            byTicker: {},
            loading: false,
            error: "Ağ hatası",
            updatedAt: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
