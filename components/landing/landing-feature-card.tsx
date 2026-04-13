import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function LandingFeatureCard({ title, description, icon: Icon }: Props) {
  return (
    <Card
      className={cn(
        "group rounded-2xl landing-card landing-card--interactive",
      )}
    >
      <CardHeader className="gap-4 p-6 sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/15 to-emerald-600/5 ring-1 ring-emerald-500/20 transition duration-300 group-hover:scale-105 group-hover:ring-emerald-500/35">
          <Icon className="h-6 w-6 text-emerald-400" aria-hidden />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold leading-snug text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-[15px] leading-relaxed text-zinc-400">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
