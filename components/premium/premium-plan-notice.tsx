"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  className?: string;
};

export function PremiumPlanNotice({ title, className }: Props) {
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
          href="/ayarlar"
          className="font-semibold underline underline-offset-2 hover:opacity-100"
        >
          Ayarlar
        </Link>{" "}
        sayfasına gidin.
      </p>
    </div>
  );
}
