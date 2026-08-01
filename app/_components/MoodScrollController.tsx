"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMood } from "./MoodProvider";
import { MOOD_THRESHOLDS } from "@/constants/moodConfig";
import { useSmoothScroll } from "./SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  heroRef: React.RefObject<HTMLElement | null>;
};

export default function MoodScrollController({ heroRef }: Props) {
  const { moodActive, progressRef, setMoodEngaged } = useMood();
  const smoothScrollRef = useSmoothScroll();
  const ctxRef = useRef<gsap.Context | null>(null);
  const savedScrollY = useRef(0);

  useEffect(() => {
    if (!heroRef.current) return;

    if (moodActive) {
      savedScrollY.current = window.scrollY;

      // Scroll to hero top so the pin starts cleanly
      const heroTop =
        heroRef.current.getBoundingClientRect().top + window.scrollY;
      const lenis = smoothScrollRef?.current;

      if (lenis) {
        lenis.scrollTo(heroTop, {
          duration: 0.8,
          lock: true,
        });
      } else {
        window.scrollTo({ top: heroTop, behavior: "smooth" });
      }

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          end: MOOD_THRESHOLDS.pinDistance,
          pin: true,
          scrub: MOOD_THRESHOLDS.scrub,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            if (self.progress >= MOOD_THRESHOLDS.engaged) {
              setMoodEngaged(true);
            } else {
              setMoodEngaged(false);
            }
          },
        });
      }, heroRef);

      ctxRef.current = ctx;

      return () => {
        ctx.revert();
        ctxRef.current = null;
      };
    } else {
      // Cleanup when toggled off
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
      progressRef.current = 0;
      setMoodEngaged(false);

      // Restore scroll position
      const lenis = smoothScrollRef?.current;

      if (lenis) {
        lenis.scrollTo(savedScrollY.current, {
          force: true,
          immediate: true,
        });
      } else {
        window.scrollTo({ top: savedScrollY.current, behavior: "instant" });
      }
    }
  }, [moodActive, heroRef, progressRef, setMoodEngaged, smoothScrollRef]);

  return null;
}
