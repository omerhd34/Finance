import axios from "axios";

const DEFAULT_MSG =
  "Analiz alınamadı. API anahtarını ve bağlantıyı kontrol edin.";

export function messageFromAiAnalyzeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    return typeof msg === "string" ? msg : DEFAULT_MSG;
  }
  return DEFAULT_MSG;
}
