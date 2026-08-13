"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import clsx from "clsx";
import { NoToneMapping, SRGBColorSpace, Vector3 } from "three";
import type { BufferGeometry, Group, PerspectiveCamera, ShaderMaterial } from "three";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  HERO_CUBE_CAMERA_FOV,
  HERO_CUBE_CAMERA_POSITION,
  HeroCubeShape,
  Y_AXIS,
  applyRotation,
  createUniforms,
  hermite,
  smoothstep,
  useGradientCleanup,
  useHeroCubeGeometry,
} from "./heroCube.core";
import { HERO_REVEAL_DURATION } from "./heroTiming";

// Quarter turn on top of the logo angle. The camera stays exactly where the spec put it -
// turning the mesh leaves the projection untouched and only changes which faces point at
// us. Negate to swing it the other way.
const CUBE_ROTATION_Y = -Math.PI / 4;

// The line draws itself once, on the hero's shared clock, so it lands with the
// last word of the headline instead of running on its own schedule.
const REVEAL_DURATION = HERO_REVEAL_DURATION;
const LOOP_LAP = 5.3; // s per lap of the travelling gap
const HANDOFF_DURATION = 1.4; // s - the gap opens from "fully drawn" to its loop size
const MISSING_ARC = 0.05; // the only stretch left undrawn, in normalised path length
const VISIBLE_ARC = 1 - MISSING_ARC;
const LOOP_SPEED = 1 / LOOP_LAP;
// One slow turn about Y, at constant speed. Pinned to a whole number of gap laps so the
// hero as a whole is exactly periodic (6 x 5.3 = 31.8 s) instead of drifting between two
// unrelated cycles.
const SPIN_LAPS_PER_TURN = 6;
const SPIN_SPEED = (2 * Math.PI) / (LOOP_LAP * SPIN_LAPS_PER_TURN);
// Cubic Hermite for the reveal. The exit slope is pinned to the loop speed so the head
// never changes pace at the hand-off; the entry slope is a gentle ease-in.
const REVEAL_ENTRY_SLOPE = 0.6;
const REVEAL_EXIT_SLOPE = REVEAL_DURATION * LOOP_SPEED;

// The mark ends on the canvas's right edge, which from `lg` up is the site container's
// edge - the same line the navbar and every section end on. Below `lg` the canvas is a
// centred block above the copy, where pushing the mark to one side would only read as a
// mistake, so the alignment is tied to the `lg:` prefixes in Hero.tsx.
const EDGE_ALIGN_QUERY = "(min-width: 1024px)";
// Spin angles sampled to find the widest silhouette. The offset is static and taken from
// that widest moment, so the mark meets the line four times per turn and never crosses
// it; re-measuring per frame would hold it flush but slide the whole cube sideways as it
// turns, which reads as drift rather than as alignment.
const EDGE_ALIGN_SAMPLES = 96;
// Held off the line by a hair. The measurement is taken on the bounding box, so a corner
// landing exactly on the last pixel column would lose it to antialiasing.
const EDGE_ALIGN_INSET = 0.006; // NDC

const revealProgress = (x: number) =>
  hermite(x, REVEAL_ENTRY_SLOPE, REVEAL_EXIT_SLOPE);

/**
 * Head position and visible arc length at `elapsed` seconds.
 *
 * Phase 1  the tail stays pinned at 0 while the head runs to 1, so the line fills.
 * Phase 2  the head keeps sliding at loop speed while the gap eases 1 -> VISIBLE_ARC,
 *          i.e. the tail lifts off just behind the head. Both quantities are continuous
 *          across the seam.
 * Phase 3  head slides forever, gap constant. The cube then reads as fully drawn, with
 *          a single short undrawn stretch travelling around it. The path is closed and
 *          `t` is true arc length, so wrapping the head at 1 is all the loop needs.
 */
const pathWindow = (elapsed: number) => {
  if (elapsed < REVEAL_DURATION) {
    const head = revealProgress(elapsed / REVEAL_DURATION);
    return { head, gap: head };
  }

  const sinceReveal = elapsed - REVEAL_DURATION;
  const distance = 1 + sinceReveal * LOOP_SPEED;
  const handoff = Math.min(sinceReveal / HANDOFF_DURATION, 1);
  return {
    head: distance - Math.floor(distance),
    gap: 1 + (VISIBLE_ARC - 1) * smoothstep(handoff),
  };
};

/**
 * Rightmost point the mark reaches on screen, in NDC, over `samples` evenly spaced spin
 * angles. Eight bounding-box corners per sample are enough: the model is a cube frame, so
 * its corners are exactly the points that decide the silhouette's width.
 */
