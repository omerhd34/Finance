"use client";

import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./globals.css";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  console.error(error);

  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-6">
          <section className="w-full max-w-xl rounded-2xl border border-destructive/30 bg-card p-8 shadow-xl">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Uygulama geçici olarak kullanılamıyor.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kritik bir hata alındı. Tekrar denemek genelde sorunu çözer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={reset} className="cursor-pointer">
                Yeniden deneyin.
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
      </body>
    </html>
  );
}
