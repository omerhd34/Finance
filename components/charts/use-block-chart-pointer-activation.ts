"use client";

import { useEffect, type RefObject } from "react";

export function useBlockChartPointerActivation(
  containerRef: RefObject<HTMLElement | null>,
  chartReady: boolean,
) {
  useEffect(() => {
    if (!chartReady) return;
    const el = containerRef.current;
    if (!el) return;

    const stop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const opts: AddEventListenerOptions = { capture: true };
    const touchOpts: AddEventListenerOptions = {
      capture: true,
      passive: false,
    };

    el.addEventListener("pointerdown", stop, opts);
    el.addEventListener("pointerup", stop, opts);
    el.addEventListener("click", stop, opts);
    el.addEventListener("mousedown", stop, opts);
    el.addEventListener("touchstart", stop, touchOpts);
    el.addEventListener("touchend", stop, touchOpts);

    return () => {
      el.removeEventListener("pointerdown", stop, opts);
      el.removeEventListener("pointerup", stop, opts);
      el.removeEventListener("click", stop, opts);
      el.removeEventListener("mousedown", stop, opts);
      el.removeEventListener("touchstart", stop, touchOpts);
      el.removeEventListener("touchend", stop, touchOpts);
    };
  }, [chartReady, containerRef]);
}
