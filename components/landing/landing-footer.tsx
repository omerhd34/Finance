import Link from "next/link";

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/6 bg-[#09090b]/80 py-12 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-zinc-500">
          © {year} <span className="font-semibold text-zinc-400">FinansIQ</span>
          . Tüm hakları saklıdır.
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-6 text-sm"
          aria-label="Alt bağlantılar"
        >
          <Link
            href="/login"
            className="text-zinc-500 transition hover:text-white"
          >
            Giriş
          </Link>
          <Link
            href="/register"
            className="text-emerald-500/90 transition hover:text-emerald-400"
          >
            Kayıt ol
          </Link>
        </nav>
      </div>
    </footer>
  );
}
