"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/common/utils";

type Props = {
  title: string;
  className?: string;
};

export function PremiumPlanNotice({ title, className }: Props) {
  const { data: session } = useSession();
  const planHref = session?.user?.id
    ? `/profil/${session.user.id}#plan`
    : "/profil";

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-950",
        "dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-50",
        className,
      )}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-pretty opacity-90">
        Ücretsiz planda bu özellik kapalıdır. Kullanmak için{" "}
        <strong>Premium</strong> satın alın. Ödeme ve plan yükseltmesi için{" "}
        <Link
          href={planHref}
          className="font-semibold underline underline-offset-2 hover:opacity-100"
        >
          Profil
        </Link>{" "}
        sayfasına gidin.
      </p>
    </div>
  );
}
