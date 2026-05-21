/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/client/api-client";

export function useNotificationUnreadCount() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ unreadCount: number }>(
        "/api/notifications?countOnly=1",
      );
      setUnreadCount(data.unreadCount);
    } catch {
      /* sessiz */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshUnread();
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [refreshUnread]);

  useEffect(() => {
    void refreshUnread();
  }, [pathname, refreshUnread]);

  useEffect(() => {
    const onFocus = () => void refreshUnread();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshUnread();
    };
    const onRefreshEvent = () => void refreshUnread();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("notifications:refresh", onRefreshEvent);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("notifications:refresh", onRefreshEvent);
    };
  }, [refreshUnread]);

  return { unreadCount, refreshUnread, setUnreadCount };
}
