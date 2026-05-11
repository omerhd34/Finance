import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/common/utils";

type Props = {
  href: string;
  label: string;
  className?: string;
};

export function DashboardSectionActionLink({ href, label, className }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("w-full shrink-0 gap-1.5 sm:w-auto", className)}
      asChild
    >
      <Link
        href={href}
        className="flex w-full items-center justify-center gap-1.5 sm:inline-flex sm:w-auto"
      >
        {label}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </Link>
    </Button>
  );
}
