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

type DisciplineIndexOptions = {
  count: number;
  /** Fires once, on the first pointer that enters the column. The arrow hint. */
  onFirstPointerEnter?: () => void;
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
 */
export function useDisciplineIndex({
  count,
  onFirstPointerEnter,
}: DisciplineIndexOptions) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const columnRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      if (clamped === indexRef.current) return;
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [count]
  );

  const step = useCallback(
    (direction: 1 | -1) => goTo(indexRef.current + direction),
    [goTo]
  );

  /**
   * Kept in a ref rather than in the dependency array: the callback is only
   * ever read from inside a listener, and re-attaching a `{ passive: false }`
   * wheel listener because a parent re-rendered is a wobble nobody needs.
   */
  const firstEnterRef = useRef(onFirstPointerEnter);
  useEffect(() => {
    firstEnterRef.current = onFirstPointerEnter;
  }, [onFirstPointerEnter]);

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
    let hinted = false;

    const onWheel = (event: WheelEvent) => {
      // Touch and narrow viewports never capture: there the vertical gesture is
      // the page's scroll, and taking it is the collision this section avoids.
      if (!capture.matches) return;

      const delta = normaliseDelta(event);
      // A horizontal wheel (shift-scroll, a tilt wheel) is not ours.
      if (delta === 0) return;

      const direction = delta > 0 ? 1 : -1;
      const current = indexRef.current;

      /**
       * EDGE RELEASE. This runs BEFORE the cooldown and before the buffer, and
       * that order is the whole rule: at index 0 going up and at the last index
       * going down the event is not touched at all, so it reaches Lenis and the
       * page scrolls on immediately. Without this a cursor parked over the
       * model eats every delta and the visitor can never reach the footer -
       * which is not an ugly bug, it is a blocked site.
       */
      if (
        (direction < 0 && current === 0) ||
        (direction > 0 && current === count - 1)
      ) {
        buffer = 0;
        return;
      }

      // From here the delta is ours: spent on a step, or spent on nothing.
      // Either way it is spent, so it must not also scroll the page.
      event.preventDefault();
      // Our listener sits on the element, Lenis' sits on the window, so this is
      // what keeps Lenis out of it - and keeps Lenis alive for everything else.
      event.stopPropagation();

      const now = performance.now();
      if (now - lastEventAt > WHEEL_BUFFER_RESET_MS) buffer = 0;
      lastEventAt = now;

      // Inside the cooldown the delta is eaten but NOT banked. A trackpad flick
      // keeps firing long after the fingers lift; banking that tail is exactly
      // how one flick becomes two steps.
      if (now - lastStepAt < WHEEL_STEP_COOLDOWN_MS) {
        buffer = 0;
        return;
      }

      buffer += delta;
      if (Math.abs(buffer) <= WHEEL_STEP_THRESHOLD) return;

      const stepDirection = buffer > 0 ? 1 : -1;
      buffer = 0;
      lastStepAt = now;
      goTo(indexRef.current + stepDirection);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const current = indexRef.current;
      let next = current;

      switch (event.key) {
        case "ArrowDown":
          next = current + 1;
          break;
        case "ArrowUp":
          next = current - 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = count - 1;
          break;
        default:
          return;
      }

      next = Math.max(0, Math.min(count - 1, next));
      // Same contract as the wheel: a key that cannot move the index is not
      // consumed, so at the ends the page keeps its own arrow-key scrolling.
      if (next === current) return;

      event.preventDefault();
      goTo(next);
    };

    const onPointerEnter = () => {
      if (hinted || !capture.matches) return;
      hinted = true;
      firstEnterRef.current?.();
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
    column.addEventListener("pointerenter", onPointerEnter);
    column.addEventListener("pointerdown", onPointerDown);
    column.addEventListener("pointerup", onPointerUp);
    column.addEventListener("pointercancel", onPointerCancel);

    return () => {
      column.removeEventListener("wheel", onWheel);
      column.removeEventListener("keydown", onKeyDown);
      column.removeEventListener("pointerenter", onPointerEnter);
      column.removeEventListener("pointerdown", onPointerDown);
      column.removeEventListener("pointerup", onPointerUp);
      column.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [count, goTo, step]);

  return { index, columnRef, goTo, step };
}
