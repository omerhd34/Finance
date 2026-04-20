import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { verifyEmailWithRawToken } from "@/lib/verify-email-token-server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

function tokenFromSearchParams(sp: { token?: string | string[] }) {
  const raw = sp.token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  return typeof token === "string" ? token.trim() : "";
}

function VerifyShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/finance.jpg"
          alt=""
          fill
          className="object-cover brightness-[0.3]"
          priority
        />
      </div>
      <Card className="z-10 w-full max-w-md border-border bg-card/95 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children ? (
          <CardContent className="space-y-3">{children}</CardContent>
        ) : null}
      </Card>
    </div>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const sp = await searchParams;
  const token = tokenFromSearchParams(sp);

  if (!token) {
    return (
      <VerifyShell
        title="E-posta doğrulama"
        description="Geçersiz veya eksik doğrulama bağlantısı."
      >
        <div className="space-y-2">
          <Button asChild className="w-full cursor-pointer">
            <Link href="/profil">Profile dön</Link>
          </Button>
          <Button asChild variant="outline" className="w-full cursor-pointer">
            <Link href="/giris">Giriş yap</Link>
          </Button>
        </div>
      </VerifyShell>
    );
  }

  const result = await verifyEmailWithRawToken(token);

  if (!result.ok) {
    return (
      <VerifyShell title="E-posta doğrulama" description={result.error}>
        <div className="space-y-2">
          <Button asChild className="w-full cursor-pointer">
            <Link href="/profil">Profile dön</Link>
          </Button>
          <Button asChild variant="outline" className="w-full cursor-pointer">
            <Link href="/giris">Giriş yap</Link>
          </Button>
        </div>
      </VerifyShell>
    );
  }

  const session = await auth();
  if (session?.user) {
    redirect("/profil");
  }
  redirect("/giris?email_verified=1");
}
