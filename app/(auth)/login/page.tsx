import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-white transition hover:opacity-90"
      >
        <Image
          src="/FinansIQ-192.png"
          alt="IQfinansAI logosu"
          width={164}
          height={44}
          className="h-11 w-auto"
          priority
        />
      </Link>
      <LoginForm googleEnabled={googleEnabled} />
    </div>
  );
}
