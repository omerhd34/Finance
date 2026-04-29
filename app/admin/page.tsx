import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  getAdminEmailFromSessionToken,
} from "@/lib/admin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminEmail = getAdminEmailFromSessionToken(token);

  if (!adminEmail) {
    redirect("/admin/giris");
  }

  redirect("/admin/abonelikler");
}
