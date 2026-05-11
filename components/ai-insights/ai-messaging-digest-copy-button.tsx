"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/client/api-client";
import { cn } from "@/lib/common/utils";

type Props = {
  onCopyError?: (message: string | null) => void;
  compact?: boolean;
  className?: string;
};

export function AiMessagingDigestCopyButton({
  onCopyError,
  compact,
  className,
}: Props) {
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestCopied, setDigestCopied] = useState(false);

  async function copyMessagingDigest() {
    onCopyError?.(null);
    setDigestLoading(true);
    setDigestCopied(false);
    try {
      const { data } = await apiClient.get<{ text: string }>(
        "/api/ai/messaging-summary",
      );
      await navigator.clipboard.writeText(data.text);
      setDigestCopied(true);
      window.setTimeout(() => setDigestCopied(false), 2500);
    } catch {
      onCopyError?.("Özet panoya kopyalanamadı.");
    } finally {
      setDigestLoading(false);
    }
  }

  const label = digestCopied ? "Kopyalandı" : "Kopyala";

  if (compact) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("h-9 w-9 shrink-0 cursor-pointer", className)}
        disabled={digestLoading}
        onClick={() => void copyMessagingDigest()}
        title={label}
        aria-label={label}
      >
        <Copy className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-9 shrink-0 cursor-pointer gap-2", className)}
      disabled={digestLoading}
      onClick={() => void copyMessagingDigest()}
      title={label}
    >
      <Copy className="size-4 shrink-0" aria-hidden />
      {label}
    </Button>
  );
}
