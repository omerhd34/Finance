import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/giris");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
