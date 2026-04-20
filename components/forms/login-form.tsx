"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
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

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordJustReset = searchParams.get("reset") === "ok";
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (res?.error) {
      setFormError("root", { message: "E-posta veya şifre hatalı" });
      return;
    }
    router.push("/gosterge-paneli");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md border-border bg-card">
      <CardHeader>
        <CardTitle>Giriş yap</CardTitle>
        <CardDescription>IQfinansAI hesabınıza erişin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {passwordJustReset && (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.
          </p>
        )}
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
            Google ile giriş
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <Link
                href="/sifremi-unuttum"
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                Şifreni mi unuttun?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Giriş..." : "Giriş yap"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="text-primary hover:underline">
            Kayıt ol
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Anasayfaya dön
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
