"use client";

import { useGLTF, useTexture } from "@react-three/drei";

import { DISCIPLINE_ORDER, disciplines } from "@/constants/disciplines";

/**
 * What is allowed to be in memory, and when it is allowed to get there.
 *
 * SECTION_SPEC decision 3 and the "Budzeti" section set one rule for both kinds of asset:
 * the active model and its two neighbours, no more, with the neighbours fetched on idle
 * time rather than on the step that needs them. Six GLBs plus six screen images pulled at
 * once is roughly double the section's network budget, and it is the failure this file
 * exists to prevent - which is why the eviction below is not an optimisation to do later.
 *
 * Two things are deliberately NOT here:
 *
 * - The lens. `seo-geo`'s second primitive is glass with no UVs, so it has no image to
 *   fetch and its `screenImage` is never read. Prefetching it would spend a slot on a
 *   texture nothing samples.
 * - Anything that runs during render. Every call below is scheduled from an effect, on
 *   idle, so a step never pays for the step after it.
 */

const inFlight = new Set<string>();

const modelUrl = (index: number) =>
  disciplines[DISCIPLINE_ORDER[index]].modelPath;

/** The screen image of a model, or null where the second primitive is a lens. */
const screenUrl = (index: number) => {
  const discipline = disciplines[DISCIPLINE_ORDER[index]];
  return discipline.screenKind === "lens" ? null : discipline.screenImage;
};

const inRange = (index: number) =>
  index >= 0 && index < DISCIPLINE_ORDER.length;

/**
 * Pull one discipline's GLB and screen image into drei's cache. Idempotent: the second call
 * for the same index is a `Set` lookup, so callers never have to remember what they asked
 * for.
 */
export function preloadDiscipline(index: number) {
  if (!inRange(index)) return;

  const model = modelUrl(index);
  if (!inFlight.has(model)) {
    inFlight.add(model);
    useGLTF.preload(model);
  }

  const screen = screenUrl(index);
  if (screen && !inFlight.has(screen)) {
    inFlight.add(screen);
    useTexture.preload(screen);
  }
}

/**
 * Drop a discipline's assets. Only ever called for an index that is not mounted - the reel
 * holds at most the active model and the one arriving - so this releases GPU memory rather
 * than pulling the rug out from under a draw call.
 */
function releaseDiscipline(index: number) {
  if (!inRange(index)) return;

  const model = modelUrl(index);
  if (inFlight.delete(model)) useGLTF.clear(model);

  const screen = screenUrl(index);
  // Five of the six screens share one placeholder image today. Clearing it because one
  // model walked out of range would take it out from under the model still using it, so a
  // URL still claimed by an in-range discipline is left alone.
  if (screen && !urlStillNeeded(screen, index) && inFlight.delete(screen)) {
    useTexture.clear(screen);
  }
}

const urlStillNeeded = (url: string, exceptIndex: number) =>
  DISCIPLINE_ORDER.some((key, position) => {
    if (position === exceptIndex) return false;
    const discipline = disciplines[key];
    return discipline.screenKind !== "lens" && discipline.screenImage === url;
  });

type IdleHandle = { cancel: () => void };

/**
 * `requestIdleCallback` where it exists, a timeout where it does not - Safari shipped it
 * only recently and iOS is in SECTION_SPEC's browser list. The timeout is a fallback with a
 * deadline, not a schedule: prefetch that never happens is a step that stalls.
 */
function onIdle(run: () => void, timeout = 2000): IdleHandle {
  if (typeof window === "undefined") return { cancel: () => {} };

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout });
    return { cancel: () => window.cancelIdleCallback(id) };
  }
  const id = window.setTimeout(run, 200);
  return { cancel: () => window.clearTimeout(id) };
}

/**
 * Keep `index - 1`, `index` and `index + 1` warm and let everything else go, on idle time.
 *
 * Eviction starts at distance 2 rather than 3 because a wheel step moves exactly one panel
 * and a dot click can jump anywhere: there is no distance at which "it might be next" is
 * worth holding memory for, and the jump case is precisely what the per-model `<Suspense>`
 * boundary is there to absorb.
 *
 * Returns a canceller, so a fast run of steps schedules once per settled index instead of
 * once per step.
 */
export function prefetchNeighbours(index: number): IdleHandle {
  return onIdle(() => {
    preloadDiscipline(index - 1);
    preloadDiscipline(index + 1);
    DISCIPLINE_ORDER.forEach((_, position) => {
      if (Math.abs(position - index) > 1) releaseDiscipline(position);
    });
  });
}

/**
 * The first model, fetched before the section is anywhere near the fold.
 *
 * `rootMargin: "150%"` and not the component mount: a visitor scrolling fast must not
 * arrive at an empty box, and one and a half viewports of warning is roughly one screen of
 * scrolling - enough time for ~90 KB on any connection that was going to render this page
 * at all. Fires once, then disconnects.
 */
export function observeFirstModel(
  element: Element,
  index = 0
): { disconnect: () => void } {
  if (typeof IntersectionObserver === "undefined") {
    preloadDiscipline(index);
    return { disconnect: () => {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      preloadDiscipline(index);
      observer.disconnect();
    },
    { rootMargin: "150%" }
  );
  observer.observe(element);
  return { disconnect: () => observer.disconnect() };
}
