"use client";

import { useSyncExternalStore } from "react";

/**
 * Can this browser actually give us a WebGL context?
 *
 * There is no feature flag for this and no hook in the repo for it, so it is written here.
 * The question is not "does the API exist" - `WebGLRenderingContext` is defined on browsers
 * that will still hand back `null` when asked for a context, which is exactly what happens
 * behind Chrome's `--disable-webgl` flag, on a blocklisted GPU, and inside a hardened
 * browser profile. The only honest test is to ask for a context and see what comes back.
 *
 * Two details that are not decoration:
 *
 * - **The probe canvas is thrown away, and its context with it.** Browsers cap live WebGL
 *   contexts (16 or so, and the oldest is killed to make room). A probe that leaks its
 *   context is a probe that can evict the context the section is about to want, so
 *   `WEBGL_lose_context` is called before the canvas goes out of scope.
 * - **`webgl2` first, then `webgl`.** three.js r184 asks for WebGL2 and has no WebGL1 path
 *   any more, so a browser that only offers WebGL1 must be answered "no" - otherwise the
 *   detector says yes and the Canvas mounts into a black rectangle, which is the one thing
 *   the fallback exists to prevent.
 */
export function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return false;

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    // A SecurityError (canvas blocked by a privacy extension) is a "no", not a crash.
    return false;
  }
}

/**
 * The probe is run once per document and remembered. Creating and losing a context is cheap
 * but not free, and the answer cannot change while the page is open.
 */
let cached: boolean | null = null;

const readSupport = () => {
  if (cached === null) cached = detectWebGL();
  return cached;
};

/** Nothing to subscribe to - the answer is a constant once it is known. */
const subscribe = () => () => {};

/** The server has no canvas to ask, so it answers "not known yet" and so does hydration. */
const readServerSupport = () => null;

/**
 * `null` until the answer is known, which is every render on the server and the hydrating
 * one on the client.
 *
 * `useSyncExternalStore` rather than state written from an effect: this is a fact about the
 * environment being read into React, which is what the hook is for, and it is the shape
 * that keeps the server render and the hydration render identical without a `useEffect`
 * that fires a second render pass on every visitor.
 *
 * Deliberately not `true`-by-default: rendering a `<Canvas>` optimistically and swapping it
 * for a still one tick later means mounting a renderer we may be about to throw away, and
 * on the machines that fail this test that is the most expensive thing on the page. The
 * caller reserves the box with `aspect-ratio` either way, so the one commit spent not
 * knowing costs no layout shift - only an empty box that was already going to be empty.
 */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(subscribe, readSupport, readServerSupport);
}
