"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordJustReset = searchParams.get("reset") === "ok";
  const emailVerifiedOk = searchParams.get("email_verified") === "1";
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Giriş yap
        </h1>
        <p className="text-sm text-muted-foreground">
          IQfinansAI hesabınla devam edin.
        </p>
      </div>

      <div className="space-y-4">
        {passwordJustReset && (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.
          </p>
        )}
        {emailVerifiedOk && (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-foreground">
            E-posta adresin doğrulandı. Giriş yaparak devam edebilirsin.
          </p>
        )}
        {googleEnabled && (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full cursor-pointer"
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
              <span className="bg-background px-2 text-muted-foreground">
                veya
              </span>
            </div>
          </div>
        )}
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder=" "
                autoComplete="email"
                className={`peer h-12 ${
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                {...register("email")}
              />
              <Label
                htmlFor="email"
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-transparent px-1 transition-all peer-focus:-top-0.5 peer-focus:left-2 peer-focus:bg-background peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-0.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:text-xs ${
                  errors.email
                    ? "text-destructive peer-focus:text-destructive"
                    : "text-muted-foreground peer-focus:text-primary"
                }`}
              >
                E-posta
              </Label>
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder=" "
                className={`peer h-12 pr-10 ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                {...register("password")}
              />
              <Label
                htmlFor="password"
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-transparent px-1 transition-all peer-focus:-top-0.5 peer-focus:left-2 peer-focus:bg-background peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-0.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:text-xs ${
                  errors.password
                    ? "text-destructive peer-focus:text-destructive"
                    : "text-muted-foreground peer-focus:text-primary"
                }`}
              >
                Şifre
              </Label>
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
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href="/sifremi-unuttum"
              className="text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              Şifreni mi unuttun?
            </Link>
          </div>
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}
          <Button
            type="submit"
            className="h-11 w-full cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Giriş..." : "Giriş yap"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link
          href="/kayit"
          className="font-medium text-primary hover:underline"
        >
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
