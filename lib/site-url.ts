export function getSiteUrl(): string {
  const raw = process.env.NEXTAUTH_URL?.trim() || "https://iqfinansai.com";
  return raw.replace(/\/+$/, "");
}
