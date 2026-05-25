"use client";

import type { UseFormReturn } from "react-hook-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/common/utils";
import { Check, CreditCard, MailWarning, Shield, Sparkles } from "lucide-react";
import { PREMIUM_PRICE_TRY } from "@/lib/premium/premium-price";
import {
  PREMIUM_SUBSCRIPTION_DAYS,
  PREMIUM_TRIAL_DAYS,
} from "@/lib/premium/premium-subscription-constants";
import { LANDING_PLANS } from "@/components/landing/landing-content";
import { PremiumDaysGauge } from "./premium-days-gauge";
import type {
  DeleteFormValues,
  LatestShopierOrder,
} from "./use-own-profile-account-settings";

const PREMIUM_LANDING_PERKS =
  LANDING_PLANS.find((p) => p.id === "premium")?.perks ?? [];

type NotificationsInlineProps = {
  notificationsEnabled: boolean;
  notifSaving: boolean;
  disabled: boolean;
  onNotificationsEnabledChange: (checked: boolean) => void | Promise<void>;
};

export function OwnProfileNotificationsInline({
  notificationsEnabled,
  notifSaving,
  disabled,
  onNotificationsEnabledChange,
}: NotificationsInlineProps) {
  const hintId = "member-notifications-hint";
  return (
    <div className="flex flex-col gap-3">
      <Label
        htmlFor="email-notifications-enabled-inline"
        className="block leading-snug"
      >
        Bildirimler
      </Label>
      <p id={hintId} className="sr-only">
        Genel e-posta bildirimleri. Bütçe uyarıları uygulama içinde kalır.
      </p>
      <div
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/25 px-3",
          (disabled || notifSaving) && "opacity-60",
        )}
        title="Genel e-posta bildirimleri. Bütçe uyarıları uygulama içinde kalır."
      >
        <span
          id="email-notifications-label-inline"
          className="min-w-0 flex-1 truncate text-sm font-normal leading-normal text-foreground shadow-none"
        >
          E-posta bildirimleri
        </span>
        <div className="flex shrink-0 items-center">
          <input
            id="email-notifications-enabled-inline"
            type="checkbox"
            className="peer sr-only"
            checked={notificationsEnabled}
            disabled={disabled || notifSaving}
            onChange={(e) =>
              void onNotificationsEnabledChange(e.target.checked)
            }
            aria-labelledby="email-notifications-label-inline"
            aria-describedby={hintId}
          />
          <label
            htmlFor="email-notifications-enabled-inline"
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border/80 bg-muted transition-colors",
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
                "pointer-events-none block h-3 w-3 translate-x-0.5 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform",
                notificationsEnabled && "translate-x-5 bg-primary",
              )}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

type PlanCardProps = {
  currentPlan: "free" | "premium";
  checkoutBusy: boolean;
  checkoutError: string | null;
  latestOrder: LatestShopierOrder | null;
  awaitingCheckoutCompletion: boolean;
  premiumEndFormatted: string | null;
  premiumUntilIso: string | null;
  sessionUserPresent: boolean;
  emailVerified: boolean;
  onOpenCheckout: () => void | Promise<void>;
};

export function OwnProfilePlanCard({
  currentPlan,
  checkoutBusy,
  checkoutError,
  latestOrder,
  awaitingCheckoutCompletion,
  premiumEndFormatted,
  premiumUntilIso,
  sessionUserPresent,
  emailVerified,
  onOpenCheckout,
}: PlanCardProps) {
  const checkoutBlockedByEmail = !emailVerified && currentPlan !== "premium";
  return (
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
            (checkoutBusy || !sessionUserPresent) &&
              "pointer-events-none opacity-60",
          )}
        >
          <legend className="sr-only">Üyelik planı seçimi</legend>
          <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
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
                  "Gelir, gider ve nakit akışı kayıtları",
                  "Aylık bütçe planlama ve finansal hedefler",
                  "Borç ve alacak durum takibi",
                  "Temel kategori ve harcama özetleri",
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
                {currentPlan === "premium" ? (
                  <PremiumDaysGauge
                    premiumUntilIso={premiumUntilIso}
                    endFormatted={premiumEndFormatted}
                  />
                ) : (
                  <Button
                    type="button"
                    disabled={
                      checkoutBusy ||
                      !sessionUserPresent ||
                      checkoutBlockedByEmail
                    }
                    onClick={() => void onOpenCheckout()}
                    className="w-full cursor-pointer rounded-full bg-emerald-500 font-semibold text-black shadow-md shadow-emerald-900/30 transition hover:bg-emerald-400 dark:text-white"
                  >
                    <span className="inline-flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2">
                      <span className="inline-flex items-center gap-2">
                        <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
                        {checkoutBusy
                          ? "Ödeme sayfası hazırlanıyor…"
                          : "Shopier ile öde."}
                      </span>
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </fieldset>
        {checkoutBlockedByEmail ? (
          <p className="mt-4 inline-flex w-full items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-sm text-amber-700 dark:text-amber-300">
            <MailWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Ödeme yapabilmek için önce e-posta adresinizi doğrulayın.
              Doğrulama sonrası {PREMIUM_TRIAL_DAYS} günlük Premium denemeniz
              otomatik başlar.
            </span>
          </p>
        ) : null}
        {checkoutBusy ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Shopier ödeme sayfası hazırlanıyor…
          </p>
        ) : null}
        {latestOrder?.status === "PENDING" &&
        currentPlan !== "premium" &&
        awaitingCheckoutCompletion ? (
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
  );
}

type DangerZoneProps = {
  deleteForm: UseFormReturn<DeleteFormValues>;
  onDelete: (values: DeleteFormValues) => void | Promise<void>;
};

export function OwnProfileDangerZone({
  deleteForm,
  onDelete,
}: DangerZoneProps) {
  return (
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
          <DeleteButton
            type="submit"
            loading={deleteForm.formState.isSubmitting}
            label="Hesabı sil"
            loadingLabel="Siliniyor…"
          />
        </form>
      </CardContent>
    </Card>
  );
}

type ProfileBadgePlanLinkProps = {
  sessionUserId: string | undefined;
  planTier: "free" | "premium";
  variant?: "header" | "other-profile";
};

export function ProfilePlanBadgeLink({
  sessionUserId,
  planTier,
  variant = "header",
}: ProfileBadgePlanLinkProps) {
  const planLabel = planTier === "premium" ? "Premium" : "Free";
  const showLink = planTier !== "premium" && Boolean(sessionUserId);
  const href =
    variant === "header"
      ? "#plan"
      : sessionUserId
        ? `/profil/${sessionUserId}#plan`
        : "/profil";

  const badge = (
    <Badge
      variant={planTier === "premium" ? "default" : "secondary"}
      className={cn(
        "shrink-0",
        showLink && "cursor-pointer transition-opacity hover:opacity-90",
      )}
    >
      {planLabel}
    </Badge>
  );

  if (!showLink) return badge;

  if (variant === "header") {
    return (
      <a
        href={href}
        className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        aria-label="Plan bölümüne git"
      >
        {badge}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      aria-label="Kendi profilinizde plan ayarlarına git"
    >
      {badge}
    </Link>
  );
}
