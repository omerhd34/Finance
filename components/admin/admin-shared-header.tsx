import Link from "next/link";
import { Button } from "@/components/ui/button";

type AdminSection = "uyeler" | "abonelikler";

export function AdminSharedHeader({ active }: { active: AdminSection }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-base font-semibold">Admin Paneli</h1>
          <p className="text-sm text-muted-foreground">
            Üyeler ve abonelik yönetimi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant={active === "uyeler" ? "default" : "outline"}
          >
            <Link href="/admin/uyeler">Üyeler</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={active === "abonelikler" ? "default" : "outline"}
          >
            <Link href="/admin/abonelikler">Abonelikler</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
