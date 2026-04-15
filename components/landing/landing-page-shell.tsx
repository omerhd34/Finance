import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function LandingPageShell({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f8fafc_0%,#f1f5f9_50%,#ffffff_100%)] dark:bg-[linear-gradient(to_bottom,#09090b_0%,#0c0c0e_50%,#09090b_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.2] dark:opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute -left-32 top-0 h-[min(70vh,520px)] w-[min(70vh,520px)] rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/12" />
        <div className="absolute -right-20 top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-600/10 blur-[90px] dark:bg-emerald-600/6" />
        <div className="absolute bottom-0 left-1/3 h-[280px] w-[480px] -translate-x-1/2 rounded-full bg-zinc-300/40 blur-[80px] dark:bg-zinc-800/40" />
      </div>
      {children}
    </div>
  );
}
