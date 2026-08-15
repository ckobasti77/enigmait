"use client";

/**
 * The cube itself - geometry, material, camera and the two uniforms the line is
 * drawn with. Everything here is shared by the hero and by the navbar emblem
 * (`app/_components/NavbarCubeMark.tsx`), which is the whole point: the emblem is
 * not a small copy of the hero cube, it *is* the hero cube, rendered small.
 *
 * What lives here is the object. What each consumer owns is time: the hero
 * reveals once and then runs a travelling gap forever (`HeroCube.tsx`), the mark
 * draws and wipes on a loop (`HeroCubeMark.tsx`). Those are the only two files
 * that may write `uHead` / `uGap`.
 */

import { useEffect } from "react";
import type { RefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  DoubleSide,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  ShaderMaterial,
  UnsignedByteType,
  Vector3,
} from "three";
import type { BufferGeometry, Group, Mesh, PerspectiveCamera } from "three";
import {
  heroCubeFragmentShader,
  heroCubeVertexShader,
} from "./heroCube.shaders";

export const HERO_CUBE_MODEL_PATH = "/assets/models/hero-cube.glb";
export const HERO_CUBE_MESH_NAME = "HERO_sq";

// Angle measured off the logo. Direction is what makes it read as a cube instead of a
// hexagon, so only the distance may ever change.
export const HERO_CUBE_CAMERA_POSITION: [number, number, number] = [
  -3.592, 3.371, 7.532,
];
export const HERO_CUBE_CAMERA_FOV = 28.8;

// HERO_SPEC states the gradient axis in Blender's Z-up space: (0.6512, -0.5464, -0.5267).
// The glTF export rotates the mesh to Y-up, so the same axis is (x, z, -y) here. Verified
// three ways: it is perpendicular to the view axis (dot = 0.000), it projects to
// (+0.823, -0.569) in camera space - the measured (+0.823, +0.568) of the logo PNG once
// y is flipped to image coordinates - and its projection range over the mesh is +-1.652,
// matching the +-1.647 in the spec.
export const GRADIENT_DIRECTION = new Vector3(0.6512, -0.5267, 0.5464);
export const Y_AXIS = new Vector3(0, 1, 0);
// Half-extent of the mesh along the gradient axis. 1.652 at the logo angle, 1.491 once
// the cube is turned; both are trimmed ~0.3% the way HERO_SPEC trims 1.652 to 1.647, so
// the end stops stay saturated at the corners.
const GRADIENT_RANGE = 1.487;
const GRADIENT_RESOLUTION = 512;
const GRADIENT_STOPS: readonly (readonly [number, string])[] = [
  [0, "#01BCF9"],
  [0.25, "#0084F7"],
  [0.5, "#0841F4"],
  [0.75, "#4E1BF3"],
  [1, "#8405E5"],
];
const SPECULAR_COLOR = "#EEF6FE";
const EMISSIVE_INTENSITY = 0.45;
const LIGHT_DIRECTION = new Vector3(-2.2, 3.6, 6).normalize();
/** Emissive ramp behind the head of the line. */
const HEAD_LENGTH = 0.028;

export const smoothstep = (x: number) => x * x * (3 - 2 * x);

/**
 * Cubic Hermite from 0 to 1 with the slopes at each end named. Both consumers
 * draw the line with one, and both care about the exit slope for the same
 * reason: it decides whether the head arrives at a stop or hands over to
 * whatever runs next at exactly its own pace.
 */
export const hermite = (x: number, entrySlope: number, exitSlope: number) => {
  const x2 = x * x;
  const x3 = x2 * x;
  return (
    -2 * x3 +
    3 * x2 +
    (x3 - 2 * x2 + x) * entrySlope +
    (x3 - x2) * exitSlope
  );
};

/** Azimuth the camera itself sits at, in radians, measured off +Z towards +X. */
const CAMERA_AZIMUTH = Math.atan2(
  HERO_CUBE_CAMERA_POSITION[0],
  HERO_CUBE_CAMERA_POSITION[2]
);

/**
 * Group rotation that makes the cube read as if seen from `azimuth` degrees.
 *
 * Turning the mesh about Y is exactly equivalent to swinging the camera the
 * other way, so a consumer can pick its own angle while the camera stays where
 * HERO_SPEC put it - which is what keeps the projection, and with it the
 * gradient axis measured off the logo, untouched. HERO_SPEC forbids changing the
 * camera direction; this is how a different angle is reached anyway.
 */
export const rotationForAzimuth = (azimuth: number) =>
  CAMERA_AZIMUTH - (azimuth * Math.PI) / 180;

const hexToRgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/**
 * The stops were sampled off the logo PNG and interpolated linearly in sRGB, so the ramp
 * is baked the same way and uploaded as an sRGB texture - the GPU decodes it to linear on
 * sample. At 512 texels the hardware's own filtering between texels is imperceptible.
 */
