"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/giris");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
      disabled={isLoading}
      onClick={() => void handleLogout()}
    >
      Çıkış yap
    </Button>
  );
}
