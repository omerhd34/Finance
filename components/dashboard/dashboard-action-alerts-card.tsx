/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { cn } from "@/lib/common/utils";
import type {
  DashboardAlert,
  DashboardAlertSeverity,
} from "@/lib/dashboard/dashboard-anomalies";

type Props = {
  alerts: DashboardAlert[];
  pageSize?: number;
};

const SEVERITY_BADGE_CLASS: Record<DashboardAlertSeverity, string> = {
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

const SEVERITY_LABEL: Record<DashboardAlertSeverity, string> = {
  danger: "Acil",
  warning: "Dikkat",
  info: "Bilgi",
};

const SEVERITY_RING_CLASS: Record<DashboardAlertSeverity, string> = {
  danger: "ring-rose-500/30 hover:bg-rose-500/5",
  warning: "ring-amber-500/30 hover:bg-amber-500/5",
  info: "ring-sky-500/30 hover:bg-sky-500/5",
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function DashboardActionAlertsCard({ alerts, pageSize = 2 }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(alerts.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, alerts.length);
  const visible = alerts.slice(startIdx, endIdx);

  const showPagination = alerts.length > pageSize;

  const dangerCount = alerts.filter((a) => a.severity === "danger").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  const description =
    alerts.length === 0
      ? "Sizi bekleyen kritik bir uyarı yok. İyi gidiyor."
      : `${dangerCount} acil, ${warningCount} dikkat`;

  const progressPercent =
    totalPages > 1 ? Math.round(((safePage - 1) / (totalPages - 1)) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <DashboardSectionHeader
        icon={alerts.length === 0 ? CheckCircle2 : AlertTriangle}
        title="Aksiyon uyarıları"
        description={description}
      />
      <div className="p-4 sm:p-6">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Bütçeleriniz, harcama kalıplarınız ve borç/alacak vadeleriniz şu an
            uyarı sınırının altında.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visible.map((alert) => (
              <li key={alert.id} className="min-w-0">
                <div
                  className={cn(
                    "group flex h-full flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/15 p-3.5 shadow-sm ring-1 transition-colors",
                    SEVERITY_RING_CLASS[alert.severity],
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md px-2 py-px text-[10px] font-semibold uppercase tracking-wide",
                        SEVERITY_BADGE_CLASS[alert.severity],
                      )}
                    >
                      {SEVERITY_LABEL[alert.severity]}
                    </Badge>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {alert.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {alert.description}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="mt-auto h-auto w-fit px-0 py-0 text-xs font-medium"
                  >
                    <Link href={alert.href}>{alert.hrefLabel}</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {showPagination && (
          <div className="mt-5 flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent className="gap-3">
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Önceki sayfa"
                    className="h-9 w-9 cursor-pointer rounded-full"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <div
                    className="flex items-baseline gap-1.5 px-2 tabular-nums"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="text-2xl font-semibold leading-none text-rose-500">
                      {pad2(safePage)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {pad2(totalPages)}
                    </span>
                    <span className="ml-2 text-xs font-medium text-emerald-500">
                      %{progressPercent}
                    </span>
                  </div>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Sonraki sayfa"
                    className="h-9 w-9 cursor-pointer rounded-full"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-xs text-muted-foreground">
              {startIdx + 1}-{endIdx} / {alerts.length} uyarı{" "}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
