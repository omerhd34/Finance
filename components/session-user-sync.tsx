"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiClient } from "@/lib/client/api-client";
import { normalizePlanTier } from "@/lib/premium/plan-tier";
import { clearUser, setUser, type AuthUser } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store";

type ProfilePayload = {
  image: string | null;
  planTier?: string | null;
};

function buildAuthUserFromSession(session: {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    currency?: string | null;
    phone?: string | null;
    profession?: string | null;
    city?: string | null;
    country?: string | null;
    monthStartDay?: number | null;
    notificationsEnabled?: boolean | null;
    planTier?: string | null;
  };
}): AuthUser {
  const u = session.user;
  return {
    id: u.id,
    name: u.name ?? null,
    email: u.email ?? null,
    image: u.image ?? null,
    currency: u.currency ?? "TL",
    phone: u.phone ?? null,
    profession: u.profession ?? null,
    city: u.city ?? null,
    country: u.country ?? null,
    monthStartDay: u.monthStartDay ?? 1,
    notificationsEnabled: u.notificationsEnabled !== false,
    planTier: normalizePlanTier(u.planTier),
  };
}

export function SessionUserSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const userImage = session?.user?.image;
  const userCurrency = session?.user?.currency;
  const userPhone = session?.user?.phone;
  const userProfession = session?.user?.profession;
  const userCity = session?.user?.city;
  const userCountry = session?.user?.country;
  const userMonthStartDay = session?.user?.monthStartDay;
  const userNotificationsEnabled = session?.user?.notificationsEnabled;
  const userPlanTier = session?.user?.planTier;

  useEffect(() => {
    if (status === "loading") return;

    if (!userId || !userEmail) {
      dispatch(clearUser());
      return;
    }

    const base = buildAuthUserFromSession({
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        image: userImage,
        currency: userCurrency,
        phone: userPhone,
        profession: userProfession,
        city: userCity,
        country: userCountry,
        monthStartDay: userMonthStartDay,
        notificationsEnabled: userNotificationsEnabled,
        planTier: userPlanTier,
      },
    });
    dispatch(setUser(base));

    let cancelled = false;
    void (async () => {
      try {
        const { data } =
          await apiClient.get<ProfilePayload>("/api/user/profile");
        if (cancelled) return;
        dispatch(
          setUser({
            ...base,
            image: data.image ?? base.image,
            planTier: normalizePlanTier(data.planTier ?? userPlanTier),
          }),
        );
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [
    status,
    dispatch,
    userId,
    userName,
    userEmail,
    userImage,
    userCurrency,
    userPhone,
    userProfession,
    userCity,
    userCountry,
    userMonthStartDay,
    userNotificationsEnabled,
    userPlanTier,
  ]);

  return null;
}
