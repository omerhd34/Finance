import { Loader2 } from "lucide-react";

export default function AuthGroupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <p className="text-sm font-medium text-zinc-100">Oturum kontrol ediliyor...</p>
        <p className="mt-2 text-xs text-zinc-400">
          Giris ekrani kisa sure icinde hazir olacak.
        </p>
      </div>
    </div>
  );
}
