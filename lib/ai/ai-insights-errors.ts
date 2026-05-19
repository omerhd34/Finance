import axios from "axios";
import { EmailVerificationRequiredError } from "@/lib/email/email-verification-client";

const DEFAULT_MSG =
  "AI yanıtı alınamadı. GEMINI_API_KEY ve Google AI Studio kredinizi kontrol edin.";

export function messageFromAiAnalyzeError(err: unknown): string {
  if (err instanceof EmailVerificationRequiredError) return err.message;
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    return typeof msg === "string" ? msg : DEFAULT_MSG;
  }
  return DEFAULT_MSG;
}
