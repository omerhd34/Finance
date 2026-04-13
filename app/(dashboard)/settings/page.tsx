/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut, useSession } from "next-auth/react";
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
import { apiClient } from "@/lib/api-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
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

type ProfileForm = z.infer<typeof profileUpdateSchema>;
type PasswordForm = z.infer<typeof passwordChangeSchema>;
type DeleteFormValues = z.input<typeof accountDeleteSchema>;

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phoneDial, setPhoneDial] = useState(DEFAULT_PHONE_DIAL);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState<string | null>(null);

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
  }, [session, profileForm]);

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
    const { data } = await apiClient.patch<{
      name: string | null;
      email: string;
      phone: string | null;
      currency: string;
    }>("/api/user/profile", values);
    dispatch(
      setUser({
        id: session!.user!.id,
        name: data.name,
        email: data.email,
        image: session?.user?.image ?? null,
        currency: data.currency,
        phone: data.phone ?? null,
      }),
    );
    await updateSession({
      currency: normalizeUserCurrency(data.currency),
      phone: data.phone ?? null,
      name: data.name ?? "",
      email: data.email,
    });
    router.refresh();
  }

  async function onPassword(values: PasswordForm) {
    await apiClient.patch("/api/user/password", values);
    passwordForm.reset();
    alert("Şifre güncellendi");
  }

  async function onDelete(values: DeleteFormValues) {
    await apiClient.delete("/api/user", { data: values });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Ayarlar</h2>
        <p className="text-sm text-muted-foreground">Profil ve güvenlik.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Ad, soyad, e-posta ve telefon bilgileriniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
            className="space-y-6"
          >
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
              <p className="text-xs text-muted-foreground">
                E-posta adresi değiştirilemez.
              </p>
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
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting
                ? "Kaydediliyor..."
                : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Şifre</CardTitle>
          <CardDescription>
            Sadece e-posta ile kayıtlı hesaplar için geçerlidir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(onPassword)}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4">
              <Label className="block">Mevcut şifre</Label>
              <Input
                type="password"
                autoComplete="current-password"
                className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label className="block">Yeni şifre</Label>
              <Input
                type="password"
                autoComplete="new-password"
                className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label className="block">Yeni şifre tekrar</Label>
              <Input
                type="password"
                autoComplete="new-password"
                className="h-12 min-h-12 rounded-xl border-border/70 bg-muted/25"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            {passwordForm.formState.errors.root && (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.root.message}
              </p>
            )}
            <Button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
            >
              Şifreyi güncelle
            </Button>
          </form>
        </CardContent>
      </Card>

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
            >
              Hesabı sil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
