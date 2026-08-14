/**
 * ONE pointer for the whole strip.
 *
 * The turning a model does is the SECTION answering the cursor, not anything a model owns - so
 * the target the cursor sets and the lerped value the models apply both live here, once,
 * instead of once per model.
 *
 * The bug this fixes: each model used to hold its own target/current, initialised to the rest
 * pose. A slide mounts a fresh incoming model, so it appeared square-on and only caught the
 * cursor on the next `pointermove` - a snap back to rest, then a re-follow, on the exact frame
 * a step began. Sharing the numbers means the incoming model is already turned to match the
 * moment it renders, and the outgoing one it replaces reads the identical value, so the
 * handover is invisible.
 *
 * The two axes are measured against different boxes, and that is not an oversight - see
 * `disciplinesTiming.ts` for the why. `x` is 0..1 across the WINDOW (yaw): far-left cursor is
 * the rest pose, far-right is fully turned. `y` is -1..1 about the CANVAS centre (pitch),
 * because the tilt reacts to where the cursor sits relative to the model, which travels up the
 * screen as the page scrolls. `x` starts at 0 so with no cursor - first paint, touch, a
 * pointer that never enters - the models rest exactly where the far-left cursor would put them.
 */

const FINE_POINTER_QUERY = "(pointer: fine)";

const target = { x: 0, y: 0 };
const current = { x: 0, y: 0 };

let advanceStamp = -1;
let refCount = 0;
let teardown: (() => void) | null = null;

function attach(canvas: HTMLCanvasElement): () => void {
  // The rect is cached and refreshed on scroll and resize rather than measured inside the
  // move handler, so a pointer move never forces layout.
  let rect = canvas.getBoundingClientRect();
  const measure = () => {
    rect = canvas.getBoundingClientRect();
  };

  const onPointerMove = (event: PointerEvent) => {
    const width = window.innerWidth;
    if (width === 0 || rect.height === 0) return;
    const x = event.clientX / width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    target.x = Math.min(1, Math.max(0, x));
    target.y = Math.min(1, Math.max(-1, y));
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);
  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", measure);
    window.removeEventListener("resize", measure);
  };
}

/**
 * Attach the cursor listener once, however many models are on the strip (two mid-slide), and
 * detach it when the last leaves. Coarse pointers never attach, so `target` stays at the rest
 * pose and every model sits square-on - the intended no-cursor state. A raw `window` listener,
 * no R3F event and no raycast: nothing is picked, and the cursor has to be tracked even where
 * `pointer-events` is off. Returns the release for the caller's effect cleanup.
 */
export function acquirePointerRotation(canvas: HTMLCanvasElement): () => void {
  if (typeof window === "undefined") return () => {};
  if (!window.matchMedia(FINE_POINTER_QUERY).matches) return () => {};

  if (refCount === 0) teardown = attach(canvas);
  refCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    refCount -= 1;
    if (refCount === 0) {
      teardown?.();
      teardown = null;
    }
  };
}

/**
 * Advance the lerp once per frame and hand back the shared current.
 *
 * `stamp` is the frame's clock time, identical for every `useFrame` callback in a frame, so
 * the two models drawn during a slide advance the value once between them and then read the
 * same result - no double step, no split between the outgoing and the incoming model. The
 * returned object is the live singleton: read `.x`/`.y`, do not hold on to it.
 */
export function samplePointerRotation(
  stamp: number,
  lerp: number
): { x: number; y: number } {
  if (stamp !== advanceStamp) {
    advanceStamp = stamp;
    current.x += (target.x - current.x) * lerp;
    current.y += (target.y - current.y) * lerp;
  }
  return current;
}
