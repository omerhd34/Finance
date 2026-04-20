"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { normalizePlanTier } from "@/lib/plan-tier";
import { clearUser, setUser, type AuthUser } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store";

export function SessionUserSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.id && session.user.email) {
      const u: AuthUser = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
        currency: session.user.currency ?? "TL",
        phone: session.user.phone ?? null,
        profession: session.user.profession ?? null,
        city: session.user.city ?? null,
        country: session.user.country ?? null,
        monthStartDay: session.user.monthStartDay ?? 1,
        notificationsEnabled: session.user.notificationsEnabled !== false,
        planTier: normalizePlanTier(session.user.planTier),
      };
      dispatch(setUser(u));
    } else {
      dispatch(clearUser());
    }
  }, [session, status, dispatch]);

  return null;
}
