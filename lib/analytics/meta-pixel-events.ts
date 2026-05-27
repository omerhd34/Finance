type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
};

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const f = window.fbq;
  if (typeof f !== "function") return;
  f(...args);
}

export function trackMetaCompleteRegistration(params?: {
  method?: string;
}): void {
  fbq("track", "CompleteRegistration", {
    status: "completed",
    ...(params?.method ? { method: params.method } : {}),
  });
}

export function trackMetaLogin(params?: { method?: string }): void {
  fbq("trackCustom", "Login", params?.method ? { method: params.method } : {});
}

export function trackMetaEmailVerified(): void {
  fbq("track", "Lead", { content_name: "email_verified" });
}

export function trackMetaContact(): void {
  fbq("track", "Contact");
}

export function trackMetaSubscribe(params?: {
  value?: number;
  currency?: string;
  predicted_ltv?: number;
}): void {
  fbq("track", "Subscribe", {
    currency: params?.currency ?? "TRY",
    ...(params?.value !== undefined ? { value: params.value } : {}),
    ...(params?.predicted_ltv !== undefined
      ? { predicted_ltv: params.predicted_ltv }
      : {}),
  });
}

export function trackMetaPurchase(params: {
  value: number;
  currency?: string;
  content_name?: string;
}): void {
  fbq("track", "Purchase", {
    value: params.value,
    currency: params.currency ?? "TRY",
    ...(params.content_name ? { content_name: params.content_name } : {}),
  });
}
