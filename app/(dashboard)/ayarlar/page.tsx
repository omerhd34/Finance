"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { accountDeleteSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { z } from "zod";
import { Check, CreditCard, Shield, Sparkles } from "lucide-react";
import { normalizePlanTier } from "@/lib/plan-tier";
import { PREMIUM_PRICE_TRY } from "@/lib/premium-price";
import { PREMIUM_SUBSCRIPTION_DAYS } from "@/lib/premium-subscription-constants";
import { LANDING_PLANS } from "@/components/landing/landing-content";

const PREMIUM_LANDING_PERKS =
  LANDING_PLANS.find((p) => p.id === "premium")?.perks ?? [];

type DeleteFormValues = z.input<typeof accountDeleteSchema>;

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

type LatestShopierOrder = {
  id: string;
  orderCode: string;
  status: string;
  amountTry: number | null;
  currency: string | null;
  createdAt: string;
  paidAt: string | null;
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [latestOrder, setLatestOrder] = useState<LatestShopierOrder | null>(
    null,
  );
  const currentPlan = normalizePlanTier(session?.user?.planTier);

  const deleteForm = useForm<DeleteFormValues>({
    resolver: zodResolver(accountDeleteSchema),
    defaultValues: { confirm: "" },
  });

  useEffect(() => {
    setNotificationsEnabled(session?.user?.notificationsEnabled !== false);
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    async function loadLatestOrder() {
      if (!session?.user?.id) return;
      try {
        const { data } = await apiClient.get<{
          order: LatestShopierOrder | null;
        }>("/api/shopier/orders/latest");
        if (!cancelled) setLatestOrder(data.order ?? null);
      } catch {
        if (!cancelled) setLatestOrder(null);
      }
    }
    void loadLatestOrder();

    const timer = window.setInterval(() => {
      void loadLatestOrder();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (latestOrder?.status !== "PAID") return;
    if (currentPlan === "premium") return;
    void (async () => {
      await updateSession({ reloadUser: true } as Record<string, unknown>);
      router.refresh();
    })();
  }, [currentPlan, latestOrder?.status, router, updateSession]);

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
          profession: data.profession ?? null,
          city: data.city ?? null,
          country: data.country ?? null,
          monthStartDay: data.monthStartDay ?? 1,
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

  async function openPremiumCheckout() {
    if (normalizePlanTier(session?.user?.planTier) === "premium") return;
    setCheckoutError(null);
    setCheckoutBusy(true);
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>(
        "/api/shopier/init",
        {},
      );
      const checkoutUrl = data.checkoutUrl;
      const opened = window.open(checkoutUrl, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.assign(checkoutUrl);
      }
    } catch {
      setCheckoutError("Ödeme başlatılamadı. Lütfen tekrar deneyin.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function onDelete(values: DeleteFormValues) {
    await apiClient.delete("/api/user", { data: values });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="space-y-8">
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

      <Card
        id="plan"
        className="scroll-mt-20 overflow-hidden border-border/70 shadow-md shadow-black/5"
      >
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
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <fieldset
            className={cn(
              "min-w-0 border-0 p-0",
              (checkoutBusy || !session?.user) &&
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
                  {currentPlan === "premium" ? (
                    <p className="text-center text-sm leading-relaxed text-muted-foreground">
                      Premium süreniz dolduğunda hesabınız otomatik olarak
                      ücretsiz plana döner.
                      <br />
                      Yenilediğinizde tekrar premium olursunuz.
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full cursor-default rounded-full font-semibold"
                      disabled
                    >
                      Mevcut planınız
                    </Button>
                  )}
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        Her başarılı ödeme, ödeme anından itibaren{" "}
                        {PREMIUM_SUBSCRIPTION_DAYS} gün Premium erişimi verir.
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
                      checkoutBusy ||
                      !session?.user
                    }
                    onClick={() => void openPremiumCheckout()}
                    className="w-full cursor-pointer rounded-full bg-emerald-500 font-semibold text-black shadow-md shadow-emerald-900/30 transition hover:bg-emerald-400 dark:text-white"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" aria-hidden />
                      {currentPlan === "premium"
                        ? "Premium aktif"
                        : checkoutBusy
                          ? "Ödeme sayfası hazırlanıyor…"
                          : "Shopier ile öde"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </fieldset>
          {checkoutBusy ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Shopier ödeme sayfası hazırlanıyor…
            </p>
          ) : null}
          {latestOrder?.status === "PENDING" && currentPlan !== "premium" ? (
            <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-sm text-amber-700 dark:text-amber-300">
              Ödeme tamamlandıysa bu ekran otomatik güncellenecektir.
            </p>
          ) : null}
          {latestOrder?.status === "FAILED" && currentPlan !== "premium" ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              Son ödeme denemesi başarısız. Tekrar deneyebilirsiniz.
            </p>
          ) : null}
          {checkoutError ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {checkoutError}
            </p>
          ) : null}
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
