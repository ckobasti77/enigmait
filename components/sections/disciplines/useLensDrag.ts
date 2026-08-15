"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Group, Mesh } from "three";

/**
 * PICKING THE MAGNIFIER UP BY ITS HANDLE.
 *
 * The lens already answers the cursor by turning; this lets it be carried. The two do not
 * fight because they write different objects: the pointer rotation owns the MODEL group's
 * rotation and float, and this owns the position of a group wrapping it. One writer per value,
 * which is the rule the section is built on.
 *
 * The cards deliberately stay behind. Dragging moves the glass across a fixed backdrop, so the
 * magnified circle sweeps over Google, ChatGPT and Claude in turn - the same illusion the
 * pointer turn produces, under direct control.
 */

/**
 * Where the body stops being the ring and starts being the handle, in object space.
 *
 * A threshold rather than a collider mesh, and it can be this crude because of how the model is
 * built: the bezel bottoms out around y = -0.04 and everything below that is grip. So one
 * comparison replaces an invisible capsule that would have to be re-measured every time the
 * model is re-exported.
 */
export const DRAG_HANDLE_MAX_Y = -0.05;

/**
 * How far the model may travel, as a fraction of the half-extent the camera actually sees at
 * the model's depth. Derived rather than absolute so the reach is the same on a phone-width
 * canvas as on a wide one.
 *
 * Tuned against the render, not guessed: at this value the glass arrives at the frame edge
 * still whole, which is what "as far as the edge" has to mean for a magnifier - the disc is the
 * thing being carried, and a bound that lets it leave the frame before the rubber band engages
 * just loses it. The handle passing off-frame is fine; the lens going with it is not.
 */
export const DRAG_REACH = 0.45;

/**
 * What is left of your movement once you are past the edge - about a twentieth of it.
 *
 * This is the whole feel of the thing. It does not stop, because a hard stop reads as a bug in
 * the drag; it goes heavy, so the edge is something you can feel through the cursor and lean
 * against. A few percent is enough to let the model peek over the boundary and no more.
 */
export const DRAG_OVERSHOOT = 0.06;

/**
 * The rubber band. Inside the range, movement is one to one; outside, the excess is scaled
 * down but never discarded, so pulling further always does something and letting go the other
 * way tracks straight back. Applied to the RAW accumulated travel rather than to the clamped
 * result, which is what keeps the return trip from lagging by however far you overshot.
 *
 * The range is given as two ENDS rather than one symmetric bound, because the thing being kept
 * on screen is not centred in the thing being dragged: the glass sits high and to the left of
 * the model's origin, so it runs out of room upward long before it runs out downward. A
 * symmetric bound let the lens leave the top of the frame while the handle still had travel.
 */
export function softClamp(
  value: number,
  min: number,
  max: number,
  overshoot: number
) {
  if (value > max) return max + (value - max) * overshoot;
  if (value < min) return min + (value - min) * overshoot;
  return value;
}

const FINE_POINTER_QUERY = "(pointer: fine)";

/**
 * Module scope, for the same reason `prepareScreenTexture` is: the React Compiler will not let
 * a component write through a value a hook handed it, and the canvas arrives from `useThree`.
 * The write is real and intended - the cursor is how a grab affordance is expressed - so it is
 * moved somewhere the rule is not protecting anything.
 */
function writeCursor(canvas: HTMLCanvasElement, value: string) {
  canvas.style.cursor = value;
}

type LensDrag = {
  onPointerDown: (event: { nativeEvent: PointerEvent; point: Vector3 }) => void;
  onPointerMove: (event: { point: Vector3 }) => void;
  onPointerOut: () => void;
  /** True once the visitor has actually carried it, so the hint can retire for good. */
  dragged: boolean;
};

/**
 * The two refs are OWNED BY THE CALLER and passed in, rather than created here and handed back.
 * Returning them would mean reading `drag.dragRef` inside JSX, which the React Compiler counts
 * as touching a ref during render and rejects. Taking them as arguments keeps the attachment
 * site (`ref={dragRef}`) identical in shape to every other ref in the component.
 */
