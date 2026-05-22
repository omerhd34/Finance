import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

  return (
    <AuthSplitShell
      asideBadge="10 gün premium hediye"
      asideTitle="Tüm finansın tek platformda."
      asideDescription={
        <>
          Gelir, gider, yatırım, borç–alacak ve tekrarlayan hareketlerini{" "}
          <strong className="font-semibold text-white">IQfinansAI</strong> ile
          tek ekrandan yönet. İlk 10 gün premium tamamen{" "}
          <strong className="font-semibold text-white">
            ücretsiz — kredi kartı gerekmez
          </strong>
          .
        </>
      }
      asideSteps={[
        { number: 1, label: "Hesap oluştur.", active: true },
        { number: 2, label: "Profilini tamamla ve finansını yönetmeye başla." },
      ]}
    >
      <RegisterForm googleEnabled={googleEnabled} />
    </AuthSplitShell>
  );
}
