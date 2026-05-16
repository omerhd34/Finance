const TRUST_BRAND = "IQfinansAI";
const TRUST_MEMBER_DISPLAY_BASE = 15685;

export type PublicTrustMemberLineParts = {
  beforeCount: string;
  countFormatted: string;
  afterCountBeforeBrand: string;
  brand: string;
  afterBrand: string;
};

export function buildPublicTrustMemberLineParts(
  registeredMemberCount: number,
): PublicTrustMemberLineParts | null {
  if (!Number.isFinite(registeredMemberCount) || registeredMemberCount < 0) {
    return null;
  }

  const displayCount = TRUST_MEMBER_DISPLAY_BASE + registeredMemberCount;
  if (displayCount < 1) return null;

  const countFormatted = displayCount.toLocaleString("tr-TR");
  return {
    beforeCount: "Şu an ",
    countFormatted,
    afterCountBeforeBrand: " kişi ",
    brand: TRUST_BRAND,
    afterBrand: " ile bütçesini takip ediyor.",
  };
}
