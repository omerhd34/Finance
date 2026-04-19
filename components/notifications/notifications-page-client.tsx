"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingMessage } from "@/components/ui/loading-message";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function formatDateTimeTr(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsPageClient() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<{
        items: NotificationItem[];
        unreadCount: number;
      }>("/api/notifications?limit=100");
      setItems(data.items);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const err = e.response?.data;
        const msg =
          err &&
          typeof err === "object" &&
          "error" in err &&
          typeof (err as { error?: unknown }).error === "string"
            ? (err as { error: string }).error
            : null;
        setError(msg ?? "Bildirimler yüklenemedi");
      } else {
        setError("Bildirimler yüklenemedi");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    try {
      await apiClient.patch(`/api/notifications/${id}`, { read: true });
      setItems((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, readAt: new Date().toISOString() } : x,
        ),
      );
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
    } catch {
      /* ignore */
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  }

  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer"
            onClick={() => void markAllRead()}
          >
            Tümünü okundu işaretle
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingMessage variant="page" />
      ) : (
        <>
          {!error && items.length === 0 && (
            <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              Henüz bildirim yok.
            </p>
          )}

          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <article
                  className={cn(
                    "relative rounded-xl border border-border bg-card p-4 shadow-sm transition-colors",
                    !n.readAt && "border-primary/25 bg-primary/4",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        if (!n.readAt) void markRead(n.id);
                      }}
                    >
                      <h3 className="pr-2 font-medium leading-snug">
                        {n.title}
                      </h3>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="relative -right-1 -top-1 h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label="Bildirimi sil"
                      disabled={deletingId === n.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void remove(n.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/80">
                    {formatDateTimeTr(n.createdAt)}
                  </p>
                  {(n.type === "budget_threshold" ||
                    n.type === "budget_exceeded") && (
                    <Link
                      href="/budgets"
                      className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Bütçelere git
                    </Link>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
