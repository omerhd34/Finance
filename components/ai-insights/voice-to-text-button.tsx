"use client";

import { Mic } from "lucide-react";
import { useSpeechRecognitionTr } from "@/hooks/use-speech-recognition-tr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/common/utils";

type Props = {
  onTranscript: (text: string) => void;
  append?: boolean;
  currentText?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "icon";
  className?: string;
  "aria-label"?: string;
};

export function VoiceToTextButton({
  onTranscript,
  append,
  currentText = "",
  disabled,
  size = "icon",
  className,
  "aria-label": ariaLabel = "Sesle yaz",
}: Props) {
  const { listen, status, error, supported, clearError } =
    useSpeechRecognitionTr();

  if (!supported) return null;

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="secondary"
        size={size}
        disabled={disabled || status === "listening"}
        className={cn(
          "shrink-0",
          status === "listening" && "animate-pulse",
          className,
        )}
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={() => {
          clearError();
          listen((text) => {
            if (append && currentText.trim()) {
              onTranscript(`${currentText.trim()} ${text}`);
            } else {
              onTranscript(text);
            }
          });
        }}
      >
        <Mic className="size-4" aria-hidden />
        {size !== "icon" ? (
          <span className="ml-2">
            {status === "listening" ? "Dinleniyor…" : "Sesle"}
          </span>
        ) : null}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
