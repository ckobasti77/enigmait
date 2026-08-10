"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Canvas, useThree } from "@react-three/fiber";
import { AgXToneMapping, SRGBColorSpace } from "three";
import clsx from "clsx";

import DisciplineModel from "@/components/sections/disciplines/DisciplineModel";
import {
  CAMERA_FOV,
  CAMERA_POSITION,
} from "@/components/sections/disciplines/DisciplineStage";
import { preloadDiscipline } from "@/components/sections/disciplines/disciplinePrefetch";
import {
  createDisciplineEnvironment,
  readEnvironmentColors,
  type EnvironmentColors,
} from "@/components/sections/disciplines/environment";
import {
  DISCIPLINE_ORDER,
  disciplines,
  type DisciplineKey,
} from "@/constants/disciplines";
import { useTheme } from "@/app/_components/ThemeProvider";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

/**
 * One authored GLB, standing still, in a service page hero - the same model,
 * camera, materials and environment as the homepage Disciplines reel, minus
 * the reel. Everything discipline-owned is imported by direct file path and
 * used unmodified; the two small private pieces of `DisciplineStage`
 * (`useCanvasDpr`, `StageEnvironment`) are re-implemented here rather than
 * exported from a section that should not know it has a second consumer.
 *
 * Deliberately NO disposal on unmount: drei's cache is keyed by URL, the whole
 * six-model working set is ~256 KB of source geometry, and the homepage's
 * `prefetchNeighbours` already evicts anything beyond ±1 whenever the visitor
 * lands there - the two consumers never mount at the same time.
 */

/** Same two pixel budgets as `DisciplineStage`, same 768px line. */
const DPR_DESKTOP: [number, number] = [1, 1.75];
const DPR_NARROW: [number, number] = [1, 1.5];
const NARROW_QUERY = "(max-width: 767px)";

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

/** Colors arrive from outside with a stable identity - the PMREM pass is the
 *  expensive part and must not run once per render. */
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

type ServiceModelStageProps = {
  slug: DisciplineKey;
  className?: string;
};

export default function ServiceModelStage({
  slug,
  className,
}: ServiceModelStageProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const webglSupported = useWebGLSupport();
  const dpr = useCanvasDpr();

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

  /**
   * The Disciplines gate, verbatim: nothing renders until the WebGL probe has
   * answered, so the server markup and the first client render agree and there
   * is no hydration mismatch. The box is reserved by `.service-hero-viewport`,
   * so the wait costs no layout shift.
   */
  const settled = webglSupported !== null;
  const renders3D = settled && !prefersReducedMotion && webglSupported;
  const showsStill = settled && (prefersReducedMotion || !webglSupported);

  const discipline = disciplines[slug];
  const animated = isIntersecting && documentVisible;

  const colors: EnvironmentColors | null = useMemo(
    () => readEnvironmentColors(theme),
    [theme]
  );

  // Eager fetch from a mount effect: the model is above the fold, so waiting
  // for intersection would guarantee an empty box on every landing - but the
  // still/reduced branch must never pay for a GLB. Idempotent with the
  // homepage's own prefetch (same in-flight set, same cache key).
  useEffect(() => {
    if (renders3D) preloadDiscipline(DISCIPLINE_ORDER.indexOf(slug));
  }, [renders3D, slug]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${discipline.title} shown as a 3D device`}
      className={clsx("absolute inset-0", className)}
    >
      {renders3D ? (
        <Canvas
          frameloop={animated ? "always" : "never"}
          dpr={dpr}
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: AgXToneMapping,
            outputColorSpace: SRGBColorSpace,
          }}
          camera={{
            position: CAMERA_POSITION,
            fov: CAMERA_FOV,
            near: 0.1,
            far: 100,
          }}
        >
          <StageEnvironment colors={colors} />
          <Suspense fallback={<group />}>
            <DisciplineModel
              discipline={discipline}
              theme={theme}
              animated={animated}
            />
          </Suspense>
        </Canvas>
      ) : null}
      {showsStill ? (
        <Image
          src={discipline.stillPath}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 40rem, 100vw"
          className="object-contain"
        />
      ) : null}
    </div>
  );
}
