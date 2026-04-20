import axios from "axios";

export const EMAIL_NOT_VERIFIED_USER_MESSAGE =
  "Önce e-posta doğrulaması yapınız. Profil üzerinden doğrulama e-postası gönderebilirsiniz.";

export class EmailVerificationRequiredError extends Error {
  override name = "EmailVerificationRequiredError";
  constructor(message: string = EMAIL_NOT_VERIFIED_USER_MESSAGE) {
    super(message);
    Object.setPrototypeOf(this, EmailVerificationRequiredError.prototype);
  }
}

export function parseApiErrorForUser(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error instanceof EmailVerificationRequiredError) return error.message;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; code?: string }
      | undefined;
    if (data?.code === "EMAIL_NOT_VERIFIED" && typeof data.error === "string") {
      return data.error;
    }
    if (typeof data?.error === "string") return data.error;
  }
  if (
    error instanceof Error &&
    error.message &&
    error.message !== "Request failed with status code 403"
  ) {
    return error.message;
  }
  return fallback;
}
