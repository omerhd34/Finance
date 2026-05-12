import { SIDEBAR_COLLAPSED_KEY } from "@/components/dashboard/dashboard-shell-constants";

export function sidebarCollapsedBootstrapScript(): string {
  const key = JSON.stringify(SIDEBAR_COLLAPSED_KEY);

  return `
(function () {
  try {
    var key = ${key};
    var cookieRow = document.cookie
      .split("; ")
      .find(function (row) {
        return row.startsWith(key + "=");
      });
    var collapsed = cookieRow
      ? cookieRow.slice(key.length + 1) === "1"
      : localStorage.getItem(key) === "1";

    if (collapsed) {
      document.documentElement.setAttribute("data-sidebar-collapsed", "true");
    }
  } catch (error) {
    /* ignore */
  }
})();
`.trim();
}
