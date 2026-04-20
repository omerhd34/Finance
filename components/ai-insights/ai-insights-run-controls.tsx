import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  hasResult: boolean;
  loading: boolean;
  error: string | null;
  onRun: () => void;
  planLocked?: boolean;
  secondaryAction?: ReactNode;
};

export function AiInsightsRunControls({
  hasResult,
  loading,
  error,
  onRun,
  planLocked = false,
  secondaryAction,
}: Props) {
  const disabled = loading || planLocked;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!hasResult ? (
          <Button
            onClick={onRun}
            disabled={disabled}
            className="cursor-pointer"
          >
            {loading ? "Analiz ediliyor..." : "Analiz Başlat"}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onRun}
            disabled={disabled}
            className="cursor-pointer"
          >
            {loading ? "Analiz ediliyor..." : "Yeniden Analiz Et"}
          </Button>
        )}
        {secondaryAction}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </>
  );
}
