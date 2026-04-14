"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: Props) {
  console.error(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-destructive/35 bg-zinc-900 p-8 shadow-xl">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Giris ekraninda hata olustu
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sayfayi yenileyip tekrar denemeni oneririz.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={reset} className="cursor-pointer">
            Tekrar dene
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.assign("/")}
            className="cursor-pointer border-zinc-700 text-zinc-100 hover:bg-zinc-800"
          >
            Ana sayfaya don
          </Button>
        </div>
      </section>
    </main>
  );
}
