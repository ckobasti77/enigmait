"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import type { Material, Mesh, Object3D, Texture } from "three";

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
 * - The lens's own `screenImage`. `seo-geo`'s second primitive is glass with no UVs, so
 *   there is nothing to map onto it and that field is never read. Prefetching it would
 *   spend a slot on a texture nothing samples. Its `backdropImage` IS fetched - that one is
 *   real geometry standing behind the glass, and it is the content of the model.
 * - Anything that runs during render. Every call below is scheduled from an effect, on
 *   idle, so a step never pays for the step after it.
 */

const inFlight = new Set<string>();

/**
 * WHAT IS ACTUALLY ON THE GPU, AND WHY A CACHE CLEAR IS NOT ENOUGH.
 *
 * `useGLTF.clear(url)` and `useTexture.clear(url)` drop drei's CACHE ENTRY. They do not touch
 * the objects that entry pointed at, and those objects hold the GPU allocation: a
 * `BufferGeometry` keeps its buffers until something calls `.dispose()`, and so does a
 * `Texture`. So an evict-then-reload cycle used to parse a second copy of the same GLB and
 * upload it alongside the first, forever.
 *
 * Measured before this: walking all six forwards and back, `renderer.info.memory.geometries`
 * went 21 -> 37 -> 53 -> 69 over four laps, +16 a lap, with textures climbing alongside. It
 * never plateaued, which is the definition of a leak rather than a working set.
 *
 * These two maps are the missing half. The model component registers what it was handed the
 * moment it has it, and `releaseDiscipline` disposes that before clearing the cache entry -
 * so a reload really is a reload and not an accumulation.
 *
 * Registration is idempotent and keyed by URL, because drei hands every consumer of the same
 * URL the same object.
 */
const loadedScenes = new Map<string, Object3D>();
const loadedTextures = new Map<string, Texture>();

/** Called by `DisciplineModel` with the scene drei just handed it. */
export function registerModelScene(url: string, scene: Object3D) {
  loadedScenes.set(url, scene);
}

/** Called by the screen primitive with the texture drei just handed it. */
export function registerScreenTexture(url: string, texture: Texture) {
  loadedTextures.set(url, texture);
}

/**
 * Free one GLB's GPU allocation.
 *
 * The geometries are the point. The materials on the scene's own meshes are the ones
 * `GLTFLoader` built for the file's (empty) material slots - the section never renders them,
 * it renders `nodes[...].geometry` under the shared materials from `materials.ts` - but they
 * are owned by this file's loader and nobody else will ever free them.
 *
 * The shared materials are deliberately NOT touched: they outlive every model, they are
 * cached per theme, and disposing one here would take the casing off whichever model is on
 * screen.
 */
function disposeScene(url: string) {
  const scene = loadedScenes.get(url);
  if (!scene) return;
  loadedScenes.delete(url);

  scene.traverse((object) => {
    const mesh = object as Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material as Material | Material[] | undefined;
    if (Array.isArray(material)) material.forEach((one) => one?.dispose?.());
    else material?.dispose?.();
  });
}

function disposeTexture(url: string) {
  const texture = loadedTextures.get(url);
  if (!texture) return;
  loadedTextures.delete(url);
  texture.dispose();
}

const modelUrl = (index: number) =>
  disciplines[DISCIPLINE_ORDER[index]].modelPath;

/**
 * Every texture one discipline needs - which is at most one, and for the magnifier is a
 * different one than for the other five.
 *
 * Five models carry a screen image mapped onto an authored primitive. `seo-geo` carries none
 * (its second primitive is glass with no UVs) and instead carries the logo atlas that stands
 * BEHIND that glass. Both cases are one texture, so they go through one list and the prefetch
 * and eviction below stay indifferent to which kind a model has.
 */
const textureUrls = (index: number): string[] => {
  const discipline = disciplines[DISCIPLINE_ORDER[index]];
  const urls: string[] = [];
  if (discipline.screenKind !== "lens") urls.push(discipline.screenImage);
  if (discipline.backdropImage) urls.push(discipline.backdropImage);
  return urls;
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

  for (const texture of textureUrls(index)) {
    if (inFlight.has(texture)) continue;
    inFlight.add(texture);
    useTexture.preload(texture);
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
  if (inFlight.delete(model)) {
    // Dispose FIRST, clear second. The cache entry is the only remaining handle on the
    // objects that hold the GPU allocation; drop it first and they are unreachable and
    // uploaded forever.
    disposeScene(model);
    useGLTF.clear(model);
  }

  // Five of the six screens share one placeholder image today. Clearing it because one
  // model walked out of range would take it out from under the model still using it, so a
  // URL still claimed by an in-range discipline is left alone.
  for (const texture of textureUrls(index)) {
    if (urlStillNeeded(texture, index)) continue;
    if (!inFlight.delete(texture)) continue;
    disposeTexture(texture);
    useTexture.clear(texture);
  }
}

const urlStillNeeded = (url: string, exceptIndex: number) =>
  DISCIPLINE_ORDER.some((_, position) => {
    if (position === exceptIndex) return false;
    return textureUrls(position).includes(url);
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
 * Eviction starts at distance 2 rather than 3 because a step moves exactly one panel and a
 * dot click can jump anywhere: there is no distance at which "it might be next" is worth
 * holding memory for, and the jump case is precisely what the per-model `<Suspense>`
 * boundary is there to absorb.
 *
 * BOTH DISTANCES ARE CIRCULAR, because the slider wraps. The neighbours of the first
 * discipline are the second and the LAST one, and the last one is exactly what a step back
 * from index 0 now lands on - measured linearly it would be five slots away, evicted, and
 * fetched again from cold on the one step most likely to be taken.
 *
 * Returns a canceller, so a fast run of steps schedules once per settled index instead of
 * once per step.
 */
export function prefetchNeighbours(index: number): IdleHandle {
  return onIdle(() => {
    const length = DISCIPLINE_ORDER.length;
    const wrap = (value: number) => ((value % length) + length) % length;

    preloadDiscipline(wrap(index - 1));
    preloadDiscipline(wrap(index + 1));

    DISCIPLINE_ORDER.forEach((_, position) => {
      const gap = Math.abs(position - index);
      if (Math.min(gap, length - gap) > 1) releaseDiscipline(position);
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
