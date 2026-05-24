"use client";

import type { ReactNode } from "react";
import { LogoLoading } from "@/components/ui/logo-loading";

type DataLoadingShellProps = {
  ready: boolean;
  children: ReactNode;
};

export function DataLoadingShell({ ready, children }: DataLoadingShellProps) {
  if (!ready) {
    return <LogoLoading />;
  }
  return <>{children}</>;
}
