import axios, { type AxiosError } from "axios";
import {
  EmailVerificationRequiredError,
  EMAIL_NOT_VERIFIED_USER_MESSAGE,
} from "@/lib/email-verification-client";

export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ error?: string; code?: string }>) => {
    if (
      error.response?.status === 403 &&
      error.response.data?.code === "EMAIL_NOT_VERIFIED"
    ) {
      const msg =
        typeof error.response.data.error === "string" &&
        error.response.data.error.length > 0
          ? error.response.data.error
          : EMAIL_NOT_VERIFIED_USER_MESSAGE;
      return Promise.reject(new EmailVerificationRequiredError(msg));
    }
    return Promise.reject(error);
  },
);
