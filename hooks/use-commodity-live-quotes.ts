/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type CommoditySymbolRow = { code: string; name: string };

export type CommodityLiveQuotesState = {
  byTicker: Record<string, number>;
  symbols: CommoditySymbolRow[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const initial: CommodityLiveQuotesState = {
  byTicker: {},
  symbols: [],
  loading: false,
  error: null,
  updatedAt: null,
};

export function useCommodityLiveQuotes(
  enabled: boolean,
): CommodityLiveQuotesState {
  const [state, setState] = useState<CommodityLiveQuotesState>(initial);

  useEffect(() => {
    if (!enabled) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/commodity-prices");
        const data = (await res.json()) as {
          quotes?: Record<string, number> | null;
          symbols?: CommoditySymbolRow[] | null;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        if (!res.ok || !data.quotes) {
          setState({
            byTicker: {},
            symbols: [],
            loading: false,
            error: data.error ?? "Emtia fiyatı alınamadı",
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

        const symbols = Array.isArray(data.symbols) ? data.symbols : [];

        setState({
          byTicker,
          symbols,
          loading: false,
          error: null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            byTicker: {},
            symbols: [],
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
