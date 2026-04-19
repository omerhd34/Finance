"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PREMIUM_PRICE_TRY } from "@/lib/premium-price";

declare global {
  interface Window {
    iFrameResize?: (opts: unknown, selector: string) => void;
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iframeToken: string | null;
  initError: string | null;
};

export function PaytrPremiumDialog({
  open,
  onOpenChange,
  iframeToken,
  initError,
}: Props) {
  const titleId = useId();
  const resizedRef = useRef(false);

  useEffect(() => {
    if (!open) resizedRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || !iframeToken) return;
    const t = window.setTimeout(() => {
      window.iFrameResize?.({}, "#paytriframe");
    }, 600);
    return () => window.clearTimeout(t);
  }, [open, iframeToken]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-3xl w-[min(100vw-1.5rem,42rem)] gap-0 overflow-y-auto p-0 sm:p-0"
        aria-labelledby={titleId}
      >
        <div className="border-b border-border px-6 py-4">
          <DialogHeader>
            <DialogTitle id={titleId}>
              Premium — ₺{PREMIUM_PRICE_TRY} / ay
            </DialogTitle>
            <DialogDescription>
              Ödemenizi PayTR güvenli ödeme ekranında tamamlayın. Onay, PayTR
              bildirimi ile hesabınıza yansır.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-4 pb-4 pt-2 sm:px-6">
          {initError ? (
            <p className="text-sm text-destructive">{initError}</p>
          ) : null}
          {iframeToken ? (
            <>
              <Script
                src="https://www.paytr.com/js/iframeResizer.min.js"
                strategy="lazyOnload"
                onLoad={() => {
                  if (resizedRef.current) return;
                  resizedRef.current = true;
                  queueMicrotask(() => {
                    window.iFrameResize?.({}, "#paytriframe");
                  });
                }}
              />
              <iframe
                title="PayTR ödeme"
                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                id="paytriframe"
                className="min-h-[520px] w-full rounded-lg border border-border bg-background"
                allow="payment *"
              />
            </>
          ) : !initError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Ödeme formu yükleniyor…
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
