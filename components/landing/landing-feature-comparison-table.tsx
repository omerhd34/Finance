import Link from "next/link";
import { LandingFeatureComparisonMobileSlider } from "@/components/landing/landing-feature-comparison-mobile-slider";
import {
  FeatureAvailability,
  planColumnCellClass,
} from "@/components/landing/landing-feature-comparison-shared";
import { Button } from "@/components/ui/button";
import { LANDING_FEATURES, LANDING_PLANS } from "./landing-content";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/common/utils";

const freePlan = LANDING_PLANS.find((plan) => plan.id === "free");
const premiumPlan = LANDING_PLANS.find((plan) => plan.id === "premium");
const planColumnHeaderClass = "bg-emerald-500/8";

export function LandingFeatureComparisonTable() {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-border/60",
        "dark:shadow-emerald-950/20",
      )}
    >
      <div className="px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5 md:hidden">
        <LandingFeatureComparisonMobileSlider />
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableHead className="h-14 px-4 py-4 text-left text-base font-semibold text-foreground sm:px-6">
                Özellik
              </TableHead>
              <TableHead
                className={cn(
                  "h-14 w-24 px-3 py-4 text-center text-base font-semibold text-foreground sm:w-28 sm:px-4",
                  planColumnHeaderClass,
                )}
              >
                Ücretsiz
              </TableHead>
              <TableHead
                className={cn(
                  "h-14 w-28 px-3 py-4 text-center text-base font-semibold text-foreground sm:w-32 sm:px-4",
                  planColumnHeaderClass,
                )}
              >
                <span className="inline-flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                  Premium
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LANDING_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isPremiumOnly = feature.premium === true;

              return (
                <TableRow
                  key={feature.title}
                  className="border-border/60 hover:bg-transparent"
                >
                  <TableCell className="px-4 py-4 align-top sm:px-6 sm:py-5">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/15 to-emerald-600/5 ring-1 ring-emerald-500/20 sm:h-11 sm:w-11">
                        <Icon
                          className="h-5 w-5 text-emerald-400"
                          aria-hidden
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-base font-semibold leading-snug text-foreground sm:text-[17px]">
                          {feature.title}
                        </p>
                        <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {isPremiumOnly ? (
                    <>
                      <TableCell
                        className={cn(
                          "px-3 py-4 align-middle sm:px-4 sm:py-5",
                          planColumnCellClass,
                        )}
                      >
                        <FeatureAvailability available={false} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-3 py-4 align-middle sm:px-4 sm:py-5",
                          planColumnCellClass,
                        )}
                      >
                        <FeatureAvailability available />
                      </TableCell>
                    </>
                  ) : (
                    <TableCell
                      colSpan={2}
                      className={cn(
                        "px-3 py-4 align-middle sm:px-4 sm:py-5",
                        planColumnCellClass,
                      )}
                    >
                      <FeatureAvailability available />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {freePlan && premiumPlan ? (
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableCell className="px-4 py-6 align-middle sm:px-6">
                  <p className="text-base font-semibold text-foreground">
                    Aylık fiyat (₺)
                  </p>
                </TableCell>
                <TableCell
                  className={cn(
                    "px-3 py-6 text-center align-middle sm:px-4",
                    planColumnCellClass,
                  )}
                >
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {freePlan.priceAmountTry}
                  </p>
                </TableCell>
                <TableCell
                  className={cn(
                    "px-3 py-6 text-center align-middle sm:px-4",
                    planColumnCellClass,
                  )}
                >
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {premiumPlan.priceAmountTry}
                  </p>
                </TableCell>
              </TableRow>
            ) : null}
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableCell colSpan={3} className="px-4 py-6 text-center sm:px-6">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full max-w-xs rounded-full bg-emerald-700 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-950/45 transition hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-950/50 sm:w-auto"
                >
                  <Link href="/kayit">Kayıt ol</Link>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
