import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminEmailFromSessionToken,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin";
import { AdminLoginForm } from "@/components/forms/admin-login-form";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminEmail = getAdminEmailFromSessionToken(token);

  if (adminEmail) {
    redirect("/admin/uyeler");
  }

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
        <AdminLoginForm />
      </div>
    </div>
  );
}
