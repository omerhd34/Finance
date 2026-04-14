import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

export default function DashboardGroupLoading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-44 animate-pulse rounded-md bg-muted" />
      <DashboardPageSkeleton />
    </div>
  );
}
