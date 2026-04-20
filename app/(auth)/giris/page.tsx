import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { LoadingMessage } from "@/components/ui/loading-message";

function LoginFormFallback() {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8">
      <LoadingMessage variant="section" />
    </div>
  );
}

export default function LoginPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

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
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </div>
    </div>
  );
}
