declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function fireGoogleAdsPurchaseConversion(): void {
  if (typeof window === "undefined") return;
  const { gtag } = window;
  if (typeof gtag !== "function") return;
  gtag("event", "purchase", {
    send_to: "AW-18071789147/VeuiCNeX0JccENu8pqlD",
    value: 1,
    currency: "TRY",
  });
}
