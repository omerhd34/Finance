"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations";
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
import { apiClient } from "@/lib/api-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setValue("token", tokenFromUrl);
  }, [tokenFromUrl, setValue]);

  async function onSubmit(data: ResetPasswordInput) {
    try {
      await apiClient.post("/api/auth/reset-password", {
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
    } catch (e: unknown) {
      const ax =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { error?: unknown } } }).response?.data
              ?.error
          : undefined;
      const msg =
        typeof ax === "string"
          ? ax
          : "Şifre güncellenemedi. Bağlantıyı kontrol edin veya yeni istek oluşturun.";
      setError("root", { message: msg });
      return;
    }
    router.push("/login?reset=ok");
    router.refresh();
  }

  if (!tokenFromUrl) {
    return (
      <Card className="mx-auto w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle>Geçersiz bağlantı</CardTitle>
          <CardDescription>
            Şifre sıfırlama bağlantısı eksik veya hatalı. Lütfen e-postadaki
            bağlantıyı kullanın veya yeni bir sıfırlama isteği oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full cursor-pointer">
            <Link href="/forgot-password">Yeni sıfırlama bağlantısı iste</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md border-border bg-card">
      <CardHeader>
        <CardTitle>Yeni şifre belirle</CardTitle>
        <CardDescription>
          Hesabın için yeni bir şifre gir. En az 8 karakter olsun.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("token")} />
          <div className="space-y-2">
            <Label htmlFor="password">Yeni şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground cursor-pointer"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni şifre tekrar</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
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
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor..." : "Şifreyi güncelle"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
