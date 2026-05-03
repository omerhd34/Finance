import { BrandLockup } from "@/components/branding/brand-lockup";
import { cn } from "@/lib/common/utils";

type LogoLoadingProps = {
  fullScreen?: boolean;
  className?: string;
};

export function LogoLoading({
  fullScreen = false,
  className,
}: LogoLoadingProps) {
  const containerClass = fullScreen ? "min-h-screen" : "min-h-[60vh] w-full";

  const content = (
    <div
      className={cn(
        "flex w-full items-center justify-center px-4 py-8",
        containerClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Yükleniyor..."
    >
      <div className="relative overflow-hidden rounded-2xl p-px">
        <div
          className="pointer-events-none absolute inset-[-120%] animate-[spin_1.8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.78)_120deg,transparent_240deg)]"
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-4 rounded-[calc(var(--radius-2xl)-1px)] border border-border/70 bg-card/90 px-6 py-5 shadow-sm">
          <BrandLockup variant="landing" />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return <main className="bg-background">{content}</main>;
  }

  return content;
}
