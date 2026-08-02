"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useStore, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import type { BufferGeometry, Group, Material, Mesh } from "three";

import type { Discipline } from "@/constants/disciplines";
import {
  createLensMaterial,
  createScreenMaterial,
  getAccentMaterial,
  getBodyMaterial,
  prepareScreenTexture,
  LENS_TRANSMISSION_RESOLUTION,
  type DisciplineTheme,
} from "./materials";
import {
  AMBIENT_FLOAT_AMPLITUDE,
  AMBIENT_FLOAT_SPEED,
  AMBIENT_YAW_SPEED,
  MAX_FRAME_DELTA,
  MODEL_BASE_YAW,
  POINTER_LERP,
  POINTER_PITCH_MAX,
  POINTER_YAW_MAX,
  TWO_PI,
} from "./disciplinesTiming";

const CYLINDER_UP = new Vector3(0, 1, 0);
/** The accent is a disc, not a pin: half as tall as it is wide. */
const ACCENT_HEIGHT_RATIO = 0.5;
const FINE_POINTER_QUERY = "(pointer: fine)";

type DisciplineModelProps = {
  discipline: Discipline;
  theme: DisciplineTheme;
  /** Ambient rotation and float. Off when the section is parked or the tab is hidden. */
  animated: boolean;
};

/**
 * One model: GLB body + screen primitive + the emissive accent, which is instanced in code
 * and exists in no `.glb`. Three draw calls, and the third one is the reason the cyan can
 * be re-tuned without going back to Blender. `seo-geo` takes a fourth, because its second
 * primitive is a lens rather than a display and transmission cannot share a pass.
 */
export default function DisciplineModel({
  discipline,
  theme,
  animated,
}: DisciplineModelProps) {
  const { nodes } = useGLTF(discipline.modelPath);
  const groupRef = useRef<Group>(null);
  const gl = useThree((state) => state.gl);

  const bodyGeometry = (nodes[discipline.meshName] as Mesh | undefined)
    ?.geometry;
  const screenGeometry = (nodes[discipline.screenMeshName] as Mesh | undefined)
    ?.geometry;

  const bodyMaterial = getBodyMaterial(theme, discipline.material);
  const accentMaterial = getAccentMaterial(theme);

  /**
   * The accents share one geometry, one material and one draw call. Their orientation is a
   * single quaternion taken from `accentAxis` rather than a per-instance rotation - they
   * are lights set into one face, so they all point the same way by construction. That
   * holds for the ring on `seo-geo` too: a ring of lights round a lens all face along the
   * lens normal, which is exactly what a ring light is.
   */
  const accentMesh = useMemo(() => {
    if (discipline.accents.length === 0) return null;

    const geometry = new CylinderGeometry(1, 1, 1, 12);
    const mesh = new InstancedMesh(
      geometry,
      accentMaterial,
      discipline.accents.length
    );
    const axis = new Vector3(...discipline.accentAxis).normalize();
    const quaternion = new Quaternion().setFromUnitVectors(CYLINDER_UP, axis);
    const scale = new Vector3(
      discipline.accentScale,
      discipline.accentScale * ACCENT_HEIGHT_RATIO,
      discipline.accentScale
    );
    const matrix = new Matrix4();
    const position = new Vector3();

    discipline.accents.forEach((accent, index) => {
      matrix.compose(position.set(...accent), quaternion, scale);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    return mesh;
  }, [accentMaterial, discipline]);

  // The material is shared and outlives the model; the geometry is built here, so it is
  // disposed here. Body and screen geometry belong to drei's GLTF cache and are left alone
  // so a remount still has something to draw.
  useEffect(() => {
    if (!accentMesh) return;
    return () => {
      accentMesh.geometry.dispose();
      accentMesh.dispose();
    };
  }, [accentMesh]);

  /**
   * Pointer tracking. A raw `window` listener, no R3F event and no raycast - nothing in the
   * scene is picked, and the pointer has to be tracked even where `pointer-events` is off.
   *
   * Both axes are measured about the CENTRE OF THE CANVAS and both run -1..1, because the
   * parallax is symmetric: it is a lean towards the cursor, not a pose. The rect is cached
   * and refreshed on scroll and resize rather than measured inside the handler, so a
   * pointer move never forces layout.
   *
   * Both start at 0, so with no cursor yet - first paint, a touch device, a pointer that
   * never enters the window - the model sits square on its ambient turn and nothing else.
   */
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER_QUERY).matches) return;

    const canvas = gl.domElement;
    let rect = canvas.getBoundingClientRect();
    const measure = () => {
      rect = canvas.getBoundingClientRect();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y =
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      pointerTarget.current.x = Math.max(-1, Math.min(1, x));
      pointerTarget.current.y = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // No `invalidate()` in the handler: the Canvas runs `frameloop="always"` while the
    // section is on screen and `"never"` while it is parked, so there is no demand-driven
    // state left for a pointer move to ask a frame from. Under "never" nothing is being
    // looked at, and the lerp catches up on the first frame after it comes back.
  }, [gl]);

  const floatPhaseRef = useRef(0);
  const yawRef = useRef(0);

  /**
   * ONE WRITER PER VALUE, AND THIS IS THE ONE FOR ROTATION.
   *
   *   rotation.y = MODEL_BASE_YAW + ambient turn + pointer yaw
   *   rotation.x = pointer pitch
   *   position.y = ambient float
   *
   * The three terms of the yaw are summed HERE, in one assignment, and nowhere else. The
   * swap timeline owns `scale`, `opacity` and `emissiveIntensity` and deliberately touches
   * none of these - two schedulers over one value is jitter that does not debug, and the
   * reel's tween moves the strip's `position.y`, which is the parent of this group, not
   * this group's own.
   *
   * The ambient turn is accumulated as an angle and wrapped into [0, 2pi). Wrapping a
   * rotation by a full turn is the identity, so there is no seam at the wrap; what it buys
   * is that the number driving the sine tables stays small no matter how long the tab has
   * been open, instead of growing without bound and losing its low bits.
   */
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const step = Math.min(delta, MAX_FRAME_DELTA);
    if (animated) {
      floatPhaseRef.current = (floatPhaseRef.current + step * AMBIENT_FLOAT_SPEED) % TWO_PI;
      yawRef.current = (yawRef.current + step * AMBIENT_YAW_SPEED) % TWO_PI;
    }

    const current = pointerCurrent.current;
    const target = pointerTarget.current;
    current.x += (target.x - current.x) * POINTER_LERP;
    current.y += (target.y - current.y) * POINTER_LERP;

    group.rotation.y =
      MODEL_BASE_YAW + yawRef.current + current.x * POINTER_YAW_MAX;
    group.rotation.x = current.y * POINTER_PITCH_MAX;
    group.position.y = animated
      ? Math.sin(floatPhaseRef.current) * AMBIENT_FLOAT_AMPLITUDE
      : 0;
  });

  if (!bodyGeometry || !screenGeometry) return null;

  return (
    <group ref={groupRef} scale={discipline.displayScale}>
      <mesh geometry={bodyGeometry} material={bodyMaterial} dispose={null} />
      {discipline.screenKind === "lens" ? (
        <LensPrimitive geometry={screenGeometry} theme={theme} />
      ) : (
        <DisplayPrimitive
          geometry={screenGeometry}
          image={discipline.screenImage}
          theme={theme}
        />
      )}
      {accentMesh ? <primitive object={accentMesh} /> : null}
    </group>
  );
}

