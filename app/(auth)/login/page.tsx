import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-xl font-bold text-white hover:text-primary"
      >
        ← FinansIQ
      </Link>
      <LoginForm googleEnabled={googleEnabled} />
    </div>
  );
}
