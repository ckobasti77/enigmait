"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AgXToneMapping,
  SRGBColorSpace,
  type Camera,
  type PerspectiveCamera,
} from "three";

import {
  createDisciplineEnvironment,
  readEnvironmentColors,
  type EnvironmentColors,
} from "@/components/sections/disciplines/environment";
import {
  DPR_DESKTOP,
  DPR_NARROW,
  NARROW_QUERY,
  type ShowcaseLayout,
} from "@/constants/projectShowcase3D";

import ProjectDeviceScene from "./ProjectDeviceScene";
import type { ShowcaseTheme } from "./deviceMaterials";
import type { Move } from "./useProjectIndex";

/**
 * Ista dva budžeta piksela i ista 768 linija kao `DisciplineStage` i
 * `ServiceModelStage`. Kopija, ne uvoz - tamo je takođe privatna, a R3F
 * rekonfiguriše renderer na promenu `dpr`, pa odgovor mora da bude tačan, ne
 * stabilan.
 */
function useCanvasDpr(): [number, number] {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);
    const sync = () => setNarrow(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return narrow ? DPR_NARROW : DPR_DESKTOP;
}

/** Proceduralni PMREM iz disciplina - bez ijednog HDR-a sa CDN-a. */
function StageEnvironment({ colors }: { colors: EnvironmentColors | null }) {
  const gl = useThree((state) => state.gl);

  const environment = useMemo(
    () => (colors ? createDisciplineEnvironment(gl, colors) : null),
    [colors, gl]
  );

  useEffect(() => () => environment?.dispose(), [environment]);

  if (!environment) return null;
  return <primitive attach="environment" object={environment.texture} />;
}

/**
 * Upis u kameru, opran kroz modulsku funkciju - `useThree` je hook, a React
 * Compiler ne dozvoljava menjanje onoga što je hook vratio. Isti postupak koji
 * `materials.ts` u disciplinama već dokumentuje za teksture.
 */
/**
 * Postavlja kameru tako da se `fit` boks vidi ceo, pri datom odnosu stranica.
 *
 * `fov` je VERTIKALAN, pa vertikalno uklapanje ne zavisi od odnosa stranica a
 * vodoravno zavisi - uži kadar traži veće rastojanje. Uzima se veće od dva
 * rastojanja, i time isti preset radi i na 16/10 sceni na desktopu, i na skoro
 * kvadratnoj na tabletu, i na portretnoj na telefonu, bez ijednog odsečenog
 * uređaja.
 */
const applyCamera = (
  camera: Camera,
  spec: ShowcaseLayout["camera"],
  aspect: number
) => {
  // `Camera` je bazna klasa i nema ni `fov` ni `updateProjectionMatrix` - oba
  // stižu tek sa perspektivnom. Canvas je pravi perspektivnu, pa je ovo provera
  // a ne nada.
  const perspective = camera as PerspectiveCamera;
  if (!perspective.isPerspectiveCamera) return;

  const halfFov = (spec.fov * Math.PI) / 360;
  const forHeight = spec.fit.height / 2 / Math.tan(halfFov);
  const forWidth = spec.fit.width / 2 / (Math.tan(halfFov) * Math.max(aspect, 0.01));
  const distance = Math.max(forHeight, forWidth);

  const [dx, dy, dz] = spec.direction;
  const length = Math.hypot(dx, dy, dz) || 1;
  const [tx, ty, tz] = spec.target;

  perspective.position.set(
    tx + (dx / length) * distance,
    ty + (dy / length) * distance,
    tz + (dz / length) * distance
  );
  perspective.lookAt(tx, ty, tz);
  perspective.fov = spec.fov;
  perspective.updateProjectionMatrix();
};

/**
 * Kamera se postavlja imperativno jer zavisi od odnosa stranica platna, a
 * `<Canvas camera>` prima samo statične vrednosti. `size` je u zavisnostima da
 * bi se uklapanje preračunalo na svaku promenu veličine.
 */
function CameraRig({ camera: spec }: { camera: ShowcaseLayout["camera"] }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    applyCamera(camera, spec, size.width / Math.max(size.height, 1));
  }, [camera, spec, size]);

  return null;
}

type ProjectShowcaseStageProps = {
  index: number;
  move: Move | null;
  layout: ShowcaseLayout;
  theme: ShowcaseTheme;
  /** U kadru i tab je vidljiv. Jedini prekidač `frameloop`-a. */
  animated: boolean;
  videoElement: HTMLVideoElement | null;
  videoPlaying: boolean;
};

/**
 * `<Canvas>` i ništa drugo.
 *
 * `frameloop` je `"always" | "never"`, bez `"demand"`, i to je odluka a ne
 * previd: `VideoTexture` se u three r184 osvežava iz `requestVideoFrameCallback`
 * koji samo postavlja `needsUpdate` - pod `"demand"` bi laptop stao na prvom
 * frejmu. Ručni `invalidate()` iz rVFC bi radio, ali bi uz tween dao dva
 * nezavisna izvora invalidacije, za uštedu koja postoji samo dok video svira a
 * ništa drugo se ne kreće, u sceni od 13 mesheva bez post-processinga.
 */
export default function ProjectShowcaseStage({
  index,
  move,
  layout,
  theme,
  animated,
  videoElement,
  videoPlaying,
}: ProjectShowcaseStageProps) {
  const dpr = useCanvasDpr();

  const colors: EnvironmentColors | null = useMemo(
    () => readEnvironmentColors(theme),
    [theme]
  );

  return (
    <Canvas
      frameloop={animated ? "always" : "never"}
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: AgXToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      // Početne vrednosti; `CameraRig` ih odmah zameni uklopljenima.
      camera={{
        position: [0, 0, 5],
        fov: layout.camera.fov,
        near: 0.1,
        far: 100,
      }}
      onCreated={(state) => {
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as Record<string, unknown>).__projectStage = state;
        }
      }}
    >
      <CameraRig camera={layout.camera} />
      <StageEnvironment colors={colors} />
      <Suspense fallback={<group />}>
        <ProjectDeviceScene
          index={index}
          move={move}
          layout={layout}
          theme={theme}
          videoElement={videoElement}
          videoPlaying={videoPlaying}
        />
      </Suspense>
    </Canvas>
  );
}
