"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { buildBorderTracePaths, TRACE_LENGTH } from "@/lib/borderTrace";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The process card's unlock, made shareable.
 *
 * `ProcessCard` owns a five-step chain because it has a spine to answer to: a
 * node lands, a connector grows, and only then do the streaks split off. A card
 * in a grid has none of that, so this is the same sequence minus the prelude -
 * two streaks leave the top edge, run the border in opposite directions and
 * meet at the bottom, and the card's content comes up inside that trace.
 *
 * What is deliberately shared with `ProcessCard` is the *feel*: the same dash
 * length, the same `power1.inOut` on the streak, the same border-box
 * measurement, the same "once unlocked, stays unlocked" rule. The constants are
 * restated here rather than imported from `ProcessCard` because the homepage is
 * the design reference for this redesign and stays untouched; if the two ever
 * need to move together, this file is the one to lift them into.
 *
 * The one thing this reveal does NOT animate is opacity. Copy on this site is
 * revealed word by word by the site-wide pass (`lib/textReveal.ts`), and that
 * pass owns the opacity of every line inside the card. Fading the same copy
 * from here would mean opting the subtree out and re-splitting it, which is a
 * lot of machinery for a primitive that renders whatever children it is given.
 * Depth - blur and lift - is the card's own layer and stacks with the words
 * arriving inside it.
 */

/** Streak length, in the normalised units the paths are rendered at. */
export const TRACE_DASH = TRACE_LENGTH * 0.17;

/**
 * Corner radius the trace follows. Matches `--ui-card-radius` in `globals.css`,
 * which now reads the site-wide `--surface-radius` (14px, the CTA's corner).
 */
export const CARD_RADIUS = 14;

/**
 * Class hooks. The hook animates them, `components/ui/card.tsx` renders them -
 * one place decides both, so a rename cannot leave content hidden.
 */
export const REVEAL_VEIL_CLASS = "ui-card-veil";
export const REVEAL_PATH_CLASS = "ui-card-trace-path";

/**
 * Fires once the card's top edge is 15% into the viewport - the same moment the
 * site-wide text reveal uses, so the streak and the words start together.
 * `ProcessCard`'s `center 67%` is not reused: it needs the card's centre because
 * it has a longer chain to finish, and a card that never reaches mid-screen
 * (the last row of a short page) would never unlock at all.
 */
const TRIGGER_START = "top 85%";

type BorderTrace = {
  paths: [string, string];
  width: number;
  height: number;
  dash: number;
};

type BorderTraceReveal = {
  /** Goes on the card's outer box - measured, and the GSAP context's root. */
  ref: RefObject<HTMLElement | null>;
  /** `null` until the card is measured, and under reduced motion. */
  trace: BorderTrace | null;
};

export function useBorderTraceReveal(
  radius: number = CARD_RADIUS
): BorderTraceReveal {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  /** Survives timeline rebuilds so a resize does not re-lock an opened card. */
  const openedRef = useRef(false);
  /** When it opened, so a rebuild can resume it instead of ending it - see below. */
  const openedAtRef = useRef(0);

  // A one-shot entrance is the brand and it costs a few hundred milliseconds
  // once, so it follows the OS preference only - never Save-Data or battery.
  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });

  // The trace is drawn in the card's own pixel space, so it has to be measured
  // rather than derived: cards are fluid inside their grid.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([record]) => {
      // Border box, not content box: the trace is drawn *on* the border, and a
      // content-box viewBox is two pixels narrow - enough to push a 1px stroke
      // off the corner it is supposed to follow.
      const box = record.borderBoxSize?.[0];
      const width = box ? box.inlineSize : record.contentRect.width;
      const height = box ? box.blockSize : record.contentRect.height;

      setSize((current) =>
        Math.abs(current.width - width) < 0.5 &&
        Math.abs(current.height - height) < 0.5
          ? current
          : { width, height }
      );
    });

    observer.observe(element, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  const paths = useMemo(
    () => buildBorderTracePaths(size.width, size.height, radius, "top"),
    [size.width, size.height, radius]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Nothing is hidden by CSS, so opting out is just declining to stage it:
    // the card is already in its finished state.
    if (prefersReducedMotion) return;

    // Note this does not wait on the measurement. An unmeasured card simply has
    // no streak to draw; its content must still come up, or a card that never
    // reports a size would stay blurred for good.
    const ctx = gsap.context(() => {
      const veil = `.${REVEAL_VEIL_CLASS}`;
      const traces = `.${REVEAL_PATH_CLASS}`;
      const hasTrace = Boolean(paths[0]);

      gsap.set(veil, { y: 14, filter: "blur(6px)" });

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      if (hasTrace) {
        gsap.set(traces, { strokeDashoffset: TRACE_DASH, autoAlpha: 0 });

        timeline.to(traces, { autoAlpha: 1, duration: 0.08 }).to(
          traces,
          {
            // Past the end of the path the streak is clipped away entirely, so
            // it arrives at the meeting point and vanishes there rather than
            // needing a fade of its own.
            strokeDashoffset: -TRACE_LENGTH,
            duration: 1.05,
            ease: "power1.inOut",
          },
          "<"
        );
      }

      timeline.to(
        veil,
        { y: 0, filter: "blur(0px)", duration: 0.85 },
        hasTrace ? "<0.1" : 0
      );

      ScrollTrigger.create({
        trigger: element,
        start: TRIGGER_START,
        once: true,
        onEnter: () => {
          openedRef.current = true;
          openedAtRef.current = performance.now();
          timeline.play();
        },
      });

      // A rebuild must not re-lock a card that has already been unlocked - but
      // it must not swallow one that is still opening either, and that second
      // case is not rare: the first build runs BEFORE the ResizeObserver has
      // reported, so it has no paths, and a card that is already on screen has
      // its trigger fire on that build. The measurement then arrives a frame
      // later and rebuilds. Ending the timeline there is what used to eat the
      // streak outright on every above-the-fold card - the panel simply
      // appeared. Resuming from where the previous one had got to keeps the
      // resize case honest and lets the trace run.
      if (openedRef.current) {
        const elapsed = (performance.now() - openedAtRef.current) / 1000;

        if (elapsed >= timeline.duration()) timeline.progress(1).pause();
        else timeline.seek(elapsed).play();
      }
    }, ref);

    return () => ctx.revert();
  }, [paths, prefersReducedMotion]);

  return {
    ref,
    trace:
      prefersReducedMotion || !paths[0]
        ? null
        : {
            paths,
            width: size.width,
            height: size.height,
            dash: TRACE_DASH,
          },
  };
}
