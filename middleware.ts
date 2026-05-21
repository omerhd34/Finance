import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TRACKED_PREFIXES = [
  "/api/transactions",
  "/api/debts",
  "/api/investments",
  "/api/recurring",
  "/api/category-budgets",
  "/api/ai/",
  "/api/support",
];

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const DEBOUNCE_MS = 5 * 60_000;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!MUTATION_METHODS.has(request.method)) {
    return NextResponse.next();
  }

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
