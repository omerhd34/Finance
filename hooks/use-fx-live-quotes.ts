/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type FxLiveQuotesState = {
  byCode: Record<string, number>;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const initial: FxLiveQuotesState = {
  byCode: {},
  loading: false,
  error: null,
  updatedAt: null,
};

export function useFxLiveQuotes(enabled: boolean): FxLiveQuotesState {
  const [state, setState] = useState<FxLiveQuotesState>(initial);

  useEffect(() => {
    if (!enabled) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/fx-prices");
        const data = (await res.json()) as {
          quotes?: Record<string, number> | null;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        if (!res.ok || !data.quotes) {
          setState({
            byCode: {},
            loading: false,
            error: data.error ?? "Canlı döviz kuru alınamadı",
            updatedAt: null,
          });
          return;
        }

        const byCode: Record<string, number> = {};
        for (const [k, v] of Object.entries(data.quotes)) {
          const code = k.trim().toUpperCase();
          if (!code) continue;
          if (typeof v === "number" && Number.isFinite(v) && v > 0) {
            byCode[code] = v;
          }
        }

        setState({
          byCode,
          loading: false,
          error: null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            byCode: {},
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
