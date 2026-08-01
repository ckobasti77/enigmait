"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProviderProps = {
  children: ReactNode;
};

type SmoothScrollRef = RefObject<Lenis | null>;

const SmoothScrollContext = createContext<SmoothScrollRef | null>(null);

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (prefersReducedMotion.matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      anchors: true,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    let isActive = true;
    let resizeFrame = 0;
    let refreshTimeout = 0;
    const refreshMeasurements = () => {
      if (!isActive) return;

      if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
      }

      refreshTimeout = window.setTimeout(() => {
        if (!isActive) return;

        if (resizeFrame) {
          window.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = window.requestAnimationFrame(() => {
          if (!isActive) return;

          resizeFrame = 0;
          refreshTimeout = 0;
          lenis.resize();
          ScrollTrigger.refresh();
        });
      }, 120);
    };
    const refreshMeasurementsSoon = () => {
      if (!isActive || refreshTimeout || resizeFrame) return;

      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        if (!isActive) return;

        resizeFrame = 0;
        lenis.resize();
        ScrollTrigger.refresh();
      });
    };

    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    window.addEventListener("load", refreshMeasurements);
    window.addEventListener("resize", refreshMeasurements);

    void document.fonts?.ready.then(refreshMeasurements);
    refreshMeasurementsSoon();
    const refreshTimeouts = [
      window.setTimeout(refreshMeasurements, 250),
      window.setTimeout(refreshMeasurements, 1000),
    ];

    return () => {
      isActive = false;

      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
      if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
      }

      refreshTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      window.removeEventListener("load", refreshMeasurements);
      window.removeEventListener("resize", refreshMeasurements);
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={lenisRef}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
