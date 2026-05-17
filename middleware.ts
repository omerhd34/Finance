import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TRACKED_PREFIXES = [
  "/api/transactions",
  "/api/debts",
  "/api/investments",
  "/api/recurring",
  "/api/category-budgets",
  "/api/notifications",
  "/api/ai/",
  "/api/user/",
  "/api/shopier/",
  "/api/support",
  "/api/exchange-rates",
  "/api/fx-prices",
  "/api/borsa-istanbul",
  "/api/stock-prices",
  "/api/crypto-prices",
  "/api/gold-prices",
  "/api/silver-prices",
  "/api/platinum-prices",
  "/api/commodity-prices",
];

const DEBOUNCE_MS = 60_000;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTracked = TRACKED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isTracked) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    return NextResponse.next();
  }

  const internalUrl = new URL("/api/internal/touch-active", request.url);
  void fetch(internalUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
      "x-internal-secret":
        process.env.INTERNAL_MIDDLEWARE_SECRET ?? "dev-internal-secret",
    },
    body: JSON.stringify({ debounceMs: DEBOUNCE_MS }),
  }).catch(() => {});

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
