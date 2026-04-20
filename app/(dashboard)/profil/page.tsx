import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProfileSelfRedirectPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/giris");
  }

  redirect(`/profil/${session.user.id}`);
}
