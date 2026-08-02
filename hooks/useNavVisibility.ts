"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Instagram-style navbar visibility: scroll down and the bar slides up out of
 * view, scroll back up and it drops in from the top edge.
 *
 * The whole difficulty is that "scroll direction" is not a usable signal on this
 * site. Lenis runs at `lerp: 0.08`, so a settling scroll emits a long tail of
 * sub-pixel deltas that flip sign; the previous implementation committed on any
 * non-zero delta and therefore strobed. The fix is the directional accumulator
 * below: travel is measured in ONE direction and reset the moment the sign
 * changes, so the thresholds describe intent rather than net displacement.
 *
 * It rides ScrollTrigger rather than its own scroll listener because
 * `SmoothScrollProvider` already calls `ScrollTrigger.update()` from
 * `lenis.on("scroll")` and drives Lenis off `gsap.ticker` - so `onUpdate` lands
 * in the same batched frame as the scroll write, and `onRefresh` re-baselines
 * for free on the load/resize/fonts passes the provider already fires.
 */

/** Roughly the bar's own height: it never hides while its footprint is on screen. */
const TOP_ZONE_PX = 80;
/** Downward travel, in one direction, before the bar commits to hiding. */
const HIDE_DELTA_PX = 12;
/** Upward travel before it commits to showing. Lower than HIDE on purpose - the
 *  reveal is the affordance, so it answers more eagerly than it retreats. */
const SHOW_DELTA_PX = 6;
/** The island arms and disarms on a band, not a point, so it cannot strobe when
 *  the reader parks near the top. */
const PEEL_ON_PX = 24;
const PEEL_OFF_PX = 8;
/** iOS rubber-band tolerance. Outside the document range is bounce, not intent. */
const EDGE_GUARD_PX = 2;

const SHOW_DURATION = 0.36;
const HIDE_DURATION = 0.28;
const SHOW_EASE = "power3.out";
const HIDE_EASE = "power2.out";

/**
 * Reduced motion pins the bar rather than jump-cutting it. A fixed ~84px bar
 * snapping in and out over content is more disorienting than a slide, and
 * without Lenis the raw trackpad deltas would strobe a zero-duration toggle.
 * Note this also covers Save-Data and low battery, so those users get a
 * permanently visible bar - flip to `false` for instant hide/show instead.
 */
const PIN_WHEN_REDUCED_MOTION = true;

type UseNavVisibilityOptions = {
  /** While true the bar is force-shown and can never hide (mobile menu open). */
  locked?: boolean;
  /** Changing this re-baselines the tracker - pass `pathname`. */
  resetKey?: string;
  /** Fires on the frame the bar commits to hiding. Close hover panels here. */
  onHide?: () => void;
};

export function useNavVisibility({
  locked = false,
  resetKey,
  onHide,
}: UseNavVisibilityOptions = {}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isPeeled, setIsPeeled] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  const pinnedRef = useRef(false);
  const lockedRef = useRef(locked);
  const hiddenRef = useRef(false);
  const peeledRef = useRef(false);
  const lastScrollRef = useRef(0);
  const accumRef = useRef(0);
  const onHideRef = useRef(onHide);

  useEffect(() => {
    onHideRef.current = onHide;
  });

  const setHidden = useCallback((next: boolean) => {
    const bar = barRef.current;
    if (!bar) return;
    // Showing is always allowed; only hiding answers to the lock and the pin.
    if (next && (pinnedRef.current || lockedRef.current)) return;
    if (hiddenRef.current === next) return;

    hiddenRef.current = next;
    accumRef.current = 0; // every commit starts a fresh travel budget

    if (next) onHideRef.current?.();

    gsap.to(bar, {
      yPercent: next ? -100 : 0,
      duration: next ? HIDE_DURATION : SHOW_DURATION,
      ease: next ? HIDE_EASE : SHOW_EASE,
      overwrite: "auto",
    });
  }, []);

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;

      // Mirrored here rather than during render (a ref write in the render body
      // is a React violation). `prefersReducedMotion` is a dependency of this
      // block, so the mirror can never go stale - and because `useGSAP` runs in
      // a layout effect, it lands before the first scroll sample below.
      pinnedRef.current = PIN_WHEN_REDUCED_MOTION && prefersReducedMotion;

      // The server renders no transform, so this is the first one written and
      // hydration has nothing to mismatch on.
      gsap.set(bar, { yPercent: 0 });
      hiddenRef.current = false;
      accumRef.current = 0;
      lastScrollRef.current = window.scrollY;

      const syncPeel = (y: number) => {
        const next = peeledRef.current ? y > PEEL_OFF_PX : y > PEEL_ON_PX;
        if (next === peeledRef.current) return;
        peeledRef.current = next;
        setIsPeeled(next);
      };

      const read = (raw: number) => {
        const max = ScrollTrigger.maxScroll(window);

        // Rubber-band: swallow the sample and clamp the baseline, so the
        // snap-back doesn't register as a deliberate direction change.
        if (raw < -EDGE_GUARD_PX || raw > max + EDGE_GUARD_PX) {
          lastScrollRef.current = gsap.utils.clamp(0, max, raw);
          accumRef.current = 0;
          return;
        }

        const y = gsap.utils.clamp(0, max, raw);
        const delta = y - lastScrollRef.current;
        lastScrollRef.current = y;

        syncPeel(y);

        if (pinnedRef.current || lockedRef.current) {
          accumRef.current = 0;
          return;
        }

        if (y <= TOP_ZONE_PX) {
          accumRef.current = 0;
          setHidden(false);
          return;
        }

        if (delta === 0) return;

        // Reset on every sign flip so the thresholds measure travel in one
        // direction. This is the line that kills the sub-pixel Lenis flicker.
        if (Math.sign(delta) !== Math.sign(accumRef.current)) {
          accumRef.current = 0;
        }
        accumRef.current += delta;

        if (accumRef.current >= HIDE_DELTA_PX) setHidden(true);
        else if (accumRef.current <= -SHOW_DELTA_PX) setHidden(false);
      };

      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => read(self.scroll()),
        onRefresh: (self) => {
          // The provider refreshes on load / resize / fonts.ready. Re-baseline
          // so a layout shift is never read as user intent.
          lastScrollRef.current = self.scroll();
          accumRef.current = 0;
          syncPeel(self.scroll());
        },
      });

      read(window.scrollY);

      return () => trigger.kill();
    },
    {
      scope: barRef,
      dependencies: [prefersReducedMotion, setHidden],
      revertOnUpdate: true,
    }
  );

  // Lock: force-show, and neutralise whatever scrolled past while the menu owned
  // the screen so unlocking never fires an immediate hide.
  useEffect(() => {
    lockedRef.current = locked;
    accumRef.current = 0;
    lastScrollRef.current = window.scrollY;
    if (locked) setHidden(false);
  }, [locked, setHidden]);

  // Route change: the App Router restores to the top, so re-baseline and reveal.
  useEffect(() => {
    accumRef.current = 0;
    lastScrollRef.current = 0;
    setHidden(false);
  }, [resetKey, setHidden]);

  return { barRef, isPeeled };
}
