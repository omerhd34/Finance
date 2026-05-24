"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/client/api-client";
import { cn } from "@/lib/common/utils";
import { PREMIUM_TRIAL_DAYS } from "@/lib/premium/premium-subscription-constants";

export function DashboardEmailVerificationBanner({
  className,
}: {
  className?: string;
}) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const refreshedRef = useRef(false);

  useEffect(() => {
    if (refreshedRef.current) return;
    if (status !== "authenticated") return;
    if (session?.user?.isEmailVerified !== false) return;
    refreshedRef.current = true;
    void (async () => {
      try {
        await updateSession({ reloadUser: true } as Record<string, unknown>);
        router.refresh();
      } catch {
        /* noop */
      }
    })();
  }, [status, session?.user?.isEmailVerified, updateSession, router]);

  if (!session?.user) return null;
  if (session.user.isEmailVerified !== false) return null;

  async function handleSendEmail() {
    setSending(true);
    try {
      const { data } = await apiClient.post<{
        ok?: boolean;
        message?: string;
        sent?: boolean;
      }>("/api/auth/verify-email/send");
      if (data?.sent) {
        toast.success("Doğrulama e-postası gönderildi.");
        await updateSession({ reloadUser: true } as Record<string, unknown>);
        router.refresh();
      } else if (data?.message) {
        toast.info(data.message);
      }
    } catch (e: unknown) {
      const ax = e as {
        response?: { data?: { error?: string; code?: string } };
      };
      if (ax.response?.data?.code === "ALREADY_VERIFIED") {
        await updateSession({ reloadUser: true } as Record<string, unknown>);
        router.refresh();
        return;
      }
      toast.error(
        ax.response?.data?.error ??
          "E-posta gönderilemedi. Bir süre sonra tekrar deneyin.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      aria-label="E-posta doğrulama"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-amber-500/35 bg-linear-to-br from-amber-500/12 via-card to-card p-5 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/25 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
            <MailWarning
              className="h-4 w-4 text-amber-600 dark:text-amber-300"
              aria-hidden
            />
          </span>
          <span className="text-sm font-semibold tracking-wide text-amber-700 dark:text-amber-300">
            DOĞRULAMA
          </span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Hesabınızı doğrulayın ve {PREMIUM_TRIAL_DAYS} gün Premium kazanın.
        </h2>
        <p className="max-w-5xl text-pretty text-sm leading-relaxed text-muted-foreground">
          E-posta adresinize gönderilecek bağlantıyla hesabınızı doğrulayın;
          doğrulama sonrası {PREMIUM_TRIAL_DAYS} günlük <strong>Premium</strong>{" "}
          denemeniz otomatik olarak başlar.
        </p>
      </div>
      <Button
        type="button"
        disabled={sending}
        onClick={() => void handleSendEmail()}
        className="h-11 w-full shrink-0 cursor-pointer rounded-full bg-amber-500 px-6 text-base font-semibold text-black shadow-md shadow-amber-900/35 transition hover:bg-amber-400 hover:shadow-lg disabled:opacity-70 dark:text-white sm:w-auto sm:self-center"
      >
        {sending ? "Gönderiliyor…" : "Doğrulama e-postası gönder"}
      </Button>
    </section>
  );
}
