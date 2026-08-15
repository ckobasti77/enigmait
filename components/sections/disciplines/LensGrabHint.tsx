"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { MeshBasicMaterial, SRGBColorSpace, Vector3 } from "three";
import type { Mesh, Texture } from "three";

/**
 * THE HAND THAT OFFERS THE HANDLE.
 *
 * The magnifier can be picked up, and nothing about a rendered object says so. The cursor
 * changes, but only once you are already over the grip - which is no help to the visitor who
 * never thought to go there. So the affordance says it out loud, on a clock, to whoever has
 * stopped long enough to see it.
 *
 * It is 3D rather than DOM on purpose. The handle moves - it turns with the cursor and travels
 * when carried - so a hint pinned to the viewport would drift off the thing it is pointing at.
 * Sitting in the scene beside the grip, it is correct by construction and needs no projection
 * maths. It also stays clear of the site-wide text reveal, which only ever sees the DOM.
 */

/** Every six seconds, as asked. */
const HINT_PERIOD = 6;
/** How long one appearance lasts, fades included. */
const HINT_VISIBLE = 2.4;
const HINT_FADE = 0.36;

/**
 * Where it stands, in the GLB's object space: off the right flank of the grip, a little above
 * the midpoint of the knurl. Pushed forward in Z so it never disappears into the handle it is
 * describing.
 */
const HINT_POSITION = new Vector3(0.63, -0.36, 0.3);
const HINT_SCALE = 0.52;

/** How far it jabs toward the handle, and how many times per appearance. */
const HINT_NUDGE = 0.075;
const HINT_JABS = 2;

/**
 * Module scope for the same reason the cursor write is: the React Compiler will not let a
 * component mutate a value it passed to a hook, and this runs every frame on a memoised
 * material.
 */
function writeOpacity(material: MeshBasicMaterial, value: number) {
  material.opacity = value;
  material.visible = value > 0.001;
}

/** Same laundering, for the one property the texture needs set before it is sampled. */
function prepareHintTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Fade up, hold, fade down - and zero for the long gap between appearances. Written as a plain
 * function of the phase rather than a tween so there is no timeline to keep in step with the
 * frame loop, and so a parked section that stops rendering resumes mid-cycle without a jump.
 */
function envelope(phase: number) {
  if (phase >= HINT_VISIBLE) return 0;
  if (phase < HINT_FADE) return phase / HINT_FADE;
  const out = HINT_VISIBLE - HINT_FADE;
  if (phase > out) return (HINT_VISIBLE - phase) / HINT_FADE;
  return 1;
}

type LensGrabHintProps = {
  /** Object-space scale of the model, so the hint lands beside the real handle. */
  displayScale: number;
  /** Off the moment the visitor picks it up, and off for good. */
  visible: boolean;
};

export default function LensGrabHint({
  displayScale,
  visible,
}: LensGrabHintProps) {
  const texture = useTexture("/assets/screens/disciplines/lens-grab-hint.webp");
  const camera = useThree((state) => state.camera);
  const meshRef = useRef<Mesh>(null);
  const startRef = useRef<number | null>(null);

  const material = useMemo(() => {
    prepareHintTexture(texture);
    const created = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      toneMapped: false,
      // Always on top of the model. The hand is chrome pointing AT the object, so a handle
      // clipping through it would read as a bug rather than as depth.
      depthTest: false,
      depthWrite: false,
    });
    created.name = "DISC_LENS_HINT";
    return created;
  }, [texture]);

  useEffect(() => () => material.dispose(), [material]);

  const position = useMemo(
    () => HINT_POSITION.clone().multiplyScalar(displayScale),
    [displayScale]
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!visible) {
      writeOpacity(material, 0);
      // Restart the cycle from the next appearance rather than mid-fade, so putting the lens
      // down does not make the hand blink straight back at you.
      startRef.current = null;
      return;
    }

    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const phase = (state.clock.elapsedTime - startRef.current) % HINT_PERIOD;
    const alpha = envelope(phase);
    writeOpacity(material, alpha);
    if (alpha <= 0) return;

    // Face the camera. The hint hangs in the carry group, which only ever translates, so the
    // camera's own orientation is the whole billboard.
    mesh.quaternion.copy(camera.quaternion);

    // The jab: a couple of pushes toward the handle, damped by the same envelope so it starts
    // and ends still rather than snapping.
    const jab =
      Math.sin((phase / HINT_VISIBLE) * Math.PI * 2 * HINT_JABS) *
      HINT_NUDGE *
      alpha;
    mesh.position.set(position.x + jab, position.y, position.z);
  });

  return (
    <mesh ref={meshRef} material={material} renderOrder={10} dispose={null}>
      <planeGeometry args={[HINT_SCALE, HINT_SCALE]} />
    </mesh>
  );
}

/**
 * Fetched up front. Four kilobytes, one file, needed by exactly one model - the eviction
 * bookkeeping in `disciplinePrefetch` exists for the ~60 KB screen images and would cost more
 * to extend than this asset costs to simply keep.
 */
useTexture.preload("/assets/screens/disciplines/lens-grab-hint.webp");
