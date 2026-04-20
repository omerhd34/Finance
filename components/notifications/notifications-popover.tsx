"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LoadingMessage } from "@/components/ui/loading-message";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{
        items: NotificationItem[];
        unreadCount: number;
      }>("/api/notifications?limit=25");
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const t = window.setInterval(() => void refreshUnread(), 60000);
    return () => window.clearInterval(t);
  }, [refreshUnread]);

  useEffect(() => {
    if (open) void loadList();
  }, [open, loadList]);

  async function markRead(id: string) {
    try {
      await apiClient.patch(`/api/notifications/${id}`, { read: true });
      setItems((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, readAt: new Date().toISOString() } : x,
        ),
      );
      void refreshUnread();
    } catch {
      /* ignore */
    }
  }

  async function remove(id: string) {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
      void refreshUnread();
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    try {
      await apiClient.post("/api/notifications/read-all");
      setItems((prev) =>
        prev.map((x) => ({
          ...x,
          readAt: x.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Bildirimler"
          className="relative cursor-pointer"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,22rem)] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <Link
            href="/bildirimler"
            className="text-sm font-medium hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Bildirimler
          </Link>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 cursor-pointer text-xs"
              onClick={() => void markAllRead()}
            >
              Tümünü okundu işaretle
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <LoadingMessage variant="panel" className="px-3" />
          ) : (
            <>
              {items.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Bildirim yok
                </p>
              )}
              <ul className="divide-y divide-border">
                {items.map((n) => (
                  <li key={n.id} className="relative">
                    <div
                      className={cn(
                        "flex gap-1 px-2 py-2 text-sm transition-colors hover:bg-muted/60",
                        !n.readAt && "bg-primary/5",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 px-1 py-0.5 text-left"
                        onClick={() => {
                          if (!n.readAt) void markRead(n.id);
                        }}
                      >
                        <p className="font-medium leading-snug">{n.title}</p>
                        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                          {n.body}
                        </p>
                        {(n.type === "budget_threshold" ||
                          n.type === "budget_exceeded") && (
                          <Link
                            href="/butceler"
                            className="mt-2 inline-block text-xs font-medium text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Bütçelere git
                          </Link>
                        )}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                        aria-label="Sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          void remove(n.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {items.length > 0 && (
                <div className="border-t border-border px-3 py-2 text-center">
                  <Link
                    href="/bildirimler"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Tüm bildirimleri gör
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
