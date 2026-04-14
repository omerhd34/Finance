"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  console.error(error);

  return (
    <section className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-destructive/30 bg-card p-8 shadow-lg">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        Bu bolum yuklenemedi
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Gecici bir hata olusmus olabilir. Verileri tekrar yuklemeyi dene.
      </p>
      <div className="mt-5 flex gap-3">
        <Button onClick={reset} className="cursor-pointer">
          Tekrar dene
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.assign("/dashboard")}
          className="cursor-pointer"
        >
          Dashboard ana sayfasi
        </Button>
      </div>
    </section>
  );
}
