"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { normalizeUserCurrency } from "@/lib/currency";
import { normalizePlanTier } from "@/lib/plan-tier";
import { apiClient } from "@/lib/api-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ProfilePatchResponse = {
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
};

export type MemberProfileInitial = {
  id: string;
  name: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  monthStartDay: number;
  email: string;
  image: string | null;
  currency: string;
  planTier: "free" | "premium";
  createdAtIso: string;
};

type MemberProfileCardProps = {
  initial: MemberProfileInitial;
  ownProfile: boolean;
};

function profileInitials(name: string | null, email: string): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatMembershipDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function MemberProfileCard({
  initial,
  ownProfile,
}: MemberProfileCardProps) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    profession: initial.profession ?? "",
    city: initial.city ?? "",
    country: initial.country ?? "",
    monthStartDay: String(initial.monthStartDay),
    currency: normalizeUserCurrency(initial.currency),
  });

  useEffect(() => {
    setForm({
      name: initial.name ?? "",
      profession: initial.profession ?? "",
      city: initial.city ?? "",
      country: initial.country ?? "",
      monthStartDay: String(initial.monthStartDay),
      currency: normalizeUserCurrency(initial.currency),
    });
  }, [initial]);

  const monthStartDayNumber = useMemo(() => {
    const parsed = Number(form.monthStartDay);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(28, Math.max(1, Math.trunc(parsed)));
  }, [form.monthStartDay]);

  const planLabel = initial.planTier === "premium" ? "Premium" : "Free";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id || session.user.id !== initial.id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: form.name,
        profession: form.profession,
        city: form.city,
        country: form.country,
        monthStartDay: monthStartDayNumber,
        currency: normalizeUserCurrency(form.currency) as
          | "TL"
          | "USD"
          | "EUR"
          | "GBP",
      };
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        payload,
      );
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
        name: data.name ?? "",
        profession: data.profession ?? null,
        city: data.city ?? null,
        country: data.country ?? null,
        monthStartDay: data.monthStartDay ?? 1,
        currency: normalizeUserCurrency(data.currency),
        phone: data.phone ?? null,
        email: data.email,
        image: data.image ?? null,
        notificationsEnabled: data.notificationsEnabled !== false,
        reloadUser: true,
      } as Record<string, unknown>);
      setSuccess("Profil güncellendi.");
      router.refresh();
    } catch {
      setError("Profil güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (!ownProfile) {
    const currency = normalizeUserCurrency(initial.currency);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Üye Profili</CardTitle>
          <CardDescription>
            Seçili üyeye ait temel profil bilgileri.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={initial.image ?? undefined} alt="" />
              <AvatarFallback className="text-base">
                {profileInitials(initial.name, initial.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-foreground">
                {initial.name?.trim() || "İsimsiz üye"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {initial.email}
              </p>
            </div>
            <Badge
              variant={initial.planTier === "premium" ? "default" : "secondary"}
            >
              {planLabel}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 p-3">
              <p className="text-xs text-muted-foreground">Meslek</p>
              <p className="mt-1 text-sm font-medium">
                {initial.profession?.trim() || "Belirtilmemiş"}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 p-3">
              <p className="text-xs text-muted-foreground">Şehir / Ülke</p>
              <p className="mt-1 text-sm font-medium">
                {[initial.city?.trim(), initial.country?.trim()]
                  .filter(Boolean)
                  .join(" / ") || "Belirtilmemiş"}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 p-3">
              <p className="text-xs text-muted-foreground">Para Birimi</p>
              <p className="mt-1 text-sm font-medium">{currency}</p>
            </div>
            <div className="rounded-lg border border-border/80 p-3">
              <p className="text-xs text-muted-foreground">Ay Başlangıç Günü</p>
              <p className="mt-1 text-sm font-medium">
                {initial.monthStartDay}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Üyelik Tarihi</p>
              <p className="mt-1 text-sm font-medium">
                {formatMembershipDate(initial.createdAtIso)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Üye Profili</CardTitle>
        <CardDescription>
          Kendi profil bilgilerinizi buradan görüntüleyip düzenleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
            <Avatar className="h-16 w-16 shrink-0 border border-border">
              <AvatarImage
                src={session?.user?.image ?? initial.image ?? undefined}
                alt=""
              />
              <AvatarFallback className="text-base">
                {profileInitials(
                  form.name || initial.name,
                  session?.user?.email ?? initial.email,
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="member-name">Ad ve Soyad</Label>
                <Input
                  id="member-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-11 rounded-xl border-border/70 bg-muted/25"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">E-posta</Label>
                <p className="text-sm text-foreground">{initial.email}</p>
              </div>
            </div>
            <Badge
              variant={initial.planTier === "premium" ? "default" : "secondary"}
              className="shrink-0 self-start"
            >
              {planLabel}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-profession">Meslek</Label>
              <Input
                id="member-profession"
                value={form.profession}
                onChange={(e) =>
                  setForm((p) => ({ ...p, profession: e.target.value }))
                }
                placeholder="Opsiyonel"
                className="h-11 rounded-xl border-border/70 bg-muted/25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-city">Şehir</Label>
              <Input
                id="member-city"
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="Opsiyonel"
                className="h-11 rounded-xl border-border/70 bg-muted/25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-country">Ülke</Label>
              <Input
                id="member-country"
                value={form.country}
                onChange={(e) =>
                  setForm((p) => ({ ...p, country: e.target.value }))
                }
                placeholder="Opsiyonel"
                className="h-11 rounded-xl border-border/70 bg-muted/25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-currency">Para birimi</Label>
              <Select
                value={form.currency}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    currency: normalizeUserCurrency(v),
                  }))
                }
              >
                <SelectTrigger
                  id="member-currency"
                  className={cn(
                    "h-11 w-full rounded-xl border-border/70 bg-muted/25 shadow-none",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="TL" className="cursor-pointer">
                    TL (₺)
                  </SelectItem>
                  <SelectItem value="USD" className="cursor-pointer">
                    USD ($)
                  </SelectItem>
                  <SelectItem value="EUR" className="cursor-pointer">
                    EUR (€)
                  </SelectItem>
                  <SelectItem value="GBP" className="cursor-pointer">
                    GBP (£)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-month-start">Ay başlangıç günü</Label>
              <Input
                id="member-month-start"
                type="number"
                min={1}
                max={28}
                value={form.monthStartDay}
                onChange={(e) =>
                  setForm((p) => ({ ...p, monthStartDay: e.target.value }))
                }
                className="h-11 rounded-xl border-border/70 bg-muted/25"
              />
              <p className="text-xs text-muted-foreground">
                Güvenli aralık: 1–28.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Üyelik tarihi</Label>
              <div className="rounded-xl border border-border/80 bg-muted/15 px-3 py-2.5 text-sm text-foreground">
                {formatMembershipDate(initial.createdAtIso)}
              </div>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          ) : null}

          <Button type="submit" disabled={saving} className="cursor-pointer">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
