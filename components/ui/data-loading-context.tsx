"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DataLoadingContextValue = {
  loading: boolean;
  register: (loading: boolean) => () => void;
};

const DataLoadingContext = createContext<DataLoadingContextValue | null>(null);

export function DataLoadingProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const register = useCallback((loading: boolean) => {
    if (loading) {
      setLoadingCount((prev) => prev + 1);
      return () => setLoadingCount((prev) => Math.max(0, prev - 1));
    }
    return () => {};
  }, []);

  const value = useMemo<DataLoadingContextValue>(
    () => ({ loading: loadingCount > 0, register }),
    [loadingCount, register],
  );

  return (
    <DataLoadingContext.Provider value={value}>
      {children}
    </DataLoadingContext.Provider>
  );
}

export function useIsDataLoading(): boolean {
  return useContext(DataLoadingContext)?.loading ?? false;
}

export function useRegisterDataLoading(loading: boolean): void {
  const ctx = useContext(DataLoadingContext);
  useLayoutEffect(() => {
    if (!ctx) return;
    return ctx.register(loading);
  }, [ctx, loading]);
}
