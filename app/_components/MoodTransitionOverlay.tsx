"use client";

import { useEffect, useRef } from "react";
import { useMood } from "./MoodProvider";
import { MOOD_THRESHOLDS } from "@/constants/moodConfig";

export default function MoodTransitionOverlay() {
  const { moodActive, progressRef } = useMood();
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!moodActive) {
      if (overlayRef.current) overlayRef.current.style.opacity = "0";
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      if (!overlayRef.current) return;
      const p = progressRef.current;
      const fadeStart = MOOD_THRESHOLDS.overlayStart;
      const alpha = Math.min(1, Math.max(0, (p - fadeStart) / (1 - fadeStart)));
      overlayRef.current.style.opacity = String(alpha);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [moodActive, progressRef]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-40 transition-theme"
      style={{
        opacity: 0,
        background: "var(--background)",
      }}
      aria-hidden
    />
  );
}
