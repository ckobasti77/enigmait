"use client";

/**
 * The hero cube at emblem size - the navbar mark.
 *
 * Not a small copy: the geometry, the shader, the gradient and the camera all
 * come from `heroCube.core`, so the mark and the hero are one object seen twice.
 * Three things are its own:
 *
 *   angle   fixed, and set to the angle `logo-emblem.png` was drawn at, so the
 *           mark reads as the logo rather than as a second pose of the hero.
 *   framing the frustum is cropped to the mark's own silhouette, so the cube
 *           fills a 52px box instead of floating inside the hero's generous one.
 *   clock   draw -> erase -> draw, forever, with no travelling gap.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import clsx from "clsx";
import { NoToneMapping, SRGBColorSpace } from "three";
import type { Group, PerspectiveCamera, ShaderMaterial } from "three";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  HERO_CUBE_CAMERA_FOV,
  HERO_CUBE_CAMERA_POSITION,
  HeroCubeShape,
  createUniforms,
  hermite,
  measureProjectedBounds,
  rotationForAzimuth,
  smoothstep,
  useGradientCleanup,
  useHeroCubeGeometry,
} from "./heroCube.core";

/**
 * The angle `public/logos/logo-emblem.png` was drawn at, measured off that PNG:
 * rings were projected over a grid of angles and scored by silhouette IoU
 * against its alpha mask, and the optimum landed on 33 deg of azimuth and 22 deg
 * of elevation.
 *
 * The elevation needs no work - the hero camera already sits at
 * `asin(3.371 / 9) = 22.0 deg`, which is why the emblem and the hero cube looked
 * related in the first place. So the camera is left exactly where HERO_SPEC put
 * it and only the mesh is turned, which costs nothing and keeps the gradient
 * axis valid. For scale: the hero's own quarter turn reads as 19.5 deg, so the
 * mark is 13.5 deg further round.
 *
 * This is the one number to touch if the mark should sit differently.
 */
const EMBLEM_AZIMUTH = 33; // deg
const MARK_ROTATION_Y = rotationForAzimuth(EMBLEM_AZIMUTH);

/**
 * Breathing room around the cropped silhouette, as a share of it. The crop is
 * measured on vertex positions, and the tube is drawn with a width - without a
 * hair of slack the outermost corner loses its outer edge to the canvas border.
 */
const FIT_PADDING = 0.04;

// Draw and erase are the same length, and the draw is 0.58s against the hero's
// 1.35s - 2.3x faster. The emblem is small, permanent chrome in a fixed bar: it
// has to finish being interesting well before the eye gets to it.
const HOLD_DURATION = 0.42; // s, the finished mark holds
const ERASE_DURATION = 2; // s
const PAUSE_DURATION = 0.3; // s, empty
const DRAW_DURATION = 1; // s
const LOOP_DURATION =
  HOLD_DURATION + ERASE_DURATION + PAUSE_DURATION + DRAW_DURATION;

// Fast off the mark, soft landing on the finished shape - the exit slope is 0
// because this draw lands on a full stop, where the hero's hands over to a loop.
const DRAW_ENTRY_SLOPE = 1.7;

const NOOP = () => {};

const FULL = { head: 1, gap: 1 };
// A gap of 0 is not empty: `behind > uGap` is `0 > 0` for the vertices at
// `uv.x = 0`, so the one ring of the tube sitting on the path's seam survives as
// a speck. Anything negative discards every fragment.
const EMPTY = { head: 0, gap: -1 };

/**
 * Which stretch of the line is visible at `elapsed` seconds.
 *
 * The shader draws the arc `[uHead - uGap, uHead]`, so both halves of the loop
 * are the same gesture running the same way round the cube:
 *
 *   draw   head runs 0 -> 1 with the tail pinned at 0, and the line fills.
 *   erase  head parks at 1 and the tail runs 0 -> 1 after it, so the line is
 *          wiped from where it started, in the direction it was drawn.
 *
 * At every instant the whole remaining line is on screen. There is no short dash
 * chasing the shape - that is the hero's trick, and at 52px it would read as a
 * flicker rather than as a line.
 *
 * The cycle starts on `hold`, fully drawn, because the navbar cross-fades a
 * still of this same mark into it - see NavbarCubeMark. Starting on `draw` would
 * uncover an empty canvas.
 */
const markWindow = (elapsed: number) => {
  const t = elapsed % LOOP_DURATION;
  if (t < HOLD_DURATION) return FULL;

  const erasing = t - HOLD_DURATION;
  if (erasing < ERASE_DURATION) {
    return { head: 1, gap: 1 - smoothstep(erasing / ERASE_DURATION) };
  }

  const pausing = erasing - ERASE_DURATION;
  if (pausing < PAUSE_DURATION) return EMPTY;

  const head = hermite((pausing - PAUSE_DURATION) / DRAW_DURATION, DRAW_ENTRY_SLOPE, 0);
  return { head, gap: head };
};

