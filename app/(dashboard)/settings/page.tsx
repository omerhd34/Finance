"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  profileUpdateSchema,
  passwordChangeSchema,
  accountDeleteSchema,
} from "@/lib/validations";
import { normalizeUserCurrency } from "@/lib/currency";
import {
  PHONE_COUNTRY_CODES_SORTED,
  DEFAULT_PHONE_DIAL,
  combineInternationalPhone,
  flagEmoji,
  formatLocalDigitsForDial,
  getPhoneCountryByDial,
  parseInternationalPhone,
} from "@/lib/phone-country-codes";
import { cn } from "@/lib/utils";
import axios from "axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { z } from "zod";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fileToAvatarDataUrl, validateAvatarFile } from "@/lib/avatar-resize";
import { normalizePlanTier } from "@/lib/plan-tier";
import { PREMIUM_PRICE_TRY } from "@/lib/premium-price";
import { PaytrPremiumDialog } from "@/components/paytr/paytr-premium-dialog";
import { LANDING_PLANS } from "@/components/landing/landing-content";

const PREMIUM_LANDING_PERKS =
  LANDING_PLANS.find((p) => p.id === "premium")?.perks ?? [];

type ProfileForm = z.infer<typeof profileUpdateSchema>;
type PasswordForm = z.infer<typeof passwordChangeSchema>;
type DeleteFormValues = z.input<typeof accountDeleteSchema>;

type ProfilePatchResponse = {
  name: string | null;
  email: string;
  phone: string | null;
  currency: string;
  image: string | null;
  notificationsEnabled: boolean;
  planTier: string;
};

