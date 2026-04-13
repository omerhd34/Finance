import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function LandingPageShell({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#09090b] text-foreground antialiased">
      {/* Arka plan: ızgara + yumuşak ışık lekeleri */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#09090b_0%,#0c0c0e_50%,#09090b_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute -left-32 top-0 h-[min(70vh,520px)] w-[min(70vh,520px)] rounded-full bg-emerald-500/12 blur-[100px]" />
        <div className="absolute -right-20 top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-600/6 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-[280px] w-[480px] -translate-x-1/2 rounded-full bg-zinc-800/40 blur-[80px]" />
      </div>
      {children}
    </div>
  );
}
