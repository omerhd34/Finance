import { getLandingPremiumPriceTry } from "@/components/landing/landing-content";

export const PREMIUM_PRICE_TRY = getLandingPremiumPriceTry();
export const PREMIUM_AMOUNT_KURUS = Math.round(PREMIUM_PRICE_TRY * 100);
