"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
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
import axios from "axios";
import { apiClient } from "@/lib/api-client";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      await apiClient.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: unknown };
        if (typeof data.error === "string") {
          setError("root", { message: data.error });
          return;
        }
        if (
          data.error &&
          typeof data.error === "object" &&
          !Array.isArray(data.error)
        ) {
          const fe = data.error as Record<string, string[] | undefined>;
          const keys = [
            "name",
            "email",
            "password",
            "confirmPassword",
          ] as const;
          let anyField = false;
          for (const key of keys) {
            const first = fe[key]?.[0];
            if (typeof first === "string" && first.length > 0) {
              setError(key, { message: first });
              anyField = true;
            }
          }
          if (!anyField) {
            setError("root", {
              message: "Kayıt oluşturulamadı. Bilgileri kontrol edin.",
            });
          }
          return;
        }
      }
      setError("root", {
        message: "Kayıt oluşturulamadı. Tekrar deneyin.",
      });
      return;
    }
    const sign = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (sign?.error) {
      setError("root", {
        message: "Kayıt tamam; giriş için lütfen manuel olarak deneyin.",
      });
      router.push("/giris");
      return;
    }
    router.push("/gosterge-paneli");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md border-border bg-card">
      <CardHeader>
        <CardTitle>Hesap oluştur</CardTitle>
        <CardDescription>IQfinansAI ile ücretsiz başlayın.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleEnabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() =>
              signIn("google", { callbackUrl: "/gosterge-paneli" })
            }
          >
            <FcGoogle className="h-5 w-5" />
            Google ile kayıt
          </Button>
        )}
        {googleEnabled && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">veya</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad ve Soyad</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
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
            <Label htmlFor="confirmPassword">Şifre tekrar</Label>
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
            {isSubmitting ? "Kaydediliyor..." : "Kayıt ol"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
