import { Lock, Users } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { buildPublicTrustMemberLineParts } from "@/lib/site/trust";

async function fetchRegisteredMemberLineParts() {
  try {
    const memberCount = await prisma.user.count();
    return buildPublicTrustMemberLineParts(memberCount);
  } catch {
    return null;
  }
}

export async function LandingHeroTrust() {
  noStore();
  const memberParts = await fetchRegisteredMemberLineParts();

  return (
    <div className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-4 text-left xl:mx-0 xl:max-w-104">
      <div className="rounded-2xl bg-linear-to-br from-emerald-400/35 via-emerald-600/15 to-teal-900/25 p-px shadow-[0_12px_40px_-8px_rgba(16,185,129,0.22)]">
        <div className="flex items-start gap-3 rounded-[15px] bg-black/45 px-4 py-3.5 backdrop-blur-xl sm:items-center sm:gap-3.5 sm:py-3 ring-1 ring-white/10">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/35 to-emerald-950/50 text-emerald-100 shadow-inner ring-1 ring-emerald-400/25"
            aria-hidden
          >
            <Lock className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[13px] font-semibold leading-snug tracking-wide text-white sm:text-sm">
              Verileriniz şifreli saklanır.
            </p>
            <p className="text-[12px] leading-relaxed text-white/72 sm:text-[13px]">
              Pazarlama veya reklam için üçüncü taraflarla paylaşılmaz.
            </p>
          </div>
        </div>
      </div>

      {memberParts ? (
        <div className="flex justify-center xl:justify-start">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/35 px-4 py-2 text-[13px] leading-snug text-emerald-50/95 shadow-sm backdrop-blur-md ring-1 ring-emerald-500/15 sm:text-sm">
            <Users
              className="h-4 w-4 shrink-0 text-emerald-300/90"
              aria-hidden
            />
            <span>
              {memberParts.beforeCount}
              <strong className="font-bold">
                {memberParts.countFormatted}
              </strong>
              {memberParts.afterCountBeforeBrand}
              <strong className="font-bold">{memberParts.brand}</strong>
              {memberParts.afterBrand}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
