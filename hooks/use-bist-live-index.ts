/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type BistIndexRow = { ticker: string; title: string; level: number };

export type BistLiveIndexState = {
  byTicker: Record<string, number>;
  indices: BistIndexRow[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const empty: BistLiveIndexState = {
  byTicker: {},
  indices: [],
  loading: false,
  error: null,
  updatedAt: null,
};

export function useBistLiveIndex(enabled: boolean): BistLiveIndexState {
  const [state, setState] = useState<BistLiveIndexState>(empty);

  useEffect(() => {
    if (!enabled) {
      setState(empty);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/bist-prices");
        const data = (await res.json()) as {
          indices?: BistIndexRow[];
          byTicker?: Record<string, number>;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        const indices = Array.isArray(data.indices) ? data.indices : [];
        const byTicker =
          data.byTicker && typeof data.byTicker === "object"
            ? data.byTicker
            : {};

        if (
          !res.ok ||
          indices.length === 0 ||
          Object.keys(byTicker).length === 0
        ) {
          setState({
            byTicker: {},
            indices: [],
            loading: false,
            error: data.error ?? "BIST endeksleri alınamadı",
            updatedAt: null,
          });
          return;
        }

        setState({
          byTicker,
          indices,
          loading: false,
          error: null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            byTicker: {},
            indices: [],
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
