import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
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
  const isLimitError = (error ?? "").includes("3/3");
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
      {error ? (
        <div
          className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${
            isLimitError
              ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-200"
              : "border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive/35"
          }`}
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="space-y-0.5">
            <p className="font-medium">
              {isLimitError ? "Günlük analiz limiti doldu" : "Analiz başarısız"}
            </p>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