const measureRightEdge = (
  geometry: BufferGeometry,
  camera: PerspectiveCamera,
  scale: number,
  samples: number
) => {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return null;

  const point = new Vector3();
  let rightmost = -Infinity;

  for (let sample = 0; sample < samples; sample += 1) {
    const rotationY = CUBE_ROTATION_Y + (sample / samples) * Math.PI * 2;
    for (let corner = 0; corner < 8; corner += 1) {
      point
        .set(
          corner & 1 ? box.max.x : box.min.x,
          corner & 2 ? box.max.y : box.min.y,
          corner & 4 ? box.max.z : box.min.z
        )
        .multiplyScalar(scale)
        .applyAxisAngle(Y_AXIS, rotationY)
        .project(camera);
      rightmost = Math.max(rightmost, point.x);
    }
  }

  return rightmost;
};

function CubeMesh({
  staticFrame,
  alignToEdge,
}: {
  staticFrame: boolean;
  alignToEdge: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const elapsedRef = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  // R3F types the default camera as the base class; the Canvas below builds a
  // perspective one, and the frustum offset used for the edge alignment lives there.
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const aspect = useThree((state) => state.viewport.aspect);
  const scale = Math.min(1, aspect);

  const geometry = useHeroCubeGeometry();
  // Without the baked arc length there is nothing to animate - fall back to the finished
  // frame rather than an empty canvas.
  const frozen = staticFrame || !geometry?.getAttribute("uv");

  const uniforms = useMemo(() => createUniforms(CUBE_ROTATION_Y), []);

  useEffect(() => {
    camera.position.set(...HERO_CUBE_CAMERA_POSITION);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  }, [camera]);

  // Slides the mark over to the canvas's right edge by shifting the frustum, not the
  // mesh: the camera stays exactly where HERO_SPEC put it, so the projection - and with
  // it the gradient axis measured off the logo - is untouched. Offsets are expressed as
  // fractions of a 1x1 view, which is what keeps the shift proportional when R3F rebuilds
  // the projection matrix on resize.
  useEffect(() => {
    camera.clearViewOffset();
    // Before the canvas has been measured the aspect is 0, and a scale of 0 would
    // collapse the mark to a point and hand back a meaningless offset. The effect reruns
    // with the real value.
    if (!alignToEdge || !geometry || !(scale > 0)) return;

    const rightmost = measureRightEdge(
      geometry,
      camera,
      scale,
      // The still frame never spins, so it aligns on the one angle it actually shows.
      frozen ? 1 : EDGE_ALIGN_SAMPLES
    );
    if (rightmost === null) return;

    // NDC spans 2 across the canvas, so half the distance left over is the shift as a
    // fraction of the canvas width.
    camera.setViewOffset(
      1,
      1,
      -(1 - EDGE_ALIGN_INSET - rightmost) / 2,
      0,
      1,
      1
    );
    invalidate();

    return () => camera.clearViewOffset();
  }, [alignToEdge, camera, frozen, geometry, invalidate, scale]);

  useGradientCleanup(materialRef);

  useEffect(() => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (!frozen || !group || !material) return;
    material.uniforms.uHead.value = 1;
    material.uniforms.uGap.value = 1;
    applyRotation(group, material, CUBE_ROTATION_Y);
    invalidate();
  }, [frozen, invalidate]);

  // useFrame is the single time source. R3F already owns a rAF loop, so adding a GSAP
  // timeline on top would mean two schedulers driving one set of uniforms.
  useFrame((_, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (frozen || !group || !material) return;
    elapsedRef.current += Math.min(delta, 0.05);
    const { head, gap } = pathWindow(elapsedRef.current);
    material.uniforms.uHead.value = head;
    material.uniforms.uGap.value = gap;
    applyRotation(
      group,
      material,
      CUBE_ROTATION_Y + elapsedRef.current * SPIN_SPEED
    );
  });

  if (!geometry) return null;

  return (
    <HeroCubeShape
      geometry={geometry}
      uniforms={uniforms}
      groupRef={groupRef}
      materialRef={materialRef}
      rotationY={CUBE_ROTATION_Y}
      scale={scale}
    />
  );
}

export default function HeroCube({ className }: { className?: string }) {
  const { ref, isIntersecting } = useIntersectionActive<HTMLDivElement>({
    threshold: 0,
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const alignToEdge = useMediaQuery(EDGE_ALIGN_QUERY);
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setDocumentVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const animating =
    isIntersecting && documentVisible && !prefersReducedMotion;

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Enigma Digital mark drawn as one continuous line"
      className={clsx("relative aspect-square w-full", className)}
    >
      <Canvas
        // "always" while on screen and visible; "demand" is the pause state, so an
        // off-screen or backgrounded hero costs nothing.
        frameloop={animating ? "always" : "demand"}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          // Blender's scene is on the Standard view transform; NoToneMapping is its
          // web equivalent, so the approved render and the page agree.
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
          <CubeMesh
            staticFrame={prefersReducedMotion}
            alignToEdge={alignToEdge}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
