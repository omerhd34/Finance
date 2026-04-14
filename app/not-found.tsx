import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Compass className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Bu sayfa bulunamadı.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Link değişmiş olabilir ya da adres hatalı yazılmış olabilir.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Ana sayfaya git.</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Panele git.</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
