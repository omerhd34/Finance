import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
      </div>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card/85 px-8 py-6 text-center shadow-xl backdrop-blur">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">
          Sayfa hazirlaniyor...
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Veriler yuklenirken kisa bir bekleme olabilir.
        </p>
      </div>
    </main>
  );
}