const createGradientTexture = () => {
  const stops = GRADIENT_STOPS.map(([position, hex]) => ({
    position,
    rgb: hexToRgb(hex),
  }));
  const data = new Uint8Array(GRADIENT_RESOLUTION * 4);

  for (let i = 0; i < GRADIENT_RESOLUTION; i += 1) {
    const x = i / (GRADIENT_RESOLUTION - 1);
    let segment = 0;
    while (segment < stops.length - 2 && x > stops[segment + 1].position) {
      segment += 1;
    }

    const from = stops[segment];
    const to = stops[segment + 1];
    const mix = (x - from.position) / (to.position - from.position);

    for (let channel = 0; channel < 3; channel += 1) {
      data[i * 4 + channel] = Math.round(
        from.rgb[channel] + (to.rgb[channel] - from.rgb[channel]) * mix
      );
    }
    data[i * 4 + 3] = 255;
  }

  const texture = new DataTexture(
    data,
    GRADIENT_RESOLUTION,
    1,
    RGBAFormat,
    UnsignedByteType
  );
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
};

/** `rotationY` seeds the gradient axis; applyRotation() keeps it in step from there on. */
export const createUniforms = (rotationY: number) => ({
  uGradient: { value: createGradientTexture() },
  uGradientDir: {
    value: GRADIENT_DIRECTION.clone().applyAxisAngle(Y_AXIS, -rotationY),
  },
  uGradientRange: { value: GRADIENT_RANGE },
  uSpecularColor: { value: new Color(SPECULAR_COLOR) },
  uLightDirection: { value: LIGHT_DIRECTION.clone() },
  uHead: { value: 0 },
  uGap: { value: 0 },
  uHeadLength: { value: HEAD_LENGTH },
  uEmissiveIntensity: { value: EMISSIVE_INTENSITY },
});

export type HeroCubeUniforms = ReturnType<typeof createUniforms>;

/**
 * Turns the mesh and counter-turns the gradient axis by the same amount. The shader
 * projects object-space positions, so without the counter-turn the ramp would swing round
 * with the spinning geometry instead of staying the screen diagonal measured off the logo.
 */
export const applyRotation = (
  group: Group,
  material: ShaderMaterial,
  rotationY: number
) => {
  group.rotation.y = rotationY;
  material.uniforms.uGradientDir.value
    .copy(GRADIENT_DIRECTION)
    .applyAxisAngle(Y_AXIS, -rotationY);
};

/**
 * Screen-space box the mark occupies, in NDC, at one fixed angle.
 *
 * Every vertex, not the eight bounding-box corners: the model is a tube with
 * thickness, so the corners sit a tube radius inside the real silhouette - fine
 * for the hero, which only needs a rough right edge, and not fine for the mark,
 * which crops the frustum to exactly this box. 1452 vertices, once, at mount.
 */
export const measureProjectedBounds = (
  geometry: BufferGeometry,
  camera: PerspectiveCamera,
  rotationY: number
) => {
  const position = geometry.getAttribute("position");
  if (!position || position.count === 0) return null;

  const point = new Vector3();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < position.count; i += 1) {
    point
      .fromBufferAttribute(position, i)
      .applyAxisAngle(Y_AXIS, rotationY)
      .project(camera);
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, maxX, minY, maxY };
};

/** The mesh drei's cache holds, or undefined while the GLB is still loading. */
export const useHeroCubeGeometry = () => {
  const { nodes } = useGLTF(HERO_CUBE_MODEL_PATH);
  return (nodes[HERO_CUBE_MESH_NAME] as Mesh | undefined)?.geometry;
};

/**
 * R3F disposes the material it built from JSX; the gradient texture rides inside the
 * uniforms, so it needs disposing by hand. The geometry belongs to drei's GLTF cache
 * and is deliberately left alone so a remount still has something to draw.
 */
export const useGradientCleanup = (
  materialRef: RefObject<ShaderMaterial | null>
) => {
  useEffect(() => {
    const material = materialRef.current;
    return () => {
      material?.uniforms.uGradient.value.dispose();
    };
  }, [materialRef]);
};

/**
 * The one place the shader is wired to the geometry. Both consumers render this,
 * so `side`, the uniform object and the two GLSL strings cannot drift apart.
 *
 * The pointer handlers are optional and land on the mesh, so R3F only fires them
 * off a real ray/tube intersection - a grab catches only where a line is, never
 * the empty space between. The hero passes them to make the cube draggable; the
 * navbar mark leaves them off and stays inert.
 */
export function HeroCubeShape({
  geometry,
  uniforms,
  groupRef,
  materialRef,
  rotationY,
  scale = 1,
  onPointerDown,
  onPointerOver,
  onPointerOut,
}: {
  geometry: BufferGeometry;
  uniforms: HeroCubeUniforms;
  groupRef: RefObject<Group | null>;
  materialRef: RefObject<ShaderMaterial | null>;
  rotationY: number;
  scale?: number;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
}) {
  return (
    <group ref={groupRef} scale={scale} rotation-y={rotationY}>
      <mesh
        geometry={geometry}
        dispose={null}
        onPointerDown={onPointerDown}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <shaderMaterial
          ref={materialRef}
          vertexShader={heroCubeVertexShader}
          fragmentShader={heroCubeFragmentShader}
          side={DoubleSide}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(HERO_CUBE_MODEL_PATH);
