"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  supportContactClientSchema,
  type SupportContactClientInput,
} from "@/lib/validations";
import { cn } from "@/lib/utils";

type Props = {
  inboxConfigured: boolean;
  className?: string;
};

const fieldClass =
  "border-border/80 bg-background/80 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30";

const fieldGroupClass = "flex flex-col";
const labelClass = "mb-2.5 block text-sm font-medium leading-snug";

const formShellClass = "mx-auto w-full max-w-2xl";

const SUCCESS_MESSAGE_HIDE_MS = 10_000;

export function SupportContactForm({ inboxConfigured, className }: Props) {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<SupportContactClientInput>({
    resolver: zodResolver(supportContactClientSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      _contact_hp: "",
    },
  });

  useEffect(() => {
    if (!sent) return;
    const timerId = window.setTimeout(() => {
      setSent(false);
    }, SUCCESS_MESSAGE_HIDE_MS);
    return () => window.clearTimeout(timerId);
  }, [sent]);

  async function onSubmit(data: SupportContactClientInput) {
    clearErrors("root");
    setSent(false);
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };

      if (!res.ok) {
        setError("root", {
          message:
            typeof payload.error === "string" && payload.error.length > 0
              ? payload.error
              : "Gönderim başarısız. Lütfen tekrar deneyin.",
        });
        return;
      }

      reset({
        name: "",
        email: "",
        subject: "",
        message: "",
        _contact_hp: "",
      });
      setSent(true);
    } catch {
      setError("root", {
        message: "Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.",
      });
    }
  }

  if (!inboxConfigured) {
    return (
      <div className={cn(formShellClass, className)}>
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100">
          Mesaj göndermek için sunucuda bir destek e-posta adresi tanımlı
          olmalıdır:{" "}
          <code className="rounded bg-background/60 px-1 font-mono text-xs">
            NEXT_PUBLIC_SUPPORT_EMAIL
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className={cn(formShellClass, className)}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-5 rounded-2xl border border-emerald-500/25 bg-card/70 p-6 shadow-lg backdrop-blur-sm md:p-8"
        noValidate
      >
        <input
          type="text"
          id="iqfin-support-hp"
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
          {...register("_contact_hp")}
        />

        <div className={fieldGroupClass}>
          <Label htmlFor="support-name" className={labelClass}>
            Adınız ve Soyadınız:
          </Label>
          <Input
            id="support-name"
            autoComplete="name"
            disabled={isSubmitting}
            className={fieldClass}
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className={fieldGroupClass}>
          <Label htmlFor="support-email" className={labelClass}>
            E-posta:
          </Label>
          <Input
            id="support-email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            className={fieldClass}
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className={fieldGroupClass}>
          <Label htmlFor="support-subject" className={labelClass}>
            Konu:
          </Label>
          <Input
            id="support-subject"
            autoComplete="off"
            disabled={isSubmitting}
            className={fieldClass}
            {...register("subject")}
          />
          {errors.subject ? (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.subject.message}
            </p>
          ) : null}
        </div>

        <div className={fieldGroupClass}>
          <Label htmlFor="support-message" className={labelClass}>
            Mesajınız:
          </Label>
          <Textarea
            id="support-message"
            rows={5}
            disabled={isSubmitting}
            className={cn(fieldClass, "min-h-[140px] resize-y")}
            {...register("message")}
          />
          {errors.message ? (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {errors.message.message}
            </p>
          ) : null}
        </div>

        {errors.root ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.root.message}
          </p>
        ) : null}

        {sent ? (
          <p
            className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-800 dark:text-emerald-200"
            role="status"
          >
            Mesajınız alındı. En kısa sürede size dönüş yapacağız.
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-emerald-600 font-semibold text-white shadow-md shadow-emerald-900/25 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Gönderiliyor…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" aria-hidden />
              Gönder
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
