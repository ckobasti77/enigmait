"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AgXToneMapping, SRGBColorSpace } from "three";
import type { Group } from "three";
import gsap from "gsap";
import clsx from "clsx";

import { DISCIPLINE_ORDER, disciplines } from "@/constants/disciplines";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import DisciplineModel from "./DisciplineModel";
import {
  createDisciplineEnvironment,
  type EnvironmentColors,
} from "./environment";
import { type DisciplineTheme } from "./materials";
import {
  MODEL_SLOT_SPAN,
  MODEL_SWAP_DURATION,
  MODEL_SWAP_EASE,
} from "./disciplinesTiming";

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
  /** Position in `DISCIPLINE_ORDER`. The reel derives everything else from it. */
  index: number;
  colors: EnvironmentColors | null;
  theme: DisciplineTheme;
  className?: string;
};

/**
 * The renderer, and only ever mounted when there is going to be one: reduced motion and a
 * browser without WebGL are both decided by the caller, which renders a list or a still
 * instead. So there is no "static frame" branch left in here - a `<Canvas>` that exists is
 * a `<Canvas>` that draws.
 *
 * The box is NOT reserved here either. `.discipline-viewport` owns the aspect ratio in
 * `globals.css` and reserves it before React mounts any of the three branches, which is why
 * the swap between them costs no layout shift.
 */
export default function DisciplineStage({
  index,
  colors,
  theme,
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

  /** SECTION_SPEC's `active`, exactly: the intersection AND a visible tab. */
  const animated = isIntersecting && documentVisible;

  return (
    <div ref={ref} className={clsx("absolute inset-0", className)}>
      <Canvas
        // "always" on screen with the tab in front, "never" otherwise - not "demand".
        // "demand" still renders whenever React commits, which for a section parked below
        // the fold means paying for a theme change or a resize nobody is looking at.
        // "never" is the parked state costing literally nothing, and the last frame stays
        // on the canvas until the section comes back.
        frameloop={animated ? "always" : "never"}
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
        <DisciplineReel index={index} theme={theme} animated={animated} />
      </Canvas>
    </div>
  );
}

/**
 * The reel. All six models hang on one vertical strip with air between them, and
 * a step moves the strip: scroll down and the model on screen slides UP and out
 * while the next one rises from below into its place. Scrolling up runs the same
 * motion the other way, which is why the transition back never looks like a
 * rewind of the transition forward - it is the same strip, travelling.
 *
 * Two models are in the scene and only two, and only while the strip is moving.
 * The outgoing one sits at the strip's origin, the incoming one a slot away in
 * the direction it comes from, and ONE tween on the strip carries both. That is
 * the reason there is a single easing here instead of an exit curve and an
 * entrance curve: there is a single motion.
 */
function DisciplineReel({
  index,
  theme,
  animated,
}: {
  index: number;
  theme: DisciplineTheme;
  animated: boolean;
}) {
  const reelRef = useRef<Group>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  /**
   * `from` is the model on its way out and is null whenever the strip is at
   * rest. Derived during render rather than in an effect: an effect would commit
   * the new index once with no outgoing model - a visible cut - and only then
   * start the slide.
   */
  const [pair, setPair] = useState<{
    from: number | null;
    to: number;
    direction: 1 | -1;
  }>({ from: null, to: index, direction: 1 });

  if (pair.to !== index) {
    // A step that arrives mid-slide takes whatever was arriving as its outgoing
    // model, so the strip never has to hold three.
    setPair({ from: pair.to, to: index, direction: index > pair.to ? 1 : -1 });
  } else if (pair.from !== null && !animated) {
    // Reduced motion, or the section is parked: land on the new model without
    // the travel. There are no frames to travel in, so there is nothing to see
    // and nothing to keep a second model in the scene for.
    setPair({ ...pair, from: null });
  }

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    if (pair.from === null) {
      // At rest the strip sits at its origin. Setting it here rather than in the
      // tween's `onComplete` keeps it in the same commit as the children's new
      // positions, so the world position never changes across the handover.
      reel.position.y = 0;
      invalidate();
      return;
    }

    tweenRef.current?.kill();
    reel.position.y = 0;

    tweenRef.current = gsap.to(reel.position, {
      y: pair.direction * MODEL_SLOT_SPAN,
      duration: MODEL_SWAP_DURATION,
      ease: MODEL_SWAP_EASE,
      // `frameloop` is "demand" whenever the section is parked, so the tween has
      // to ask for the frames it needs rather than assume them.
      onUpdate: invalidate,
      onComplete: () => setPair((current) => ({ ...current, from: null })),
    });

    /**
     * `kill()`, not `ctx.revert()`. Reverting would restore the strip to where
     * this tween started, which for a finished slide means snapping a model back
     * off screen - the opposite of cleanup.
     */
    return () => {
      tweenRef.current?.kill();
    };
    // `animated` is deliberately not a dependency: the render-phase guard above
    // already clears `from` when the section is parked, so by the time this runs
    // with an outgoing model there are frames to travel in.
  }, [pair, invalidate]);

  return (
    <group ref={reelRef}>
      {pair.from !== null ? (
        <ReelSlot index={pair.from} y={0} theme={theme} animated={animated} />
      ) : null}
      <ReelSlot
        index={pair.to}
        y={pair.from === null ? 0 : -pair.direction * MODEL_SLOT_SPAN}
        theme={theme}
        animated={animated}
      />
    </group>
  );
}

/**
 * One position on the strip.
 *
 * The Suspense boundary is PER MODEL, not around the scene. One boundary around
 * the Canvas contents would suspend the whole subtree while an incoming model
 * loads - and the outgoing model lives in that subtree, so it would vanish
 * instead of playing its exit. The fallback holds the place rather than being
 * null.
 */
function ReelSlot({
  index,
  y,
  theme,
  animated,
}: {
  index: number;
  y: number;
  theme: DisciplineTheme;
  animated: boolean;
}) {
  const discipline = disciplines[DISCIPLINE_ORDER[index]];

  return (
    <group position={[0, y, 0]}>
      <Suspense fallback={<StagePlaceholder />}>
        <DisciplineModel
          discipline={discipline}
          theme={theme}
          animated={animated}
        />
      </Suspense>
    </group>
  );
}

/**
 * The fallback while a model's GLB and screen image are in flight.
 *
 * An empty group rather than `null`, per `.claude/rules/patterns.md`, and rather than the
 * invisible box that used to stand here: a `visible={false}` mesh draws nothing and occludes
 * nothing, so it held neither the space nor the depth buffer it claimed to - it only
 * allocated a buffer for the privilege. The box that reserves the layout is the CSS
 * `aspect-ratio` on the canvas wrapper, and it is reserved before React mounts anything.
 */
function StagePlaceholder() {
  return <group />;
}
