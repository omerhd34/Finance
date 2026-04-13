"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
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
      };
      dispatch(setUser(u));
    } else {
      dispatch(clearUser());
    }
  }, [session, status, dispatch]);

  return null;
}
