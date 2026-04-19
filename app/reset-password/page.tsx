import Image from "next/image";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

function ResetPasswordFallback() {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
      Yükleniyor...
    </div>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
