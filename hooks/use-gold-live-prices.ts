/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { GoldSubtype } from "@/lib/gold-subtypes";
import { isSupportedGoldSubtype } from "@/lib/collectapi-gold";

export type GoldLivePricesState = {
  prices: Partial<Record<GoldSubtype, number>>;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const initial: GoldLivePricesState = {
  prices: {},
  loading: false,
  error: null,
  updatedAt: null,
};

export function useGoldLivePrices(enabled: boolean): GoldLivePricesState {
  const [state, setState] = useState<GoldLivePricesState>(initial);

  useEffect(() => {
    if (!enabled) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/gold-prices");
        const data = (await res.json()) as {
          prices?: Record<string, number> | null;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        if (!res.ok || !data.prices) {
          setState({
            prices: {},
            loading: false,
            error: data.error ?? "Canlı altın fiyatı alınamadı",
            updatedAt: null,
          });
          return;
        }

        const prices: Partial<Record<GoldSubtype, number>> = {};
        for (const [k, v] of Object.entries(data.prices)) {
          if (!isSupportedGoldSubtype(k)) continue;
          if (typeof v === "number" && Number.isFinite(v) && v > 0) {
            prices[k] = v;
          }
        }

        setState({
          prices,
          loading: false,
          error: null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            prices: {},
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
