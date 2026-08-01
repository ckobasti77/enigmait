"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

import {
  DISCIPLINE_ORDER,
  disciplines,
  type DisciplineKey,
} from "@/constants/disciplines";
import { useTheme } from "@/app/_components/ThemeProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import DisciplineCopy from "./DisciplineCopy";
import DisciplineStage from "./DisciplineStage";
import { readEnvironmentColors, type EnvironmentColors } from "./environment";

/**
 * PREVIEW STATE. The section shell, the stage and the copy panel are the real ones; the
 * only thing pinned down is the index. Faza D replaces this constant with the scroll
 * engine's `index` state and nothing else in this file has to move.
 */
const ACTIVE_INDEX = 0;

const ACTIVE_KEY: DisciplineKey = DISCIPLINE_ORDER[ACTIVE_INDEX];

export default function Disciplines() {
  const discipline = disciplines[ACTIVE_KEY];
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  /**
   * The environment's colours are read from CSS variables OUTSIDE `<Canvas>` and passed in
   * as props. Memoised on the theme, not held in state: `getComputedStyle` is a read with
   * no side effects, and keeping it out of state means the server and the client render the
   * same tree - the value is `null` where there is no document, and the environment simply
   * waits. The identity has to be stable because `createDisciplineEnvironment` runs a PMREM
   * pass, and that must not happen once per render.
   */
  const colors: EnvironmentColors | null = useMemo(
    () => readEnvironmentColors(theme),
    [theme]
  );

  return (
    <section className="site-gutter disciplines relative theme-section py-24 transition-theme">
      <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <DisciplineStage
          discipline={discipline}
          colors={colors}
          theme={theme}
          staticFrame={prefersReducedMotion}
        />

        {/*
          `data-reveal="off"` belongs here the moment the swap timeline owns this panel's
          opacity (Faza E). Until then the site-wide reveal drives it, like every other
          block of copy on the page.
        */}
        <DisciplineCopy discipline={discipline} />
      </div>
    </section>
  );
}

useGLTF.preload(disciplines[ACTIVE_KEY].modelPath);