function profileInitials(
  name: string | null | undefined,
  email: string | undefined,
): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = email?.trim() ?? "?";
  return e.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phoneDial, setPhoneDial] = useState(DEFAULT_PHONE_DIAL);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessVisible, setPasswordSuccessVisible] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [paytrOpen, setPaytrOpen] = useState(false);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [paytrInitError, setPaytrInitError] = useState<string | null>(null);
  const [paytrBusy, setPaytrBusy] = useState(false);
  const [paytrSuccessBanner, setPaytrSuccessBanner] = useState(false);
  const paytrReturnHandled = useRef<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteForm = useForm<DeleteFormValues>({
    resolver: zodResolver(accountDeleteSchema),
    defaultValues: { confirm: "" },
  });

  useEffect(() => {
    profileForm.reset({
      name: session?.user?.name ?? "",
    });
    const parsed = parseInternationalPhone(session?.user?.phone);
    setPhoneDial(parsed.dial);
    setPhoneLocal(parsed.local);
    setPhoneFieldError(null);
    setNotificationsEnabled(session?.user?.notificationsEnabled !== false);
  }, [session, profileForm]);

  useEffect(() => {
    if (!passwordSuccessVisible) return;
    const t = window.setTimeout(() => setPasswordSuccessVisible(false), 8000);
    return () => clearTimeout(t);
  }, [passwordSuccessVisible]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const p = q.get("paytr");
    if (!p || (p !== "ok" && p !== "fail")) return;
    if (paytrReturnHandled.current === p) return;
    paytrReturnHandled.current = p;

    if (p === "ok") {
      void (async () => {
        await updateSession({ reloadUser: true } as Record<string, unknown>);
        router.replace("/settings");
        router.refresh();
        setPaytrSuccessBanner(true);
      })();
      return;
    }

    setPaytrInitError("Ödeme tamamlanamadı veya iptal edildi.");
    void router.replace("/settings");
  }, [router, updateSession]);

  function handleProfileSubmit(values: ProfileForm) {
    setPhoneFieldError(null);
    const phone = combineInternationalPhone(phoneDial, phoneLocal);
    const parsed = profileUpdateSchema.safeParse({ ...values, phone });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.phone?.[0];
      if (msg) setPhoneFieldError(msg);
      return;
    }
    void onProfile(parsed.data);
  }

  async function onProfile(values: ProfileForm) {
    const { data } = await apiClient.patch<ProfilePatchResponse>(
      "/api/user/profile",
      values,
    );
    dispatch(
      setUser({
        id: session!.user!.id,
        name: data.name,
        email: data.email,
        image: data.image ?? null,
        currency: data.currency,
        phone: data.phone ?? null,
        notificationsEnabled: data.notificationsEnabled !== false,
        planTier: normalizePlanTier(data.planTier),
      }),
    );
    await updateSession({
      currency: normalizeUserCurrency(data.currency),
      phone: data.phone ?? null,
      name: data.name ?? "",
      email: data.email,
      image: data.image ?? null,
      notificationsEnabled: data.notificationsEnabled !== false,
      reloadUser: true,
    } as Record<string, unknown>);
    router.refresh();
  }

  async function patchProfileImage(image: string | null) {
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        { image },
      );
      dispatch(
        setUser({
          id: session!.user!.id,
          name: data.name,
          email: data.email,
          image: data.image ?? null,
          currency: data.currency,
          phone: data.phone ?? null,
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

  async function onNotificationsEnabledChange(checked: boolean) {
    setNotifSaving(true);
    try {
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        { notificationsEnabled: checked },
      );
      setNotificationsEnabled(data.notificationsEnabled !== false);
      dispatch(
        setUser({
          id: session!.user!.id,
          name: data.name,
          email: data.email,
          image: data.image ?? null,
          currency: data.currency,
          phone: data.phone ?? null,
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

  async function onSelectFreePlan() {
    const current = normalizePlanTier(session?.user?.planTier);
    if (current === "free" || !session?.user?.id) return;
    setPlanSaving(true);
    try {
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        { planTier: "free" },
      );
      dispatch(
        setUser({
          id: session.user.id,
          name: data.name,
          email: data.email,
          image: data.image ?? null,
          currency: data.currency,
          phone: data.phone ?? null,
          notificationsEnabled: data.notificationsEnabled !== false,
          planTier: normalizePlanTier(data.planTier),
        }),
      );
      await updateSession({
        reloadUser: true,
      } as Record<string, unknown>);
      router.refresh();
    } finally {
      setPlanSaving(false);
    }
  }

  async function openPremiumCheckout() {
    if (normalizePlanTier(session?.user?.planTier) === "premium") return;
    setPaytrInitError(null);
    setPaytrToken(null);
    setPaytrBusy(true);
    try {
      const { data } = await apiClient.post<{ token: string }>(
        "/api/paytr/init",
        {},
      );
      setPaytrToken(data.token);
      setPaytrOpen(true);
    } catch (e: unknown) {
      let msg = "Ödeme başlatılamadı.";
      if (axios.isAxiosError(e)) {
        const err = e.response?.data as { error?: unknown };
        if (typeof err?.error === "string") msg = err.error;
      }
      setPaytrInitError(msg);
    } finally {
      setPaytrBusy(false);
    }
  }

  const currentPlan = normalizePlanTier(session?.user?.planTier);

  async function onPassword(values: PasswordForm) {
    setPasswordSuccessVisible(false);
    passwordForm.clearErrors("root");
    try {
      await apiClient.patch("/api/user/password", values);
      passwordForm.reset();
      setPasswordSuccessVisible(true);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: unknown };
        if (typeof data.error === "string") {
          passwordForm.setError("root", { message: data.error });
          return;
        }
        if (
          data.error &&
          typeof data.error === "object" &&
          !Array.isArray(data.error)
        ) {
          const fe = data.error as Record<string, string[] | undefined>;
          const keys = [
            "currentPassword",
            "newPassword",
            "confirmPassword",
          ] as const;
          let anyField = false;
          for (const key of keys) {
            const first = fe[key]?.[0];
            if (typeof first === "string" && first.length > 0) {
              passwordForm.setError(key, { message: first });
              anyField = true;
            }
          }
          if (!anyField) {
            passwordForm.setError("root", {
              message: "Bilgileri kontrol edip tekrar deneyin.",
            });
          }
          return;
        }
      }
      passwordForm.setError("root", {
        message: "Şifre güncellenemedi. Tekrar deneyin.",
      });
    }
  }

  async function onDelete(values: DeleteFormValues) {
    await apiClient.delete("/api/user", { data: values });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {paytrSuccessBanner ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-50">
          Ödeme alındı. Premium plan birkaç saniye içinde etkinleşir; gerekirse
          sayfayı yenileyin.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Ad, soyad, e-posta ve telefon bilgileriniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/15 p-4 sm:flex-row sm:items-center sm:gap-6">
            <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border/60">
              <AvatarImage
                src={session?.user?.image ?? undefined}
                alt=""
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-semibold">
                {profileInitials(
                  session?.user?.name,
                  session?.user?.email ?? undefined,
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Profil fotoğrafı
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Google ile giriş yaptıysanız fotoğrafınız hesaptan gelir;
                  isterseniz buradan değiştirebilir veya kaldırabilirsiniz.
                  Diğer hesaplar için kendi fotoğrafınızı yükleyin (JPEG, PNG
                  veya WebP, en fazla 5 MB).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Profil fotoğrafı yükle"
                  title="Profil fotoğrafı yükle"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    void onAvatarFileSelected(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={avatarBusy || !session?.user}
                  className="cursor-pointer"
                  onClick={() => avatarFileInputRef.current?.click()}
                >
                  <UserRound className="mr-2 h-4 w-4" aria-hidden />
                  {avatarBusy ? "Kaydediliyor..." : "Fotoğraf seç"}
                </Button>
                {session?.user?.image ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={avatarBusy || !session?.user}
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
          <form
            onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="flex flex-col gap-4">
                <Label htmlFor="name" className="block">
                  Ad ve Soyad
                </Label>
                <Input
                  id="name"
                  className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25"
                  {...profileForm.register("name")}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Label htmlFor="email" className="block">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email ?? ""}
                  readOnly
                  className="h-12 min-h-12 cursor-not-allowed rounded-xl border-border/70 bg-muted/40"
                  aria-readonly="true"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="phone-local" className="block">
                Telefon numarası
              </Label>
              <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-stretch">
                <Select
                  value={phoneDial}
                  onValueChange={(v) => {
                    setPhoneDial(v);
                    setPhoneLocal((prev) => {
                      const digits = prev.replace(/\D/g, "");
                      if (!digits) return "";
                      return formatLocalDigitsForDial(v, digits);
                    });
                    setPhoneFieldError(null);
                  }}
                >
                  <SelectTrigger
                    id="phone-country"
                    className={cn(
                      "h-12 min-h-12 w-full min-w-0 rounded-xl border-border/70 bg-muted/25 px-3 py-0 shadow-none transition-colors",
                      "hover:bg-muted/45 focus:ring-primary/30 data-[state=open]:bg-muted/40",
                    )}
                  >
                    <SelectValue placeholder="Ülke kodu seçin">
                      {(() => {
                        const c = getPhoneCountryByDial(phoneDial);
                        if (!c) return null;
                        return (
                          <span className="flex min-w-0 items-center gap-3">
                            <span
                              className="shrink-0 text-lg leading-none"
                              aria-hidden
                            >
                              {flagEmoji(c.iso2)}
                            </span>
                            <span className="ml-0.5 flex min-w-0 flex-col items-start gap-0 border-l border-border/40 pl-3 text-left leading-tight">
                              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                +{c.dial}
                              </span>
                              <span className="max-w-38 truncate text-sm font-medium">
                                {c.name}
                              </span>
                            </span>
                          </span>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={6}
                    className={cn(
                      "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)",
                      "max-h-[calc(2rem*5+2.5rem)] overflow-hidden rounded-xl border-border/80 bg-popover p-1.5 shadow-xl",
                    )}
                  >
                    {PHONE_COUNTRY_CODES_SORTED.map((c) => (
                      <SelectItem
                        key={c.dial}
                        value={c.dial}
                        className={cn(
                          "cursor-pointer rounded-lg py-2.5 pl-2 pr-8",
                          "focus:bg-primary/10 focus:text-foreground",
                          "data-highlighted:bg-primary/10 data-highlighted:text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-lg shadow-inner"
                            aria-hidden
                          >
                            {flagEmoji(c.iso2)}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">
                              +{c.dial}
                            </span>
                            <span className="truncate text-sm leading-snug">
                              {c.name}
                            </span>
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone-local"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  className={cn(
                    "h-12 min-h-12 min-w-0 flex-1 rounded-xl border-border/70 bg-muted/25 shadow-none",
                    "transition-colors placeholder:text-muted-foreground/70",
                    "focus-visible:border-primary/50 focus-visible:ring-primary/20",
                  )}
                  placeholder="Numara (başında 0 olmadan)"
                  value={phoneLocal}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setPhoneLocal(formatLocalDigitsForDial(phoneDial, raw));
                    setPhoneFieldError(null);
                  }}
                />
              </div>
              {phoneFieldError && (
                <p className="text-sm text-destructive">{phoneFieldError}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="cursor-pointer"
            >
              {profileForm.formState.isSubmitting
                ? "Kaydediliyor..."
                : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildirimler</CardTitle>
          <CardDescription>
            Bütçe uyarıları uygulama içinde her zaman gösterilir. Bu anahtar
            genel e-posta gönderimini kontrol eder; tek bir kategori için
            e-postayı Bütçeler sayfasındaki bütçe düzeninden kapatabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p
                id="email-notifications-label"
                className="text-base font-medium leading-none"
              >
                E-posta bildirimleri
              </p>
            </div>
            <div className="flex shrink-0 items-center">
              <input
                id="email-notifications-enabled"
                type="checkbox"
                className="peer sr-only"
                checked={notificationsEnabled}
                disabled={notifSaving || !session?.user}
                onChange={(e) =>
                  void onNotificationsEnabledChange(e.target.checked)
                }
                aria-labelledby="email-notifications-label"
              />
              <label
                htmlFor="email-notifications-enabled"
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-border/80 bg-muted transition-colors",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                  notificationsEnabled && "border-primary/40 bg-primary/25",
                )}
              >
                <span className="sr-only">
                  {notificationsEnabled
                    ? "E-posta bildirimleri açık, kapatmak için tıklayın"
                    : "E-posta bildirimleri kapalı, açmak için tıklayın"}
                </span>
                <span
                  className={cn(
                    "pointer-events-none block h-6 w-6 translate-x-1 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform",
                    notificationsEnabled && "translate-x-7 bg-primary",
                  )}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 shadow-md shadow-black/5">
        <CardHeader className="relative space-y-3 border-b border-border/50 bg-linear-to-br from-muted/40 via-card to-card pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-2xl tracking-tight">Plan</CardTitle>
            <Badge
              variant="outline"
              className="rounded-full border-emerald-500/35 bg-emerald-500/10 px-3 py-0.5 font-medium text-emerald-700 dark:text-emerald-300"
            >
              {currentPlan === "premium" ? "Premium" : "Ücretsiz"}
            </Badge>
          </div>
          <CardDescription className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            <Link
              href="/ai-insights"
              className="font-medium text-emerald-600 underline decoration-emerald-500/40 underline-offset-4 transition hover:text-emerald-500 dark:text-emerald-400"
            >
              AI Analiz
            </Link>{" "}
            yalnızca Premium ile açılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <fieldset
            className={cn(
              "min-w-0 border-0 p-0",
              (planSaving || paytrBusy || !session?.user) &&
                "pointer-events-none opacity-60",
            )}
          >
            <legend className="sr-only">Üyelik planı seçimi</legend>
            <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
              {/* Ücretsiz */}
              <div
                className={cn(
                  "flex min-h-[300px] flex-col rounded-2xl border p-5 transition-all duration-200 sm:p-6",
                  currentPlan === "free"
                    ? "border-emerald-500/45 bg-linear-to-b from-emerald-500/12 to-card shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/25"
                    : "border-border/80 bg-card/80 hover:border-emerald-500/20 hover:shadow-md",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/60">
                      <Shield
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        Ücretsiz
                      </h3>
                    </div>
                  </div>
                  {currentPlan === "free" ? (
                    <Badge
                      variant="income"
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wide"
                    >
                      Aktif
                    </Badge>
                  ) : null}
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-muted-foreground">
                  {[
                    "İşlemler, hedefler, bütçeler ve raporlar",
                    "Borç / alacak takibi",
                    "AI Analiz bu planda kapalıdır",
                  ].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/90"
                        aria-hidden
                      />
                      <span className="leading-snug">{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-border/50 pt-5">
                  <Button
                    type="button"
                    variant={currentPlan === "free" ? "secondary" : "outline"}
                    className="w-full cursor-pointer rounded-full font-semibold"
                    disabled={
                      currentPlan === "free" || planSaving || !session?.user
                    }
                    onClick={() => void onSelectFreePlan()}
                  >
                    {currentPlan === "free"
                      ? "Mevcut planınız"
                      : "Ücretsize geç"}
                  </Button>
                </div>
              </div>

              {/* Premium */}
              <div
                className={cn(
                  "relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-200 sm:p-6",
                  currentPlan === "premium"
                    ? "border-emerald-500/45 bg-linear-to-b from-emerald-500/12 to-card shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/25"
                    : "border-border/80 bg-card/80 hover:border-emerald-500/25 hover:shadow-md",
                )}
              >
                {currentPlan !== "premium" ? (
                  <span className="absolute right-4 top-4 inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Önerilen
                  </span>
                ) : null}
                <div
                  className={cn(
                    "flex items-start justify-between gap-3",
                    currentPlan !== "premium" && "pr-20 sm:pr-24",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
                      <Sparkles
                        className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        Premium
                      </h3>
                      <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                        ₺{PREMIUM_PRICE_TRY}
                        <span className="text-base font-medium text-muted-foreground">
                          {" "}
                          / ay
                        </span>
                      </p>
                    </div>
                  </div>
                  {currentPlan === "premium" ? (
                    <Badge
                      variant="income"
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wide"
                    >
                      Aktif
                    </Badge>
                  ) : null}
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-muted-foreground">
                  {PREMIUM_LANDING_PERKS.map((line, idx) => (
                    <li key={`${idx}-${line}`} className="flex gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/90"
                        aria-hidden
                      />
                      <span className="leading-snug">{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-border/50 pt-5">
                  <Button
                    type="button"
                    disabled={
                      currentPlan === "premium" ||
                      planSaving ||
                      paytrBusy ||
                      !session?.user
                    }
                    onClick={() => void openPremiumCheckout()}
                    className="w-full cursor-pointer rounded-full bg-emerald-500 font-semibold text-black shadow-md shadow-emerald-900/30 transition hover:bg-emerald-400 dark:text-white"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" aria-hidden />
                      {currentPlan === "premium"
                        ? "Premium aktif"
                        : "PayTR ile öde"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </fieldset>
          {planSaving || paytrBusy ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {paytrBusy ? "Ödeme formu hazırlanıyor…" : "Plan güncelleniyor…"}
            </p>
          ) : null}
          {paytrInitError && !paytrOpen ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {paytrInitError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <PaytrPremiumDialog
        open={paytrOpen}
        onOpenChange={(open) => {
          setPaytrOpen(open);
          if (!open) {
            setPaytrToken(null);
            setPaytrInitError(null);
          }
        }}
        iframeToken={paytrToken}
        initError={paytrOpen ? paytrInitError : null}
      />

      {session?.user?.hasPassword ? (
        <Card>
          <CardHeader>
            <CardTitle>Şifre</CardTitle>
            <CardDescription>
              E-posta ve şifre ile kayıtlı hesabınızın şifresini güncelleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {passwordSuccessVisible ? (
              <div
                aria-live="polite"
                className="flex gap-3 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3.5 text-left shadow-sm"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    Şifreniz güncellendi
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Bir sonraki girişinizde yeni şifrenizi kullanabilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordSuccessVisible(false)}
                  className="-m-1 shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-primary/15 hover:text-foreground cursor-pointer"
                  aria-label="Bildirimi kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <form
              onSubmit={passwordForm.handleSubmit(onPassword)}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4">
                <Label className="block">Mevcut şifre</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25 pr-10"
                    {...passwordForm.register("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground cursor-pointer"
                    aria-label={
                      showCurrentPassword
                        ? "Mevcut şifreyi gizle"
                        : "Mevcut şifreyi göster"
                    }
                    title={
                      showCurrentPassword
                        ? "Mevcut şifreyi gizle"
                        : "Mevcut şifreyi göster"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="flex flex-col gap-4">
                  <Label className="block">Yeni şifre</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25 pr-10"
                      {...passwordForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground cursor-pointer"
                      aria-label={
                        showNewPassword
                          ? "Yeni şifreyi gizle"
                          : "Yeni şifreyi göster"
                      }
                      title={
                        showNewPassword
                          ? "Yeni şifreyi gizle"
                          : "Yeni şifreyi göster"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <Label className="block">Yeni şifre tekrar</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25 pr-10"
                      {...passwordForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground cursor-pointer"
                      aria-label={
                        showConfirmPassword
                          ? "Şifre tekrarını gizle"
                          : "Şifre tekrarını göster"
                      }
                      title={
                        showConfirmPassword
                          ? "Şifre tekrarını gizle"
                          : "Şifre tekrarını göster"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
              {passwordForm.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.root.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="cursor-pointer"
              >
                Şifreyi güncelle
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Tehlikeli bölge</CardTitle>
          <CardDescription>
            Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={deleteForm.handleSubmit(onDelete)}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Onaylamak için aşağıya tam olarak{" "}
              <strong className="text-foreground">SİL</strong> yazın.
            </p>
            <Input
              {...deleteForm.register("confirm")}
              placeholder="SİL"
              autoComplete="off"
            />
            {deleteForm.formState.errors.confirm && (
              <p className="text-sm text-destructive">
                {deleteForm.formState.errors.confirm.message}
              </p>
            )}
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteForm.formState.isSubmitting}
              className="cursor-pointer"
            >
              Hesabı sil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
