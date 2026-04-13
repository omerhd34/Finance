import { Button } from "@/components/ui/button";

type Props = {
  hasResult: boolean;
  loading: boolean;
  error: string | null;
  onRun: () => void;
};

export function AiInsightsRunControls({
  hasResult,
  loading,
  error,
  onRun,
}: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!hasResult ? (
          <Button onClick={onRun} disabled={loading} className="cursor-pointer">
            {loading ? "Analiz ediliyor..." : "Analiz Başlat"}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onRun}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Analiz ediliyor..." : "Yeniden Analiz Et"}
          </Button>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </>
  );
}
