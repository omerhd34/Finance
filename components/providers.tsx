/* eslint-disable react-hooks/refs */
"use client";

import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { useRef } from "react";
import { makeStore, type AppStore } from "@/store";
import { ExchangeRatesSync } from "@/components/exchange-rates-sync";
import { SessionUserSync } from "@/components/session-user-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <SessionProvider>
      <ReduxProvider store={storeRef.current}>
        <SessionUserSync />
        <ExchangeRatesSync />
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
