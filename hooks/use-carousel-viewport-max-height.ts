"use client";

import type { RefObject } from "react";
import { useCallback, useLayoutEffect } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

type EmblaReady = NonNullable<CarouselApi>;

function readSlideHeight(el: HTMLElement): number {
  return Math.ceil(
    Math.max(
      el.offsetHeight,
      el.scrollHeight,
      el.getBoundingClientRect().height,
    ),
  );
}

function measureViewportHeight(vp: HTMLElement, api: EmblaReady): number {
  let max = 0;
  for (const node of api.slideNodes()) {
    max = Math.max(max, readSlideHeight(node));
  }
  const inner = vp.firstElementChild;
  if (inner instanceof HTMLElement) {
    max = Math.max(max, inner.offsetHeight, inner.scrollHeight);
  }
  return max;
}

export function useCarouselViewportMaxHeight(
  api: CarouselApi | undefined,
  viewportRef: RefObject<HTMLDivElement | null>,
): void {
  const applyHeight = useCallback(() => {
    const vp = viewportRef.current;
    const emblaApi = api;
    if (!vp || !emblaApi) return;
    const max = measureViewportHeight(vp, emblaApi);
    if (max > 0) {
      const px = `${max}px`;
      vp.style.height = px;
      vp.style.minHeight = px;
    }
  }, [api, viewportRef]);

  useLayoutEffect(() => {
    const emblaApi = api;
    if (!emblaApi) return;

    const viewportAtMount = viewportRef.current;

    const ro = new ResizeObserver(applyHeight);

    const bindTargets = () => {
      ro.disconnect();
      applyHeight();
      for (const el of emblaApi.slideNodes()) {
        ro.observe(el);
      }
      const inner = viewportRef.current?.firstElementChild;
      if (inner instanceof HTMLElement) {
        ro.observe(inner);
      }
    };

    const scheduleRemeasure = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(applyHeight);
      });
    };

    bindTargets();
    scheduleRemeasure();

    const onApi = () => {
      bindTargets();
      scheduleRemeasure();
    };

    emblaApi.on("reInit", onApi);
    emblaApi.on("resize", onApi);
    emblaApi.on("slidesChanged", onApi);
    emblaApi.on("select", applyHeight);
    emblaApi.on("settle", applyHeight);
    window.addEventListener("resize", applyHeight);

    let fontsCancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!fontsCancelled) applyHeight();
      });
    }

    return () => {
      fontsCancelled = true;
      emblaApi.off("reInit", onApi);
      emblaApi.off("resize", onApi);
      emblaApi.off("slidesChanged", onApi);
      emblaApi.off("select", applyHeight);
      emblaApi.off("settle", applyHeight);
      window.removeEventListener("resize", applyHeight);
      ro.disconnect();
      if (viewportAtMount) {
        viewportAtMount.style.height = "";
        viewportAtMount.style.minHeight = "";
      }
    };
  }, [api, applyHeight, viewportRef]);
}
