"use client";

import {
  FastForward,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Rewind,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LANDING_MODULES,
  LANDING_MODULES_VIDEO_SRC,
} from "@/components/landing/landing-modules-content";
import { cn } from "@/lib/common/utils";

function ModulePremiumBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-400/35 dark:bg-amber-400/12 dark:text-amber-200">
      Premium
    </span>
  );
}

const VIDEO_SEEK_STEP_SECONDS = 5;

const videoControlButtonClass =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 sm:h-10 sm:w-10";

function formatVideoTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }
  const wholeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function ModulesVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlaying = () => setPlaying(!video.paused);
    const syncDuration = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };
    const syncTime = () => setCurrentTime(video.currentTime);
    const onEnded = () => setPlaying(false);

    video.addEventListener("play", syncPlaying);
    video.addEventListener("pause", syncPlaying);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("durationchange", syncDuration);
    video.addEventListener("timeupdate", syncTime);

    syncDuration();
    syncTime();

    return () => {
      video.removeEventListener("play", syncPlaying);
      video.removeEventListener("pause", syncPlaying);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("durationchange", syncDuration);
      video.removeEventListener("timeupdate", syncTime);
    };
  }, []);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setShouldLoadVideo(true);
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {}
  }, []);

  const seekRelative = useCallback((deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    const nextTime = Math.min(
      Math.max(0, video.currentTime + deltaSeconds),
      video.duration,
    );
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const handleSeek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    const nextTime = Math.min(Math.max(0, value), video.duration);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-violet-100/90 via-sky-50/80 to-emerald-50/70 p-3 shadow-inner ring-1 ring-border/40 sm:min-h-[400px] sm:p-4 md:min-h-[480px] lg:min-h-[560px] dark:from-violet-950/40 dark:via-sky-950/30 dark:to-emerald-950/25">
      <div className="flex w-full items-center justify-center">
        <div
          ref={containerRef}
          className={cn(
            "group/video relative w-full origin-center overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-slate-900/10 ring-1 ring-black/5 dark:shadow-black/40 lg:scale-[1.08]",
            isFullscreen &&
              "flex size-full max-h-none items-center justify-center rounded-none border-0 bg-black lg:scale-100",
          )}
        >
          <video
            ref={videoRef}
            className={cn(
              "mx-auto h-auto w-full object-contain object-center",
              isFullscreen && "max-h-full max-w-full",
            )}
            muted={isMuted}
            playsInline
            preload="none"
            poster="/video-poster.webp"
            aria-label="IQfinansAI ürün tanıtım videosu"
          >
            {shouldLoadVideo ? (
              <source src={LANDING_MODULES_VIDEO_SRC} type="video/mp4" />
            ) : null}
            <track
              kind="captions"
              src="/iqfinansai-captions.vtt"
              srcLang="tr"
              label="Türkçe"
              default
            />
          </video>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
            <label className="sr-only" htmlFor="landing-module-video-progress">
              Video konumu
            </label>
            <input
              id="landing-module-video-progress"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              disabled={duration <= 0}
              onInput={(event) => handleSeek(Number(event.currentTarget.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
              style={{
                background: `linear-gradient(to right, rgb(52 211 153) ${progressPercent}%, rgba(255,255,255,0.25) ${progressPercent}%)`,
              }}
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              aria-valuetext={`${formatVideoTime(currentTime)} / ${formatVideoTime(duration)}`}
            />

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => seekRelative(-VIDEO_SEEK_STEP_SECONDS)}
                  className={videoControlButtonClass}
                  aria-label={`${VIDEO_SEEK_STEP_SECONDS} saniye geri`}
                  disabled={duration <= 0}
                >
                  <Rewind className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className={videoControlButtonClass}
                  aria-label={playing ? "Videoyu duraklat" : "Videoyu oynat"}
                >
                  {playing ? (
                    <Pause className="h-4 w-4" aria-hidden />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => seekRelative(VIDEO_SEEK_STEP_SECONDS)}
                  className={videoControlButtonClass}
                  aria-label={`${VIDEO_SEEK_STEP_SECONDS} saniye ileri`}
                  disabled={duration <= 0}
                >
                  <FastForward className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className={videoControlButtonClass}
                  aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
                  aria-pressed={!isMuted}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" aria-hidden />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="shrink-0 text-xs font-medium tabular-nums text-white/90 sm:text-sm">
                  {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                </span>
                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  className={videoControlButtonClass}
                  aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" aria-hidden />
                  ) : (
                    <Maximize2 className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              "absolute inset-0 z-10 flex cursor-pointer items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-inset",
              playing ? "bg-transparent" : "bg-black/25 hover:bg-black/35",
            )}
            aria-label={playing ? "Videoyu duraklat" : "Videoyu oynat"}
          >
            {!playing ? (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg">
                <Play className="ml-1 h-7 w-7" aria-hidden />
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModulesList({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="relative list-none">
      <div
        className="absolute bottom-3 left-4 top-3 w-px -translate-x-1/2 bg-emerald-500/25"
        aria-hidden
      />

      {LANDING_MODULES.map((module, index) => {
        const active = index === activeIndex;
        return (
          <li key={module.id} className="relative">
            <button
              type="button"
              aria-expanded={active}
              onClick={() => onSelect(index)}
              className={cn(
                "group relative w-full border-b border-border/60 py-4 pl-10 text-left transition-colors last:border-b-0 sm:py-5 sm:pl-12 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                !active && "hover:bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "absolute left-4 top-5 flex -translate-x-1/2 items-center justify-center rounded-full transition-all sm:top-6",
                  active
                    ? "h-8 w-8 bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-900/20 dark:bg-emerald-600"
                    : "h-2.5 w-2.5 bg-emerald-500/70 group-hover:bg-emerald-600",
                )}
                aria-hidden
              >
                {active ? module.id : null}
              </span>

              <span className="flex flex-wrap items-center gap-2 pr-2">
                <span
                  className={cn(
                    "text-base font-semibold transition-colors sm:text-lg",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {module.title}
                </span>
                {module.premium ? <ModulePremiumBadge /> : null}
              </span>

              <p
                className={cn(
                  "overflow-hidden text-sm leading-relaxed text-muted-foreground transition-all duration-300",
                  active
                    ? "mt-2.5 max-h-40 opacity-100 sm:max-h-48"
                    : "max-h-0 opacity-0",
                )}
              >
                {module.description}
              </p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function LandingModulesInteractive() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
      <ModulesVisual />
      <ModulesList activeIndex={activeIndex} onSelect={handleSelect} />
    </div>
  );
}
