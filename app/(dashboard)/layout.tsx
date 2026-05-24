import "react-day-picker/style.css";
import { geistMono } from "@/lib/fonts/geist-mono";
import { redirect } from "next/navigation";
import Script from "next/script";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Providers } from "@/components/providers";
import { SIDEBAR_COLLAPSED_KEY } from "@/components/dashboard/dashboard-shell-constants";
import { parseSidebarCollapsedCookie } from "@/lib/dashboard/sidebar-preference";
import { sidebarCollapsedBootstrapScript } from "@/lib/dashboard/sidebar-collapsed-bootstrap-script";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/giris");
  }

  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsedCookie(
    cookieStore.get(SIDEBAR_COLLAPSED_KEY)?.value,
  );

  return (
    <div className={geistMono.variable}>
      <Script id="sidebar-collapsed-init" strategy="beforeInteractive">
        {sidebarCollapsedBootstrapScript()}
      </Script>
      <Providers>
        <DashboardShell initialSidebarCollapsed={initialSidebarCollapsed}>
          {children}
        </DashboardShell>
      </Providers>
    </div>
  );
}
