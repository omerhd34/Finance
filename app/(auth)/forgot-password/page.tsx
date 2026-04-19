"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";
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
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations";
import axios from "axios";
import { apiClient } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    clearErrors("root");
    try {
      const { data: res } = await apiClient.post<{
        ok?: boolean;
        registered?: boolean;
      }>("/api/auth/forgot-password", { email: data.email });
      if (res?.registered !== true) {
        setError("root", {
          message:
            "Bu e-posta adresiyle kayıtlı bir hesap yok. E-postayı kontrol edin veya kayıt olun.",
        });
        return;
      }
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const msg = (e.response.data as { error?: unknown }).error;
        if (typeof msg === "string" && msg.length > 0) {
          setError("root", { message: msg });
          return;
        }
      }
      setError("root", {
        message: "İstek gönderilemedi. Bir süre sonra tekrar deneyin.",
      });
      return;
    }
    setSubmittedEmail(data.email);
    setSubmitted(true);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/finance.jpg"
          alt="Background"
          fill
          className="object-cover brightness-[0.3]"
          priority
        />
      </div>
      <div className="z-10 w-full max-w-md">
        <Card className="mx-auto w-full max-w-md border-border bg-card">
          <CardHeader>
            <CardTitle>
              {submitted ? "İsteğin alındı" : "Şifreni sıfırla"}
            </CardTitle>
            <CardDescription>
              {submitted
                ? `${submittedEmail} adresine şifre belirleme veya sıfırlama bağlantısı gönderdik.`
                : "Kayıtlı e-postanı gir. Google ile girdiysen bile bu bağlantıyla hesabına şifre ekleyebilir veya şifreni sıfırlayabilirsin."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <MailCheck className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  E-postayı göremiyorsan spam klasörünü kontrol et. Geliştirme
                  ortamında e-posta yoksa terminalde sıfırlama URL&apos;si
                  görünebilir.
                </p>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => setSubmitted(false)}
                >
                  Tekrar dene
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@mail.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {errors.root && (
                  <p className="text-sm text-destructive">
                    {errors.root.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Gönderiliyor..."
                    : "Sıfırlama bağlantısı gönder"}
                </Button>
              </form>
            )}
            <div className="flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Giriş sayfasına dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
