/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type SilverLivePricesState = {
  priceTryPerGram: number | null;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const initial: SilverLivePricesState = {
  priceTryPerGram: null,
  loading: false,
  error: null,
  updatedAt: null,
};

export function useSilverLivePrices(enabled: boolean): SilverLivePricesState {
  const [state, setState] = useState<SilverLivePricesState>(initial);

  useEffect(() => {
    if (!enabled) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    void (async () => {
      try {
        const res = await fetch("/api/silver-prices");
        const data = (await res.json()) as {
          priceTryPerGram?: number | null;
          error?: string;
          updatedAt?: string;
        };
        if (cancelled) return;

        if (
          !res.ok ||
          data.priceTryPerGram == null ||
          typeof data.priceTryPerGram !== "number" ||
          !Number.isFinite(data.priceTryPerGram) ||
          data.priceTryPerGram <= 0
        ) {
          setState({
            priceTryPerGram: null,
            loading: false,
            error: data.error ?? "Canlı gümüş fiyatı alınamadı",
            updatedAt: null,
          });
          return;
        }

        setState({
          priceTryPerGram: data.priceTryPerGram,
          loading: false,
          error: null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            priceTryPerGram: null,
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
