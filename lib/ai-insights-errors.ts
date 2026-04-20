import axios from "axios";
import { EmailVerificationRequiredError } from "@/lib/email-verification-client";

const DEFAULT_MSG =
  "Analiz alınamadı. API anahtarını ve bağlantıyı kontrol edin.";

export function messageFromAiAnalyzeError(err: unknown): string {
  if (err instanceof EmailVerificationRequiredError) return err.message;
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    return typeof msg === "string" ? msg : DEFAULT_MSG;
  }
  return DEFAULT_MSG;
}