function MarkMesh({
  staticFrame,
  onReady,
}: {
  staticFrame: boolean;
  onReady: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const elapsedRef = useRef(0);
  const readyRef = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  // R3F types the default camera as the base class; the Canvas below builds a
  // perspective one, and the frustum crop lives there.
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const aspect = useThree((state) => state.viewport.aspect);

  const geometry = useHeroCubeGeometry();
  // Without the baked arc length there is nothing to animate - fall back to the
  // finished frame rather than an empty box in the navbar.
  const frozen = staticFrame || !geometry?.getAttribute("uv");

  const uniforms = useMemo(() => createUniforms(MARK_ROTATION_Y), []);

  /**
   * Crops the frustum to the mark's silhouette, which is what "the canvas is the
   * size of the emblem" means in practice: the camera keeps HERO_SPEC's position
   * and field of view, and only the slice of it that gets rendered changes. The
   * hero uses the same call to slide its cube to the right edge; here the slice
   * is smaller than the full view, so it zooms as well as shifts.
   *
   * Camera placement, the measurement and the crop have to happen in this order
   * - `project()` reads the matrices the two lines above it write, and measuring
   * through an existing crop would measure the previous answer.
   */
  useEffect(() => {
    camera.position.set(...HERO_CUBE_CAMERA_POSITION);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // Before the canvas has been measured the aspect is 0 and the projection is
    // meaningless. The effect reruns with the real value.
    if (!geometry || !(aspect > 0)) return;

    const bounds = measureProjectedBounds(geometry, camera, MARK_ROTATION_Y);
    if (!bounds) return;

    // NDC spans -1..1 with y up; setViewOffset speaks fractions of the full view
    // with y down. One square slice for both axes - separate widths would stretch
    // the cube, and the emblem's box is square at every breakpoint anyway.
    const size =
      (Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) *
        (1 + FIT_PADDING)) /
      2;
    const centerX = (bounds.minX + bounds.maxX + 2) / 4;
    const centerY = (2 - bounds.minY - bounds.maxY) / 4;

    camera.setViewOffset(
      1,
      1,
      centerX - size / 2,
      centerY - size / 2,
      size,
      size
    );
    invalidate();

    return () => camera.clearViewOffset();
  }, [aspect, camera, geometry, invalidate]);

  useGradientCleanup(materialRef);

  useEffect(() => {
    const material = materialRef.current;
    if (!frozen || !material) return;
    material.uniforms.uHead.value = 1;
    material.uniforms.uGap.value = 1;
    invalidate();
  }, [frozen, invalidate]);

  // useFrame is the single time source, as in HeroCube. Nothing here touches
  // rotation: the angle is set once, in JSX and in the seeded gradient axis.
  useFrame((_, delta) => {
    if (!readyRef.current) {
      readyRef.current = true;
      // Scheduled, not called: this runs before R3F renders, and the navbar is
      // waiting for a frame that exists before it uncovers the canvas.
      requestAnimationFrame(onReady);
    }

    const material = materialRef.current;
    if (frozen || !material) return;
    elapsedRef.current += Math.min(delta, 0.05);
    const { head, gap } = markWindow(elapsedRef.current);
    material.uniforms.uHead.value = head;
    material.uniforms.uGap.value = gap;
  });

  if (!geometry) return null;

  return (
    <HeroCubeShape
      geometry={geometry}
      uniforms={uniforms}
      groupRef={groupRef}
      materialRef={materialRef}
      rotationY={MARK_ROTATION_Y}
    />
  );
}

export default function HeroCubeMark({
  className,
  onReady,
}: {
  className?: string;
  onReady?: () => void;
}) {
  // The bar is fixed, so this only ever goes off screen when the island peels -
  // and then the loop should stop, which it does for free.
  const { ref, isIntersecting } = useIntersectionActive<HTMLDivElement>({
    threshold: 0,
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setDocumentVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const animating = isIntersecting && documentVisible && !prefersReducedMotion;

  return (
    <div ref={ref} className={clsx("h-full w-full", className)}>
      <Canvas
        // "always" while on screen and visible; "demand" is the pause state, so
        // a backgrounded tab or a peeled navbar costs nothing.
        frameloop={animating ? "always" : "demand"}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: NoToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{
          position: HERO_CUBE_CAMERA_POSITION,
          fov: HERO_CUBE_CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
      >
        <Suspense fallback={null}>
          <MarkMesh
            staticFrame={prefersReducedMotion}
            onReady={onReady ?? NOOP}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
