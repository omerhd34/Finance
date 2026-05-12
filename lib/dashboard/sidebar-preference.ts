import { SIDEBAR_COLLAPSED_KEY } from "@/components/dashboard/dashboard-shell-constants";

export function parseSidebarCollapsedCookie(
  value: string | undefined,
): boolean {
  return value === "1";
}

function sidebarCollapsedStorageValue(collapsed: boolean): "0" | "1" {
  return collapsed ? "1" : "0";
}

export function persistSidebarCollapsed(collapsed: boolean): void {
  const value = sidebarCollapsedStorageValue(collapsed);

  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value);
  } catch {
    /* ignore */
  }

  try {
    document.cookie = `${SIDEBAR_COLLAPSED_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.toggleAttribute(
      "data-sidebar-collapsed",
      collapsed,
    );
  } catch {
    /* ignore */
  }
}

export function readSidebarCollapsedFromStorage(): boolean | null {
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === null) return null;
    return stored === "1";
  } catch {
    return null;
  }
}
