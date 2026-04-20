"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiClient } from "@/lib/api-client";
import { normalizePlanTier } from "@/lib/plan-tier";
import { clearUser, setUser, type AuthUser } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store";

type ProfilePayload = {
  image: string | null;
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

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id || !session.user.email) {
      dispatch(clearUser());
      return;
    }

    const base = buildAuthUserFromSession(session);

    if (session.user.image) {
      dispatch(setUser(base));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const { data } = await apiClient.get<ProfilePayload>("/api/user/profile");
        if (cancelled) return;
        dispatch(
          setUser({
            ...base,
            image: data.image ?? null,
          }),
        );
      } catch {
        if (!cancelled) dispatch(setUser(base));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, status, dispatch]);

  return null;
}
