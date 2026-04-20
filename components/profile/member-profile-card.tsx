"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import { fileToAvatarDataUrl, validateAvatarFile } from "@/lib/avatar-resize";
import { UserRound } from "lucide-react";

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
  emailVerified: boolean;
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
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [verifySending, setVerifySending] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
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
  const planSettingsLink = initial.planTier !== "premium";

  const planBadgeEl = (
    <Badge
      variant={initial.planTier === "premium" ? "default" : "secondary"}
      className={cn(
        "shrink-0",
        planSettingsLink &&
          "cursor-pointer transition-opacity hover:opacity-90",
      )}
    >
      {planLabel}
    </Badge>
  );

  const profileImageSrc = session?.user?.image ?? initial.image ?? undefined;
  const hasProfileImage = Boolean(profileImageSrc);

  async function patchProfileImage(image: string | null) {
    if (!session?.user?.id || session.user.id !== initial.id) return;
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        { image },
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
        image: data.image ?? null,
        reloadUser: true,
      } as Record<string, unknown>);
      router.refresh();
    } catch {
      setAvatarError("Fotoğraf kaydedilemedi. Tekrar deneyin.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function sendVerificationEmail() {
    if (!session?.user?.id || session.user.id !== initial.id) return;
    setVerifySending(true);
    setVerifyMessage(null);
    try {
      const { data } = await apiClient.post<{
        ok?: boolean;
        message?: string;
        sent?: boolean;
      }>("/api/auth/verify-email/send");
      if (data?.message) setVerifyMessage(data.message);
      if (data?.sent) {
        await updateSession({ reloadUser: true } as Record<string, unknown>);
        router.refresh();
      }
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      setVerifyMessage(
        ax.response?.data?.error ??
          "E-posta gönderilemedi. Bir süre sonra tekrar deneyin.",
      );
    } finally {
      setVerifySending(false);
    }
  }

  async function onAvatarFileSelected(file: File | null) {
    if (!file) return;
    const msg = validateAvatarFile(file);
    if (msg) {
      setAvatarError(msg);
      return;
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await patchProfileImage(dataUrl);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Fotoğraf işlenemedi.");
    }
  }

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
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="min-w-0 space-y-1.5">
            <CardTitle>Üye Profili</CardTitle>
            <CardDescription>
              Seçili üyeye ait temel profil bilgileri.
            </CardDescription>
          </div>
          {planSettingsLink ? (
            <Link
              href="/ayarlar#plan"
              className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              aria-label="Plan ve üyelik ayarlarına git"
            >
              {planBadgeEl}
            </Link>
          ) : (
            planBadgeEl
          )}
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
            <div className="rounded-lg border border-border/80 p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Para Birimi</p>
              <p className="mt-1 text-sm font-medium">{currency}</p>
            </div>
            <div className="rounded-lg border border-border/80 p-3">
              <p className="text-xs text-muted-foreground">Ay Başlangıç Günü</p>
              <p className="mt-1 text-sm font-medium">
                {initial.monthStartDay}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 p-3">
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
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 space-y-1.5">
          <CardTitle>Üye Profili</CardTitle>
          <CardDescription>
            Kendi profil bilgilerinizi buradan görüntüleyip düzenleyebilirsiniz.
          </CardDescription>
        </div>
        {planSettingsLink ? (
          <Link
            href="/ayarlar#plan"
            className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            aria-label="Plan ve üyelik ayarlarına git"
          >
            {planBadgeEl}
          </Link>
        ) : (
          planBadgeEl
        )}
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
          <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border/60">
                <AvatarImage src={profileImageSrc} alt="" />
                <AvatarFallback className="text-lg font-semibold">
                  {profileInitials(
                    form.name || initial.name,
                    session?.user?.email ?? initial.email,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Profil fotoğrafı
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG veya WebP, en fazla 5 MB.
                </p>
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Profil fotoğrafı yükle"
                  title="Profil fotoğrafı yükle"
                  disabled={avatarBusy || saving}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    void onAvatarFileSelected(f);
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={avatarBusy || saving || !session?.user}
                    className="cursor-pointer"
                    onClick={() => avatarFileInputRef.current?.click()}
                  >
                    <UserRound className="mr-2 h-4 w-4" aria-hidden />
                    {avatarBusy ? "Kaydediliyor..." : "Fotoğraf seç"}
                  </Button>
                  {hasProfileImage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={avatarBusy || saving || !session?.user}
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                      onClick={() => void patchProfileImage(null)}
                    >
                      Fotoğrafı kaldır
                    </Button>
                  ) : null}
                </div>
                {avatarError ? (
                  <p className="text-sm text-destructive">{avatarError}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="member-name" className="block leading-snug">
                Ad ve Soyad
              </Label>
              <Input
                id="member-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="h-11 rounded-xl border-border/70 bg-muted/25"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="member-email"
                className="block leading-snug text-muted-foreground"
              >
                E-posta
              </Label>
              <Input
                id="member-email"
                type="email"
                readOnly
                value={session?.user?.email ?? initial.email}
                aria-readonly="true"
                className="h-11 cursor-not-allowed rounded-xl border-border/70 bg-muted/40 text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="member-profession" className="block leading-snug">
                Meslek
              </Label>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="member-city" className="block leading-snug">
                Şehir
              </Label>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="member-country" className="block leading-snug">
                Ülke
              </Label>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="member-currency" className="block leading-snug">
                Para birimi
              </Label>
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
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="member-month-start"
                className="block leading-snug"
              >
                Ay başlangıç günü
              </Label>
              <Input
                id="member-month-start"
                type="number"
                min={1}
                max={28}
                placeholder="1–28 arası"
                value={form.monthStartDay}
                onChange={(e) =>
                  setForm((p) => ({ ...p, monthStartDay: e.target.value }))
                }
                className="h-11 rounded-xl border-border/70 bg-muted/25"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="member-membership-date"
                className="block leading-snug text-muted-foreground"
              >
                Üyelik tarihi
              </Label>
              <Input
                id="member-membership-date"
                readOnly
                value={formatMembershipDate(initial.createdAtIso)}
                aria-readonly="true"
                className="h-11 cursor-not-allowed rounded-xl border-border/70 bg-muted/40 text-muted-foreground"
              />
            </div>
          </div>

          {ownProfile && !initial.emailVerified ? (
            <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    E-posta doğrulaması
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hesap güvenliği ve bildirimler için adresinizi onaylayın.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer sm:w-auto"
                  disabled={verifySending}
                  onClick={() => void sendVerificationEmail()}
                >
                  {verifySending
                    ? "Gönderiliyor…"
                    : "Doğrulama e-postası gönder"}
                </Button>
              </div>
              {verifyMessage ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {verifyMessage}
                </p>
              ) : null}
            </div>
          ) : null}

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
