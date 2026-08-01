"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AgXToneMapping, SRGBColorSpace } from "three";
import clsx from "clsx";

import type { Discipline } from "@/constants/disciplines";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import DisciplineModel from "./DisciplineModel";
import {
  createDisciplineEnvironment,
  type EnvironmentColors,
} from "./environment";
import type { DisciplineTheme } from "./materials";

/**
 * One camera for all six. SECTION_SPEC fixes the direction; the radius here is the spec's
 * (-3.2, 2.4, 6.4) scaled along that same vector so the model fills the column instead of
 * floating in the middle of it. Direction is what makes the 3/4 read, so only the distance
 * may change - and when it does, it is reported and written back into the spec.
 */
export const CAMERA_POSITION: [number, number, number] = [-1.86, 1.4, 3.72];
export const CAMERA_FOV = 30;

const DPR: [number, number] = [1, 1.75];

/**
 * Environment lives inside the Canvas because it needs the renderer, but its colours are
 * read outside and handed in. Built once per theme and rebuilt on nothing else - the PMREM
 * pass is the expensive part, so `colors` has to arrive with a stable identity.
 *
 * Attached declaratively rather than by assigning `scene.environment`: R3F sets it on mount
 * and restores the previous value on unmount, so nothing has to remember to clean up the
 * slot. Disposing the render target still does, and that is the effect below.
 */
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

type DisciplineStageProps = {
  discipline: Discipline;
  colors: EnvironmentColors | null;
  theme: DisciplineTheme;
  /** Ambient motion is off under reduced motion; the model still renders its still frame. */
  staticFrame: boolean;
  className?: string;
};

export default function DisciplineStage({
  discipline,
  colors,
  theme,
  staticFrame,
  className,
}: DisciplineStageProps) {
  const { ref, isIntersecting } = useIntersectionActive<HTMLDivElement>({
    threshold: 0,
  });
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setDocumentVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const animated = isIntersecting && documentVisible && !staticFrame;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${discipline.title} shown as a 3D device`}
      // The box is reserved by aspect-ratio before anything loads, so nothing shifts when
      // the GLB lands and `ScrollTrigger.refresh()` never meets a different height.
      className={clsx("relative aspect-[4/3] w-full", className)}
    >
      <Canvas
        // "always" while the section is on screen and the tab is visible; "demand" is the
        // parked state, so an off-screen section costs nothing per frame.
        frameloop={animated ? "always" : "demand"}
        dpr={DPR}
        gl={{
          alpha: true,
          antialias: true,
          // AgX, because the Blender scene the models were judged in is on the AgX view
          // transform. The approved clay renders and the page agree by construction; ACES
          // would quietly re-grade every value that was signed off in Blender.
          toneMapping: AgXToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{
          position: CAMERA_POSITION,
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        // Draw calls and triangle counts are acceptance criteria for this section in every
        // phase of SECTION_SPEC, and `renderer.info` is not reachable from outside the
        // Canvas any other way. Dev only: the branch is dead code in a production build.
        onCreated={(state) => {
          if (process.env.NODE_ENV !== "production") {
            (window as unknown as Record<string, unknown>).__disciplineStage =
              state;
          }
        }}
      >
        <StageEnvironment colors={colors} />
        {/*
          The Suspense boundary is PER MODEL, not around the scene. One boundary around the
          Canvas contents would suspend the whole subtree while an incoming model loads -
          and the outgoing model lives in that subtree, so it would vanish instead of
          playing its exit. The fallback holds the place rather than being null.
        */}
        <Suspense fallback={<StagePlaceholder />}>
          <DisciplineModel
            discipline={discipline}
            theme={theme}
            animated={animated}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Keeps the space and the depth buffer honest while the GLB and its screen image load. */
function StagePlaceholder() {
  return (
    <mesh visible={false}>
      <boxGeometry args={[2, 1.6, 0.6]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
