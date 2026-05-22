import { Suspense } from "react";
import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { LoginForm } from "@/components/forms/login-form";
import { LoadingMessage } from "@/components/ui/loading-message";

function LoginFormFallback() {
  return (
    <div className="w-full">
      <LoadingMessage variant="section" />
    </div>
  );
}

export default function LoginPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

  return (
    <AuthSplitShell
      asideTitle="Tekrar hoş geldin."
      asideDescription="Hesabına giriş yap, gelir-giderlerini, yatırımlarını ve borç-alacaklarını kaldığın yerden takip etmeye devam et."
      asideSteps={[
        { number: 1, label: "Giriş yap.", active: true },
        { number: 2, label: "Finansını yönetmeye başla." },
      ]}
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </AuthSplitShell>
  );
}
