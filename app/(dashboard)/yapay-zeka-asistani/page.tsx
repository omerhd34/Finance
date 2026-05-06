"use client";

import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { AiAssistantHero } from "@/components/ai-insights/ai-insights-hero";
import { AiFinanceChat } from "@/components/ai-insights/ai-finance-chat";
import { PremiumPlanNotice } from "@/components/premium/premium-plan-notice";
import { normalizePlanTier } from "@/lib/premium/plan-tier";

export default function YapayZekaAsistaniPage() {
  const { data: session } = useSession();
  const planPremium = normalizePlanTier(session?.user?.planTier) === "premium";

  if (!planPremium) {
    const perks = [
      "İstediğiniz konuda Türkçe soru–cevap; finans sorularında her yanıtta veriler sunucuda yenilenir",
      "Tarayıcı destekliyse sesli soru girişi (Yeni işlem ekranında da geçerli)",
    ];

    return (
      <div className="space-y-6">
        <AiAssistantHero />
        <div className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            Premium ile neler kazanırsınız?
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {perks.map((line) => (
              <li key={line} className="flex gap-3">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/90"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <PremiumPlanNotice title="IQfinansAI Asistanı Premium plandadır." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AiAssistantHero />
      <AiFinanceChat />
    </div>
  );
}
