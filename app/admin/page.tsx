import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  getAdminEmailFromSessionToken,
} from "@/lib/admin/admin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminEmail = getAdminEmailFromSessionToken(token);

  if (!adminEmail) {
    redirect("/admin/giris");
  }

  redirect("/admin/abonelikler");
}