export function useLensDrag(
  enabled: boolean,
  dragRef: React.RefObject<Group | null>,
  bodyRef: React.RefObject<Mesh | null>,
  /** Where the glass sits inside the model, and how big it is - both already world-scaled. */
  lensOffset: Vector3,
  lensRadius: number
): LensDrag {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const [dragged, setDragged] = useState(false);
  const overHandle = useRef(false);
  const dragging = useRef(false);
  /** Accumulated, UNCLAMPED travel. The soft clamp is applied on the way out, never stored. */
  const raw = useRef({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, rawX: 0, rawY: 0 });

  /**
   * Screen pixels to world units at the model's depth, plus the two screen-aligned axes.
   *
   * The camera sits off to one side, so world +X is not screen right - dragging along it would
   * send the model away from the cursor and into the distance. Taking the basis out of the
   * camera's own matrix makes the model follow the hand exactly, whatever the camera is doing.
   */
  const frame = useMemo(() => {
    const distance = camera.position.length();
    const fov = "fov" in camera ? (camera.fov as number) : 30;
    const visibleHeight = 2 * distance * Math.tan((fov * Math.PI) / 360);
    const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const aspect = size.width / Math.max(1, size.height);

    /**
     * The travel is worked out from where the GLASS may end up, not from the model's origin.
     * Its offset is projected onto the two screen axes, and the room left on each side is the
     * half-frame less the lens radius less however far the lens already sits that way. `REACH`
     * then keeps a margin off the true edge so the disc arrives at the boundary whole.
     */
    const halfH = visibleHeight / 2;
    const halfW = halfH * aspect;
    const offsetRight = lensOffset.dot(right);
    const offsetUp = lensOffset.dot(up);
    const roomX = Math.max(0, halfW - lensRadius) * DRAG_REACH * 2;
    const roomY = Math.max(0, halfH - lensRadius) * DRAG_REACH * 2;

    return {
      right,
      up,
      unitsPerPixel: visibleHeight / Math.max(1, size.height),
      minX: -roomX - offsetRight,
      maxX: roomX - offsetRight,
      minY: -roomY - offsetUp,
      maxY: roomY - offsetUp,
    };
  }, [camera, size, lensOffset, lensRadius]);

  const apply = useCallback(() => {
    const group = dragRef.current;
    if (!group) return;
    const x = softClamp(raw.current.x, frame.minX, frame.maxX, DRAG_OVERSHOOT);
    const y = softClamp(raw.current.y, frame.minY, frame.maxY, DRAG_OVERSHOOT);
    group.position
      .set(0, 0, 0)
      .addScaledVector(frame.right, x)
      .addScaledVector(frame.up, y);
  }, [frame, dragRef]);

  const setCursor = useCallback(
    (value: string) => {
      writeCursor(gl.domElement, value);
    },
    [gl]
  );

  /** Hover: only the handle offers itself, and only where there is a real cursor to change. */
  const onPointerMove = useCallback(
    (event: { point: Vector3 }) => {
      if (!enabled || dragging.current) return;
      const body = bodyRef.current;
      if (!body) return;
      const local = body.worldToLocal(event.point.clone());
      const over = local.y < DRAG_HANDLE_MAX_Y;
      if (over === overHandle.current) return;
      overHandle.current = over;
      setCursor(over ? "grab" : "auto");
    },
    [enabled, setCursor, bodyRef]
  );

  const onPointerOut = useCallback(() => {
    if (dragging.current) return;
    overHandle.current = false;
    setCursor("auto");
  }, [setCursor]);

  const onPointerDown = useCallback(
    (event: { nativeEvent: PointerEvent; point: Vector3 }) => {
      if (!enabled) return;
      const body = bodyRef.current;
      if (!body) return;
      const local = body.worldToLocal(event.point.clone());
      if (local.y >= DRAG_HANDLE_MAX_Y) return;

      dragging.current = true;
      setDragged(true);
      setCursor("grabbing");
      start.current = {
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
        rawX: raw.current.x,
        rawY: raw.current.y,
      };
      // Stop the press from also reaching the page - on the homepage the same column carries
      // the wheel capture and the swipe, and a drag is not either of those.
      //
      // NO `preventDefault` here. R3F registers its pointer listeners as passive, so calling it
      // throws "Unable to preventDefault inside passive event listener invocation" on every
      // grab. Nothing needs cancelling anyway: the canvas holds no text to select and no
      // default gesture to suppress.
      event.nativeEvent.stopPropagation();
    },
    [enabled, setCursor, bodyRef]
  );

  /**
   * Move and release live on the WINDOW, not on the mesh. Once the grab has started the cursor
   * routinely leaves the model - that is the whole point of carrying it - and a listener on the
   * geometry would drop the drag the moment it did.
   */
  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      raw.current.x = start.current.rawX + dx * frame.unitsPerPixel;
      // Screen y grows downward and world up does not.
      raw.current.y = start.current.rawY - dy * frame.unitsPerPixel;
      apply();
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setCursor(overHandle.current ? "grab" : "auto");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [enabled, frame, apply, setCursor]);

  // The canvas outlives this model on the reel, so a cursor set here has to be handed back.
  useEffect(() => {
    const canvas = gl.domElement;
    return () => writeCursor(canvas, "auto");
  }, [gl]);

  // A resize changes how many world units a pixel is worth; re-apply so the model does not
  // jump to a stale position the next time it is touched.
  useEffect(() => apply(), [apply]);

  return { onPointerDown, onPointerMove, onPointerOut, dragged };
}

/** Drag is a desktop affordance: on touch the vertical gesture is the page's scroll. */
export function supportsLensDrag() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}
