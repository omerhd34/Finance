import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Providers } from "@/components/providers";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/giris");
  }
  return (
    <Providers>
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  );
}
