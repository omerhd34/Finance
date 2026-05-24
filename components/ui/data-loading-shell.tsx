"use client";

import type { ReactNode } from "react";
import { LogoLoading } from "@/components/ui/logo-loading";
import { useRegisterDataLoading } from "@/components/ui/data-loading-context";

type DataLoadingShellProps = {
  ready: boolean;
  children: ReactNode;
};

export function DataLoadingShell({ ready, children }: DataLoadingShellProps) {
  useRegisterDataLoading(!ready);
  if (!ready) {
    return <LogoLoading />;
  }
  return <>{children}</>;
}
