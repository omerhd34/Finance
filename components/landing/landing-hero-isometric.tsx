"use client";

import { useMemo } from "react";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

function formatTurkishMonthYear(date: Date): string {
  const raw = new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return raw.charAt(0).toLocaleUpperCase("tr-TR") + raw.slice(1);
}

const barHeights = [32, 54, 42, 71, 88, 62];

const categories = [
  { label: "Market", pct: 90, val: "₺18.840" },
  { label: "Ulaşım", pct: 59, val: "₺3.200" },
  { label: "Yemek", pct: 70, val: "₺7.750" },
  { label: "Abonelik", pct: 23, val: "₺3.000" },
];

export function LandingHeroIsometricIllustration() {
  const monthYearLabel = useMemo(() => formatTurkishMonthYear(new Date()), []);

  return (
    <div
      className="flex w-full flex-col gap-2.5"
      role="img"
      aria-label="IQfinansAI kişisel finans dashboard önizlemesi"
    >
      <div className="rounded-2xl border border-white/10 bg-white/4.5 p-4 backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Aylık harcama
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 shrink-0">
            <TrendingDown
              className="h-2.5 w-2.5 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            Geçen aya göre %8 az
          </span>
        </div>
        <p className="mt-1.5 text-[26px] font-bold leading-none tracking-tight text-white">
          ₺42.840
        </p>
        <p className="mt-1 text-xs text-white/40">{monthYearLabel}</p>
        <div className="mt-3 flex h-12 items-end gap-1" aria-hidden>
          {barHeights.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${
                i === barHeights.length - 1
                  ? "bg-emerald-500"
                  : "bg-emerald-500/20"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 backdrop-blur-md sm:p-3.5">
          <span className="block text-[9px] font-semibold uppercase tracking-widest text-white/35 mb-1.5 sm:text-[10px]">
            Birikim hedefi
          </span>
          <p className="text-lg font-bold leading-none tracking-tight text-emerald-400 tabular-nums sm:text-xl">
            %68
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <div className="h-full w-[68%] rounded-full bg-linear-to-r from-emerald-800 to-emerald-400" />
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 backdrop-blur-md sm:p-3.5">
          <span className="block text-[9px] font-semibold uppercase tracking-widest text-white/35 mb-1.5 sm:text-[10px]">
            Kalan borç
          </span>
          <p className="text-lg font-bold leading-none tracking-tight text-amber-400 tabular-nums sm:text-xl">
            ₺8.200
          </p>
          <p className="mt-2 text-[10px] text-white/40 sm:text-[11px]">
            4 taksit kaldı
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 backdrop-blur-md sm:p-3.5">
          <span className="block text-[9px] font-semibold uppercase tracking-widest text-white/35 mb-1.5 sm:text-[10px]">
            Net akış
          </span>
          <p className="text-lg font-bold leading-none tracking-tight text-sky-400 tabular-nums sm:text-xl">
            +₺15.180
          </p>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-white/40 sm:text-[11px]">
            <TrendingUp
              className="h-3 w-3 shrink-0 text-sky-400/90"
              strokeWidth={2.25}
              aria-hidden
            />
            Bu ay pozitif
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/4.5 p-4 backdrop-blur-md">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-3">
          Harcama dağılımı
        </span>
        <div className="flex flex-col gap-2" aria-hidden>
          {categories.map(({ label, pct, val }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-[11px] text-white/45">
                {label}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-11 shrink-0 text-right text-[11px] text-white/50">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3.5 backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
          <Sparkles
            className="h-4 w-4 text-emerald-400"
            strokeWidth={1.8}
            aria-hidden
          />
        </div>
        <p className="text-[12.5px] leading-relaxed text-white/60">
          <strong className="font-semibold text-emerald-300">
            AI önerisi:
          </strong>{" "}
          Market harcamaların bu ay %22 arttı. Bütçeni ₺800 sabitlesen hedefe 3
          ay erken ulaşırsın.
        </p>
      </div>
    </div>
  );
}
