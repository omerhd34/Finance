import { Skeleton } from "@/components/ui/skeleton";

export function AiInsightsLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
