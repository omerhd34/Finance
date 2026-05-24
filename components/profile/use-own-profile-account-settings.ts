"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { accountDeleteSchema } from "@/lib/schemas/validations";
import { apiClient } from "@/lib/client/api-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { normalizePlanTier } from "@/lib/premium/plan-tier";
import { parseApiErrorForUser } from "@/lib/email/email-verification-client";
import type { z } from "zod";

function formatPremiumUntilTr(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const datePart = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Istanbul",
  }).format(d);
  return `${datePart} - ${timePart}`;
}

export type ProfilePatchResponse = {
  name: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  monthStartDay: number;
  email: string;
  phone: string | null;
  currency: string;
  image: string | null;
  notificationsEnabled: boolean;
  planTier: string;
  premiumUntil: string | null;
};

export type LatestShopierOrder = {
  id: string;
  orderCode: string;
  status: string;
  amountTry: number | null;
  currency: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type DeleteFormValues = z.input<typeof accountDeleteSchema>;

export function useOwnProfileAccountSettings(ownProfile: boolean) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [latestOrder, setLatestOrder] = useState<LatestShopierOrder | null>(
    null,
  );
  const [premiumUntilIso, setPremiumUntilIso] = useState<string | null>(null);
  const [awaitingCheckoutCompletion, setAwaitingCheckoutCompletion] =
    useState(false);
  const checkoutWindowRef = useRef<Window | null>(null);
  const checkoutWindowWatchRef = useRef<number | null>(null);
  const currentPlan = normalizePlanTier(session?.user?.planTier);
  const premiumEndFormatted =
    currentPlan === "premium" ? formatPremiumUntilTr(premiumUntilIso) : null;

  const deleteForm = useForm<DeleteFormValues>({
    resolver: zodResolver(accountDeleteSchema),
    defaultValues: { confirm: "" },
  });

  useEffect(() => {
    if (!ownProfile) return;
    setNotificationsEnabled(session?.user?.notificationsEnabled !== false);
  }, [session, ownProfile]);

  useEffect(() => {
    if (!ownProfile || !session?.user?.id) return;
    let cancelled = false;
    async function loadLatestOrder() {
      try {
        const { data } = await apiClient.get<{
          order: LatestShopierOrder | null;
        }>("/api/shopier/orders/latest");
        if (!cancelled) setLatestOrder(data.order ?? null);
      } catch {
        if (!cancelled) setLatestOrder(null);
      }
    }
    void loadLatestOrder();

    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadLatestOrder();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [ownProfile, session?.user?.id]);

  useEffect(() => {
    if (!ownProfile || !session?.user?.id) {
      if (!ownProfile) setPremiumUntilIso(null);
      return;
    }
    let cancelled = false;
    async function loadPremiumUntil() {
      try {
        const { data } = await apiClient.get<{
          premiumUntil: string | null;
        }>("/api/user/profile");
        const raw = data.premiumUntil;
        if (!cancelled) setPremiumUntilIso(raw ?? null);
      } catch {
        if (!cancelled) setPremiumUntilIso(null);
      }
    }
    void loadPremiumUntil();
    return () => {
      cancelled = true;
    };
  }, [ownProfile, session?.user?.id, currentPlan, latestOrder?.status]);

  useEffect(() => {
    if (!ownProfile) return;
    if (latestOrder?.status !== "PAID") return;
    if (currentPlan === "premium") return;
    setAwaitingCheckoutCompletion(false);
    void (async () => {
      await updateSession({ reloadUser: true } as Record<string, unknown>);
      router.refresh();
    })();
  }, [ownProfile, currentPlan, latestOrder?.status, router, updateSession]);

  useEffect(() => {
    return () => {
      if (checkoutWindowWatchRef.current != null) {
        window.clearInterval(checkoutWindowWatchRef.current);
      }
      checkoutWindowWatchRef.current = null;
      checkoutWindowRef.current = null;
    };
  }, []);

  async function onNotificationsEnabledChange(checked: boolean) {
    if (!session?.user?.id) return;
    setNotifSaving(true);
    try {
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        { notificationsEnabled: checked },
      );
      setNotificationsEnabled(data.notificationsEnabled !== false);
      dispatch(
        setUser({
          id: session.user.id,
          name: data.name,
          email: data.email,
          image: data.image ?? null,
          currency: data.currency,
          phone: data.phone ?? null,
          profession: data.profession ?? null,
          city: data.city ?? null,
          country: data.country ?? null,
          monthStartDay: data.monthStartDay ?? 1,
          notificationsEnabled: data.notificationsEnabled !== false,
          planTier: normalizePlanTier(data.planTier),
        }),
      );
      await updateSession({
        notificationsEnabled: data.notificationsEnabled !== false,
        reloadUser: true,
      } as Record<string, unknown>);
      router.refresh();
    } catch {
      setNotificationsEnabled(!checked);
    } finally {
      setNotifSaving(false);
    }
  }

  async function openPremiumCheckout() {
    if (!session?.user?.id) return;
    if (normalizePlanTier(session.user.planTier) === "premium") return;
    setCheckoutError(null);
    setCheckoutBusy(true);
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>(
        "/api/shopier/init",
        {},
      );
      const checkoutUrl = data.checkoutUrl;
      const opened = window.open(checkoutUrl, "_blank");
      if (opened) {
        opened.opener = null;
        checkoutWindowRef.current = opened;
        setAwaitingCheckoutCompletion(true);
        if (checkoutWindowWatchRef.current != null) {
          window.clearInterval(checkoutWindowWatchRef.current);
        }
        checkoutWindowWatchRef.current = window.setInterval(() => {
          const popup = checkoutWindowRef.current;
          if (!popup || popup.closed) {
            setAwaitingCheckoutCompletion(false);
            if (checkoutWindowWatchRef.current != null) {
              window.clearInterval(checkoutWindowWatchRef.current);
              checkoutWindowWatchRef.current = null;
            }
            checkoutWindowRef.current = null;
          }
        }, 1000);
      } else {
        setAwaitingCheckoutCompletion(true);
        window.location.assign(checkoutUrl);
      }
    } catch (e) {
      setCheckoutError(
        parseApiErrorForUser(e, "Ödeme başlatılamadı. Lütfen tekrar deneyin."),
      );
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function onDelete(values: DeleteFormValues) {
    await apiClient.delete("/api/user", { data: values });
    await signOut({ callbackUrl: "/" });
  }

  return {
    session,
    notificationsEnabled,
    notifSaving,
    onNotificationsEnabledChange,
    checkoutBusy,
    checkoutError,
    latestOrder,
    premiumEndFormatted,
    premiumUntilIso,
    currentPlan,
    awaitingCheckoutCompletion,
    openPremiumCheckout,
    deleteForm,
    onDelete,
  };
}
