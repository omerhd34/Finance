"use client";

import Link from "next/link";
import { ArrowLeft, Car, Home, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanForm } from "@/components/calculations/loan-form";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";

export default function LoanInstallmentCalculationPage() {
  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <DashboardEmailVerificationBanner />
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-2/5 bg-linear-to-l from-emerald-500/8 via-emerald-500/3 to-transparent md:block"
          aria-hidden
        />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground md:right-6 md:top-6"
        >
          <Link href="/hesaplamalar">
            <ArrowLeft className="h-3.5 w-3.5" />
            Hesaplamalara dön
          </Link>
        </Button>
        <div className="relative p-6 pl-7 md:p-8 md:pl-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            <WalletCards className="h-3.5 w-3.5" aria-hidden />
            Kredi Taksit
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            Hangi kredinin taksitini hesaplamak istiyorsunuz?
          </h1>
          <p className="mt-2 max-w-7xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Aşağıdaki sekmeden tür seçin:{" "}
            <strong className="font-semibold text-foreground/85">
              ihtiyaç
            </strong>{" "}
            ve{" "}
            <strong className="font-semibold text-foreground/85">taşıt</strong>{" "}
            kredilerinde aylık faize{" "}
            <strong className="font-semibold text-foreground/85">
              KKDF(%15)
            </strong>{" "}
            ve{" "}
            <strong className="font-semibold text-foreground/85">
              BSMV(%15)
            </strong>{" "}
            otomatik eklenir,{" "}
            <strong className="font-semibold text-foreground/85">konut</strong>{" "}
            kredisinde bu vergiler uygulanmaz.
          </p>
        </div>
      </div>

      <Tabs defaultValue="consumer" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 shadow-sm backdrop-blur sm:grid-cols-3">
          <TabsTrigger
            value="consumer"
            className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-500/8 hover:text-foreground data-[state=active]:border-emerald-500/30 data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            <WalletCards
              className="h-4 w-4 text-emerald-600 transition-colors group-data-[state=active]:text-white dark:text-emerald-400"
              aria-hidden
            />
            İhtiyaç Kredisi
          </TabsTrigger>
          <TabsTrigger
            value="housing"
            className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-500/8 hover:text-foreground data-[state=active]:border-emerald-500/30 data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            <Home
              className="h-4 w-4 text-emerald-600 transition-colors group-data-[state=active]:text-white dark:text-emerald-400"
              aria-hidden
            />
            Konut Kredisi
          </TabsTrigger>
          <TabsTrigger
            value="vehicle"
            className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-500/8 hover:text-foreground data-[state=active]:border-emerald-500/30 data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            <Car
              className="h-4 w-4 text-emerald-600 transition-colors group-data-[state=active]:text-white dark:text-emerald-400"
              aria-hidden
            />
            Taşıt Kredisi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consumer">
          <LoanForm loanType="consumer" />
        </TabsContent>
        <TabsContent value="housing">
          <LoanForm loanType="housing" />
        </TabsContent>
        <TabsContent value="vehicle">
          <LoanForm loanType="vehicle" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
