"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavingsGoalForm } from "@/components/calculations/savings-goal-form";

export default function SavingsGoalCalculationPage() {
  return (
    <div className="mx-auto max-w-8xl space-y-6">
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
            <Target className="h-3.5 w-3.5" aria-hidden />
            Birikim Hedefi Aracı
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            Hangi senaryoyu hesaplamak istiyorsunuz?
          </h1>
          <p className="mt-2 max-w-7xl text-sm leading-relaxed text-muted-foreground md:text-base">
            <strong className="font-semibold text-foreground/85">
              Toplam birikim
            </strong>{" "}
            sekmesinde düzenli tasarrufun sonunda elde edeceğiniz tutarı,{" "}
            <strong className="font-semibold text-foreground/85">
              hedef süresi
            </strong>{" "}
            sekmesinde o tutara ulaşma zamanını,{" "}
            <strong className="font-semibold text-foreground/85">
              gerekli tasarruf
            </strong>{" "}
            sekmesinde ise hedef için ne kadar düzenli birikim gerektiğini
            görürsünüz. Getiri reel olarak girilmelidir.
          </p>
        </div>
      </div>

      <Tabs defaultValue="future-value" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 shadow-sm backdrop-blur sm:grid-cols-3">
          <TabsTrigger
            value="future-value"
            className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-500/8 hover:text-foreground data-[state=active]:border-emerald-500/30 data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            <PiggyBank
              className="h-4 w-4 text-emerald-600 transition-colors group-data-[state=active]:text-white dark:text-emerald-400"
              aria-hidden
            />
            Toplam Birikim
          </TabsTrigger>
          <TabsTrigger
            value="duration"
            className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-500/8 hover:text-foreground data-[state=active]:border-emerald-500/30 data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            <CalendarClock
              className="h-4 w-4 text-emerald-600 transition-colors group-data-[state=active]:text-white dark:text-emerald-400"
              aria-hidden
            />
            Hedef Süresi
          </TabsTrigger>
          <TabsTrigger
            value="contribution"
            className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-500/8 hover:text-foreground data-[state=active]:border-emerald-500/30 data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
          >
            <TrendingUp
              className="h-4 w-4 text-emerald-600 transition-colors group-data-[state=active]:text-white dark:text-emerald-400"
              aria-hidden
            />
            Gerekli Tasarruf
          </TabsTrigger>
        </TabsList>

        <TabsContent value="future-value">
          <SavingsGoalForm mode="future-value" />
        </TabsContent>
        <TabsContent value="duration">
          <SavingsGoalForm mode="duration" />
        </TabsContent>
        <TabsContent value="contribution">
          <SavingsGoalForm mode="contribution" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
