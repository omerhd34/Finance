export const SUPPORT_CONFIG = {
  responseTime: "Genellikle 24 saat içinde yanıt",
  workingHours: "Pazartesi – Cumartesi · 09:00 – 18:00 (TR)",
  location: "İstanbul, Türkiye",
  locationMapUrl:
    "https://www.google.com/maps/search/?api=1&query=Istanbul%2C+Turkey",
  whatsappPrefilledMessage:
    "Merhaba, IQfinansAI hakkında bilgi almak istiyorum.",
} as const;

export function getSupportEmail(): string | null {
  const direct = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return direct || null;
}

export function getSupportPhone(): string | null {
  const direct = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  return direct || null;
}

export function normalizePhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function buildWhatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(SUPPORT_CONFIG.whatsappPrefilledMessage);
  return `https://wa.me/${digits}?text=${text}`;
}
