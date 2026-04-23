/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export type CurrencySymbolRow = { code: string; name: string };

type State = {
  items: CurrencySymbolRow[];
  loading: boolean;
  error: string | null;
};

const empty: State = { items: [], loading: false, error: null };

export function useCurrencySymbols(enabled: boolean): State {
  const [state, setState] = useState<State>(empty);

  useEffect(() => {
    if (!enabled) {
      setState(empty);
      return;
    }

    let cancelled = false;
    setState({ items: [], loading: true, error: null });

    void (async () => {
      try {
        const res = await fetch("/api/currency-symbols");
        const data = (await res.json()) as {
          items?: CurrencySymbolRow[] | null;
          error?: string;
        };
        if (cancelled) return;

        if (!res.ok || !data.items) {
          setState({
            items: [],
            loading: false,
            error: data.error ?? "Sembol listesi alınamadı",
          });
          return;
        }

        setState({ items: data.items, loading: false, error: null });
      } catch {
        if (!cancelled) {
          setState({
            items: [],
            loading: false,
            error: "Ağ hatası",
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
