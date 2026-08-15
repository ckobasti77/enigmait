"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  CAPTURE_QUERY,
  SWIPE_DOMINANCE,
  SWIPE_THRESHOLD_PX,
  WHEEL_BUFFER_RESET_MS,
  WHEEL_LINE_HEIGHT,
  WHEEL_STEP_COOLDOWN_MS,
  WHEEL_STEP_THRESHOLD,
} from "./disciplinesTiming";

/**
 * `deltaMode` first, everything else after. Firefox sends lines, Safari and
 * Chrome send pixels, and a page-mode wheel (rare, but real) sends screens. A
 * threshold compared against the raw number is a different gesture in each.
 */
function normaliseDelta(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * WHEEL_LINE_HEIGHT;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/** Which way the strip travels. Forward means the current slide leaves to the left. */
export type SlideDirection = 1 | -1;

type Slide = { index: number; direction: SlideDirection };

type DisciplineIndexOptions = {
  count: number;
};

/**
 * The section's only input engine.
 *
 * The index lives here as state; everything that happens BETWEEN two index
 * changes - a wheel that has not filled the buffer yet, the cooldown, a swipe
 * in progress - lives in refs. That split is the point: React re-renders on an
 * index change and on nothing else.
 *
 * The wheel listener is on the 3D column, not on the section and not on the
 * window, so it only ever sees events the cursor is already over. Everywhere
 * else on the section the page scrolls, because nothing is listening there.
 *
 * DIRECTION IS STATE, NOT A DERIVATION. It used to be recovered downstream by
 * comparing the new index with the old one, which is only correct for a list
 * with ends: now that the list wraps, 5 -> 0 is a step FORWARD and 0 -> 5 is a
 * step back, and no comparison of two numbers can tell those from a jump the
 * other way. So whoever moved the index says which way it went, and a dot -
 * which names a destination rather than a direction - gets the short way round.
 */
export function useDisciplineIndex({ count }: DisciplineIndexOptions) {
  const [slide, setSlide] = useState<Slide>({ index: 0, direction: 1 });
  const indexRef = useRef(0);
  const columnRef = useRef<HTMLDivElement | null>(null);

  /** The stage is on screen. The hint's clock, and what re-arms the wheel budget. */
  const [stageVisible, setStageVisible] = useState(false);

  /**
   * The visitor has driven the slider at least once. Only ever goes false ->
   * true, and the mirror in a ref is what lets the listeners check it without
   * being re-attached every time it changes.
   */
  const [interacted, setInteracted] = useState(false);
  const interactedRef = useRef(false);

  const markInteracted = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    setInteracted(true);
  }, []);

  const goTo = useCallback(
    (target: number, direction?: SlideDirection) => {
      markInteracted();

      const next = ((target % count) + count) % count;
      if (next === indexRef.current) return;

      // Distance travelled forwards to get there. Under half the list means
      // forward is the short way round; anything more and it is quicker back.
      const forward = ((next - indexRef.current) % count + count) % count;

      indexRef.current = next;
      setSlide({ index: next, direction: direction ?? (forward * 2 <= count ? 1 : -1) });
    },
    [count, markInteracted]
  );

  const step = useCallback(
    (direction: SlideDirection) => goTo(indexRef.current + direction, direction),
    [goTo]
  );

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    /**
     * Live, not sampled. Reading `.matches` inside the handlers means a window
     * that is dragged across 768px, or a hybrid laptop whose pointer changes,
     * is handled without re-attaching anything.
     */
    const capture = window.matchMedia(CAPTURE_QUERY);

    let buffer = 0;
    let lastEventAt = 0;
    let lastStepAt = 0;

    /**
     * WHEEL_CAPTURE_BUDGET - what replaced the edge release.
     *
     * The old rule was: at index 0 going up and at the last index going down,
     * do not touch the event, so it reaches Lenis and the page scrolls on. That
     * rule needs ends, and a wrapping list has none - without a replacement a
     * cursor parked over the model eats every delta forever and the visitor can
     * never reach the footer. That is not an ugly bug, it is a blocked site.
     *
     * So the wheel gets a budget instead: `count - 1` steps - first model to
     * last - after which the deltas are left alone and the page scrolls on.
     *
     * The budget is scoped to ONE UNINTERRUPTED SCROLL, not to the whole visit.
     * A pause between pushes (a new gesture) or a change of direction refills it;
     * only a single sustained scroll in one direction can run it dry. This is the
     * distinction that matters: browsing model to model - which always pauses,
     * however briefly, between notches, or turns back to re-read one - never runs
     * out, so the strip does not go dead near the end of the list. What still runs
     * out is the one gesture that means "get me past this section": a long,
     * uninterrupted push, which then hands the page back and the footer stays
     * reachable. (Before, the budget was per-visit and only refilled when the
     * stage left the viewport, so the last model or two became a spot where the
     * wheel simply stopped answering until you scrolled away and came back.)
     *
     * The budget is the WHEEL's alone. Dots, arrows, the keyboard and the swipe
     * wrap without limit, because none of them is competing with the page's own
     * scroll for the same gesture.
     */
    const WHEEL_CAPTURE_BUDGET = count - 1;
    let capturedSteps = 0;
    /** Direction of the last committed step, so a reversal can refill the budget. */
    let lastStepDirection = 0;

    const onWheel = (event: WheelEvent) => {
      // Touch and narrow viewports never capture: there the vertical gesture is
      // the page's scroll, and taking it is the collision this section avoids.
      if (!capture.matches) return;

      const delta = normaliseDelta(event);
      // A horizontal wheel (shift-scroll, a tilt wheel) is not ours.
      if (delta === 0) return;

      // Any wheel over the stage retires the hint, including one this listener
      // is about to hand straight back to the page: the visitor has clearly
      // found the section, which is all the hint was there to help with.
      markInteracted();

      const now = performance.now();
      // A gap since the last wheel event ends the previous gesture and begins a
      // new one - which resets the buffer AND refills the step budget. Refilling
      // here is what keeps the budget scoped to a single uninterrupted scroll
      // (see WHEEL_CAPTURE_BUDGET above): the moment the visitor pauses and pushes
      // again, the wheel answers, instead of staying dead until the section leaves
      // the viewport.
      if (now - lastEventAt > WHEEL_BUFFER_RESET_MS) {
        buffer = 0;
        capturedSteps = 0;
      }
      lastEventAt = now;

      if (capturedSteps >= WHEEL_CAPTURE_BUDGET) {
        buffer = 0;
        return;
      }

      // From here the delta is ours: spent on a step, or spent on nothing.
      // Either way it is spent, so it must not also scroll the page.
      event.preventDefault();
      // Our listener sits on the element, Lenis' sits on the window, so this is
      // what keeps Lenis out of it - and keeps Lenis alive for everything else.
      event.stopPropagation();

      // Inside the cooldown the delta is eaten but NOT banked. A trackpad flick
      // keeps firing long after the fingers lift; banking that tail is exactly
      // how one flick becomes two steps.
      if (now - lastStepAt < WHEEL_STEP_COOLDOWN_MS) {
        buffer = 0;
        return;
      }

      buffer += delta;
      if (Math.abs(buffer) <= WHEEL_STEP_THRESHOLD) return;

      const stepDirection: SlideDirection = buffer > 0 ? 1 : -1;
      // Turning back the way you came is browsing, not leaving: a reversal refills
      // the budget so stepping back through the models is never blocked by budget
      // already spent going forward.
      if (stepDirection !== lastStepDirection) capturedSteps = 0;
      buffer = 0;
      lastStepAt = now;
      lastStepDirection = stepDirection;
      capturedSteps += 1;
      goTo(indexRef.current + stepDirection, stepDirection);
    };

    /**
     * Both axes, because the rail is horizontal but the wheel that drives it is
     * vertical - a key that names either direction still means "previous" or
     * "next". The arrows always move now that the list wraps, so they are always
     * consumed; Home and End name a destination and are left alone when the
     * index is already on it, which is the one case where the page should keep
     * its own scrolling.
     */
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          step(1);
          return;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          step(-1);
          return;
        case "Home":
          if (indexRef.current === 0) return;
          event.preventDefault();
          goTo(0);
          return;
        case "End":
          if (indexRef.current === count - 1) return;
          event.preventDefault();
          goTo(count - 1);
          return;
        default:
      }
    };

    /**
     * Touch only, and horizontal only. `touch-action: pan-y pinch-zoom` on the
     * column leaves the vertical gesture and the pinch to the browser, so what
     * arrives here is already the sideways part - no `preventDefault`, nothing
     * taken from the page's scroll.
     */
    let swipeX = 0;
    let swipeY = 0;
    let swiping = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      swiping = true;
      swipeX = event.clientX;
      swipeY = event.clientY;
      markInteracted();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!swiping) return;
      swiping = false;

      const dx = event.clientX - swipeX;
      const dy = event.clientY - swipeY;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dx) <= Math.abs(dy) * SWIPE_DOMINANCE) return;

      // Left is forward, the way a carousel moves under the thumb.
      step(dx < 0 ? 1 : -1);
    };

    const onPointerCancel = () => {
      swiping = false;
    };

    column.addEventListener("wheel", onWheel, { passive: false });
    column.addEventListener("keydown", onKeyDown);
    column.addEventListener("pointerdown", onPointerDown);
    column.addEventListener("pointerup", onPointerUp);
    column.addEventListener("pointercancel", onPointerCancel);

    /**
     * One observer, two jobs, and they are the same fact: the stage is on
     * screen. It starts the hint's clock and it refills the wheel's budget, so
     * a visitor who scrolls away and comes back gets a fresh section rather
     * than a spent one. A third of the box, so "visible" means visible and not
     * a sliver clipping the fold.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStageVisible(entry.isIntersecting);
        if (!entry.isIntersecting) capturedSteps = 0;
      },
      { threshold: 0.35 }
    );
    observer.observe(column);

    return () => {
      column.removeEventListener("wheel", onWheel);
      column.removeEventListener("keydown", onKeyDown);
      column.removeEventListener("pointerdown", onPointerDown);
      column.removeEventListener("pointerup", onPointerUp);
      column.removeEventListener("pointercancel", onPointerCancel);
      observer.disconnect();
    };
  }, [count, goTo, markInteracted, step]);

  return {
    index: slide.index,
    direction: slide.direction,
    columnRef,
    goTo,
    step,
    stageVisible,
    interacted,
  };
}
