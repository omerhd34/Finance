"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-xl rounded-2xl border border-destructive/30 bg-card p-8 shadow-xl">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bir hata oluştu.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bu beklenmedik bir durum. Sayfayı tekrar yüklemeyi deneyebilirsin.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset} className="cursor-pointer">
            <RefreshCw className="h-4 w-4" />
            Tekrar deneyin.
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.assign("/")}
            className="cursor-pointer"
          >
            Ana sayfaya git.
          </Button>
        </div>
      </section>
    </main>
  );
}
