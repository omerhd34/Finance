"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  supportContactClientSchema,
  type SupportContactClientInput,
} from "@/lib/schemas/validations";
import { cn } from "@/lib/common/utils";
import { fireGoogleAdsPurchaseConversion } from "@/lib/analytics/google-ads-conversion";
import { trackMetaContact } from "@/lib/analytics/meta-pixel-events";

type Props = {
  inboxConfigured: boolean;
  className?: string;
};

const fieldClass =
  "border-border/80 bg-background/80 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30";

const fieldGroupClass = "flex flex-col";
const labelClass = "pb-2 block text-sm font-medium leading-snug";
const formShellClass = "mx-auto w-full max-w-2xl";

type SupportTextFieldName = Extract<
  keyof SupportContactClientInput,
  "name" | "email" | "subject"
>;

const SUPPORT_TEXT_FIELDS = [
  {
    name: "name",
    id: "support-name",
    label: "Ad ve Soyad:",
    type: "text",
    autoComplete: "name",
  },
  {
    name: "email",
    id: "support-email",
    label: "E-posta:",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "subject",
    id: "support-subject",
    label: "Konu:",
    type: "text",
    autoComplete: "off",
  },
] as const satisfies readonly {
  name: SupportTextFieldName;
  id: string;
  label: string;
  type: "email" | "text";
  autoComplete: string;
}[];

export function SupportContactForm({ inboxConfigured, className }: Props) {
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

  async function onSubmit(data: SupportContactClientInput) {
    clearErrors("root");
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
        const message =
          typeof payload.error === "string" && payload.error.length > 0
            ? payload.error
            : "Gönderim başarısız. Lütfen tekrar deneyin.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      reset({
        name: "",
        email: "",
        subject: "",
        message: "",
        _contact_hp: "",
      });
      fireGoogleAdsPurchaseConversion();
      trackMetaContact();
      toast.success("Mesajınız alındı", {
        description: "En kısa sürede size dönüş yapacağız.",
      });
    } catch {
      const message =
        "Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.";
      setError("root", { message });
      toast.error(message);
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
        className="flex flex-col gap-4 rounded-2xl border border-emerald-500/25 bg-card/70 p-5 shadow-lg backdrop-blur-sm md:p-6"
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

        {SUPPORT_TEXT_FIELDS.map((field) => {
          const errorMessage = errors[field.name]?.message;

          return (
            <div key={field.name} className={fieldGroupClass}>
              <Label htmlFor={field.id} className={labelClass}>
                {field.label}
              </Label>
              <Input
                id={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                disabled={isSubmitting}
                className={fieldClass}
                {...register(field.name)}
              />
              {errorMessage ? (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className={cn(fieldGroupClass, "min-h-0 flex-1")}>
          <Label htmlFor="support-message" className={labelClass}>
            Mesaj:
          </Label>
          <Textarea
            id="support-message"
            rows={3}
            disabled={isSubmitting}
            className={cn(fieldClass, "min-h-[100px] flex-1 resize-y")}
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
