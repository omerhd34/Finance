/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type CryptoSymbolRow = { code: string; name: string };

export type CryptoLiveQuotesState = {
  byTicker: Record<string, number>;
  symbols: CryptoSymbolRow[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const initial: CryptoLiveQuotesState = {
  byTicker: {},
  symbols: [],
  loading: false,
  error: null,
  updatedAt: null,
};

export function useCryptoLiveQuotes(enabled: boolean): CryptoLiveQuotesState {
  const [state, setState] = useState<CryptoLiveQuotesState>(initial);

  useEffect(() => {
    if (!enabled) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/crypto-prices");
        const data = (await res.json()) as {
          quotes?: Record<string, number> | null;
          symbols?: CryptoSymbolRow[] | null;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        if (!res.ok || !data.quotes) {
          setState({
            byTicker: {},
            symbols: [],
            loading: false,
            error: data.error ?? "Kripto fiyatı alınamadı",
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
