"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import type { Group, Mesh } from "three";

import type { Discipline } from "@/constants/disciplines";
import {
  createScreenMaterial,
  getAccentMaterial,
  getBodyMaterial,
  prepareScreenTexture,
  type DisciplineTheme,
} from "./materials";
import {
  AMBIENT_FLOAT_AMPLITUDE,
  AMBIENT_FLOAT_SPEED,
  MAX_FRAME_DELTA,
  POINTER_LERP,
  POINTER_ROTATION_X,
  POINTER_SETTLE_EPSILON,
  POINTER_YAW_MAX,
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
 * be re-tuned without going back to Blender.
 */
export default function DisciplineModel({
  discipline,
  theme,
  animated,
}: DisciplineModelProps) {
  const { nodes } = useGLTF(discipline.modelPath);
  const screenTexture = useTexture(discipline.screenImage);
  const groupRef = useRef<Group>(null);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const bodyGeometry = (nodes[discipline.meshName] as Mesh | undefined)?.geometry;
  const screenGeometry = (nodes[discipline.screenMeshName] as Mesh | undefined)
    ?.geometry;

  const bodyMaterial = getBodyMaterial(theme, discipline.material);
  const accentMaterial = getAccentMaterial(theme);

  const screenMaterial = useMemo(() => {
    prepareScreenTexture(screenTexture, gl.capabilities.getMaxAnisotropy());
    return createScreenMaterial(theme, screenTexture);
  }, [gl, screenTexture, theme]);

  useEffect(() => () => screenMaterial.dispose(), [screenMaterial]);

  /**
   * The accents share one geometry, one material and one draw call. Their orientation is a
   * single quaternion taken from `accentAxis` rather than a per-instance rotation - they
   * are lights set into one face, so they all point the same way by construction.
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
   * THE TWO AXES ARE MEASURED AGAINST DIFFERENT THINGS, and that is not an oversight.
   *
   * `x` runs 0..1 across the WINDOW, because the yaw is described in terms of the window:
   * cursor at the left edge means square to the viewer, cursor at the right edge means
   * fully turned. Measured against the canvas instead, the model would hit full yaw
   * somewhere in the middle of the page and then sit there for the whole right-hand half.
   *
   * `y` stays -1..1 around the CENTRE OF THE CANVAS, because the tilt is a reaction to
   * where the cursor is relative to the model, and the model moves up the screen as the
   * page scrolls. The rect is cached and refreshed on scroll and resize rather than
   * measured inside the handler, so a pointer move never forces layout.
   *
   * `x` starts at 0: with no cursor yet - first paint, a touch device, a pointer that never
   * enters the window - the model rests square to the viewer.
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
      const width = window.innerWidth;
      if (width === 0 || rect.height === 0) return;
      const x = event.clientX / width;
      const y =
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      pointerTarget.current.x = Math.max(0, Math.min(1, x));
      pointerTarget.current.y = Math.max(-1, Math.min(1, y));
      invalidate();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [gl, invalidate]);

  const elapsedRef = useRef(0);

  /**
   * ONE writer per rotation axis, in one place.
   *
   *   rotation.y = yaw from the cursor's x across the window, 0 at the left edge
   *   rotation.x = tilt from the cursor's y about the canvas centre
   *
   * Nothing else writes either of them. There is no ambient turn to add in: the model is
   * still until the cursor moves it, which is the whole point - a model that also spun on
   * its own clock would spend most of the cycle facing away from the cursor it is meant to
   * be following. The swap timeline in Faza D owns `scale`, `opacity` and
   * `emissiveIntensity` - deliberately none of the three below.
   *
   * Positive `rotation.y` swings the screen's normal towards +X, i.e. the panel turns to
   * face screen-right, following the cursor rather than shying away from it.
   */
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const step = Math.min(delta, MAX_FRAME_DELTA);
    if (animated) elapsedRef.current += step;

    const current = pointerCurrent.current;
    const target = pointerTarget.current;
    current.x += (target.x - current.x) * POINTER_LERP;
    current.y += (target.y - current.y) * POINTER_LERP;

    const floatY = animated
      ? Math.sin(elapsedRef.current * AMBIENT_FLOAT_SPEED) *
        AMBIENT_FLOAT_AMPLITUDE
      : 0;

    group.rotation.y = current.x * POINTER_YAW_MAX;
    group.rotation.x = current.y * POINTER_ROTATION_X;
    group.position.y = floatY;

    // Under `frameloop="demand"` the loop only runs when something asks for it; keep asking
    // while the pointer is still travelling, then stop.
    if (
      !animated &&
      (Math.abs(target.x - current.x) > POINTER_SETTLE_EPSILON ||
        Math.abs(target.y - current.y) > POINTER_SETTLE_EPSILON)
    ) {
      invalidate();
    }
  });

  if (!bodyGeometry || !screenGeometry) return null;

  return (
    <group ref={groupRef} scale={discipline.displayScale}>
      <mesh geometry={bodyGeometry} material={bodyMaterial} dispose={null} />
      <mesh geometry={screenGeometry} material={screenMaterial} dispose={null} />
      {accentMesh ? <primitive object={accentMesh} /> : null}
    </group>
  );
}