/**
 * The screen, on the five models that have one.
 *
 * Split out of `DisciplineModel` for one reason: `useTexture` suspends, and `seo-geo` has no
 * image to load. A hook cannot be called conditionally, so the condition has to be a
 * component boundary - which also means the magnifier never requests a texture it would not
 * sample, and its slot in the prefetch budget goes to a neighbour that will.
 */
function DisplayPrimitive({
  geometry,
  image,
  theme,
}: {
  geometry: BufferGeometry;
  image: string;
  theme: DisciplineTheme;
}) {
  const texture = useTexture(image);
  const gl = useThree((state) => state.gl);

  const material = useMemo(() => {
    prepareScreenTexture(texture, gl.capabilities.getMaxAnisotropy());
    return createScreenMaterial(theme, texture);
  }, [gl, texture, theme]);

  useEffect(() => () => material.dispose(), [material]);

  return <mesh geometry={geometry} material={material} dispose={null} />;
}

/**
 * The magnifier's lens, and the only transmission element on the section.
 *
 * Built once per theme and per device class, not per frame: `createLensMaterial` reads the
 * 768px media query itself and hands back opaque steel below it, so the phone silently drops
 * back to three draw calls without a branch here.
 */
function LensPrimitive({
  geometry,
  theme,
}: {
  geometry: BufferGeometry;
  theme: DisciplineTheme;
}) {
  const material: Material = useMemo(() => createLensMaterial(theme), [theme]);
  // The store rather than `useThree(state => state.gl)`, because the effect below writes to
  // the renderer, and the React Compiler will not let a component mutate a value a hook
  // returned to it. Reading it out of the store inside the effect says the same thing about
  // ownership that the rule is protecting: the renderer belongs to the Canvas, this is a
  // deliberate reach into it, and it is put back on the way out.
  const store = useStore();
  const size = useThree((state) => state.size);

  useEffect(() => () => material.dispose(), [material]);

  /**
   * The transmission budget, actually spent.
   *
   * `LENS_TRANSMISSION_RESOLUTION` is a pixel height, but three.js does not take one - it
   * sizes the transmission render target as a FRACTION of the drawing buffer
   * (`transmissionResolutionScale`, `WebGLRenderer.js`). So the budget is converted here,
   * against the live buffer size, which is also why this cannot be done once at module
   * scope: the same 256 px is a different fraction on a phone and on a 4K monitor.
   *
   * Set on the renderer rather than on the material because that is where three.js keeps
   * it, and restored on unmount because the renderer outlives this model - leaving a 0.2
   * scale behind would quietly degrade any transmission a later section asks for.
   */
  useEffect(() => {
    const renderer = store.getState().gl;
    const buffer = renderer.getDrawingBufferSize(new Vector2());
    if (buffer.y <= 0) return;
    const previous = renderer.transmissionResolutionScale;
    renderer.transmissionResolutionScale = Math.min(
      1,
      LENS_TRANSMISSION_RESOLUTION / buffer.y
    );
    return () => {
      renderer.transmissionResolutionScale = previous;
    };
  }, [store, size]);

  return <mesh geometry={geometry} material={material} dispose={null} />;
}
