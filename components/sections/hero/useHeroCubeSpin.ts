"use client";

/**
 * Grab-and-spin physics for the hero cube.
 *
 * The cube idles at one constant angular velocity about Y (`idleSpeed`, the same
 * slow turn it had before this existed). Grabbing it - and grabbing only works
 * when the ray hits the tube itself, because R3F fires `onPointerDown` off a real
 * intersection, so the gaps between the lines never catch - hands the angle over
 * to the pointer. Let go with a flick and the tracked pointer velocity becomes
 * the cube's: it spins on, then relaxes back to `idleSpeed` on an exponential,
 * so a hard throw whirls and settles instead of stopping dead or spinning forever.
 *
 * Only the sign of the throw is the user's; the axis is always Y, so the cube can
 * only be sent left or right, never tumbled - it comes to rest in the same steady
 * turn it started in.
 *
 * The hook owns the angle. `advance(delta)` integrates one frame of physics
 * (skipped while dragging, when the pointer owns the angle) and returns the angle
 * to hand straight to `applyRotation`.
 */

import { useCallback, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";

type Options = {
  /** The angle the cube rests at with no user input - CUBE_ROTATION_Y. */
  baseAngle: number;
  /** Baseline angular velocity (rad/s) the physics always relaxes back to. */
  idleSpeed: number;
  /** False while the cube is a frozen still (reduced motion): no interaction. */
  enabled: boolean;
};

// A drag across the full canvas width turns the cube this far. Tied to the canvas
// width, not raw pixels, so the feel is the same at every breakpoint.
const ROTATION_SPAN = Math.PI * 1.6; // rad
// Exponential relaxation of the extra velocity back to idle, in 1/s. Lower = the
// throw carries longer before it settles.
const DAMPING = 1.6;
// Ceiling on the launch velocity, so a violent flick whirls fast but not absurdly.
const MAX_THROW_SPEED = 16; // rad/s
// EMA weight on the newest pointer sample when tracking throw velocity. Higher
// follows the very last motion more closely - snappier flicks, more jitter.
const VELOCITY_SMOOTHING = 0.4;
// A release this long after the last motion reads as "stopped, then let go" - no
// throw. Without it, holding the cube still and lifting off flings it on stale
// velocity.
const RELEASE_IDLE_MS = 90;
// Flip to reverse which way a drag turns the cube.
const DRAG_DIRECTION = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function useHeroCubeSpin({ baseAngle, idleSpeed, enabled }: Options) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const angleRef = useRef(baseAngle);
  const velocityRef = useRef(idleSpeed);
  const draggingRef = useRef(false);
  const hoveringRef = useRef(false);
  // Last pointer x / timestamp, for turning motion into an angle and a velocity.
  const pointerXRef = useRef(0);
  const pointerTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  // Detaches the current drag's window listeners; set on down, cleared on up, and
  // called on unmount so a drag interrupted by a remount never leaks a listener.
  const teardownRef = useRef<(() => void) | null>(null);
  // The canvas element, copied out of the (compiler-immutable) `gl` into a plain
  // ref so setting its cursor is a local mutation the React Compiler allows.
  const canvasRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);

  const setCursor = useCallback((value: string) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = value;
  }, []);

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;
      // The ray hit the tube: this is a grab, not a click through to the page.
      event.stopPropagation();

      draggingRef.current = true;
      pointerXRef.current = event.nativeEvent.clientX;
      pointerTimeRef.current = event.nativeEvent.timeStamp;
      dragVelocityRef.current = 0;
      setCursor("grabbing");

      const move = (moveEvent: PointerEvent) => {
        if (!draggingRef.current) return;
        // Keep a cube-drag from scrolling the page under it (touch / trackpad).
        moveEvent.preventDefault();

        const width = gl.domElement.clientWidth || 1;
        const sensitivity = ROTATION_SPAN / width;
        const dx = moveEvent.clientX - pointerXRef.current;
        const dAngle = dx * sensitivity * DRAG_DIRECTION;
        angleRef.current += dAngle;

        const dt = (moveEvent.timeStamp - pointerTimeRef.current) / 1000;
        if (dt > 0) {
          const instantaneous = dAngle / dt;
          dragVelocityRef.current +=
            (instantaneous - dragVelocityRef.current) * VELOCITY_SMOOTHING;
        }

        pointerXRef.current = moveEvent.clientX;
        pointerTimeRef.current = moveEvent.timeStamp;
        // In demand frameloop (off-screen edge cases) this still lands a frame.
        invalidate();
      };

      const finish = (endEvent: PointerEvent) => {
        draggingRef.current = false;
        const idleMs = endEvent.timeStamp - pointerTimeRef.current;
        // Released after a pause -> the cube was parked, so let it just resume idle.
        const thrown = idleMs > RELEASE_IDLE_MS ? 0 : dragVelocityRef.current;
        velocityRef.current = clamp(thrown, -MAX_THROW_SPEED, MAX_THROW_SPEED);
        setCursor(hoveringRef.current ? "grab" : "");
        teardownRef.current?.();
      };

      const detach = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        teardownRef.current = null;
      };
      teardownRef.current = detach;

      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    },
    [enabled, gl, invalidate, setCursor]
  );

  const onPointerOver = useCallback(() => {
    hoveringRef.current = true;
    if (enabled && !draggingRef.current) setCursor("grab");
  }, [enabled, setCursor]);

  const onPointerOut = useCallback(() => {
    hoveringRef.current = false;
    if (!draggingRef.current) setCursor("");
  }, [setCursor]);

  /** One frame of physics. Returns the angle to feed straight to applyRotation. */
  const advance = useCallback(
    (delta: number) => {
      if (!draggingRef.current) {
        // Exact exponential approach to idleSpeed, framerate-independent: the
        // *extra* velocity decays, so a throw eases back to the steady turn.
        const k = 1 - Math.exp(-DAMPING * delta);
        velocityRef.current += (idleSpeed - velocityRef.current) * k;
        angleRef.current += velocityRef.current * delta;
      }
      return angleRef.current;
    },
    [idleSpeed]
  );

  useEffect(
    () => () => {
      teardownRef.current?.();
      // The cursor lives on the shared canvas element; leave it as we found it.
      setCursor("");
    },
    [setCursor]
  );

  return { onPointerDown, onPointerOver, onPointerOut, advance };
}
