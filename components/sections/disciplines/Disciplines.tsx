"use client";

import { useEffect, useMemo, useRef } from "react";

import { DISCIPLINE_ORDER, disciplines } from "@/constants/disciplines";
import { useTheme } from "@/app/_components/ThemeProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import DisciplineCopy from "./DisciplineCopy";
import DisciplineHint from "./DisciplineHint";
import DisciplineStage from "./DisciplineStage";
import DisciplineStepper from "./DisciplineStepper";
import DisciplineStill from "./DisciplineStill";
import { observeFirstModel, prefetchNeighbours } from "./disciplinePrefetch";
import { readEnvironmentColors, type EnvironmentColors } from "./environment";
import { SECTION_KICKER, SECTION_LEDE, SECTION_TITLE } from "./sectionCopy";
import { useDisciplineIndex } from "./useDisciplineIndex";

/**
 * The section shell.
 *
 * `children` is the `ItemList` graph, built and serialised by `DisciplinesSection` - a
 * server component - and placed at the bottom of the `<section>` here. It arrives as a prop
 * rather than being rendered in this file because React warns when a client component
 * renders a `<script>`, and this file is a client component from its first line. See the
 * note in `DisciplinesSection.tsx`.
 */
export default function DisciplinesShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const webglSupported = useWebGLSupport();

  const sectionRef = useRef<HTMLElement>(null);

  /**
   * THE TWO GATES, AND THE ONE THAT HOLDS THEM BOTH SHUT UNTIL HYDRATION IS OVER.
   *
   * `reduced` is a request from the person reading the page - the OS preference, Save-Data,
   * or a battery under 20%. It takes the whole interactive apparatus away and leaves a plain
   * vertical list of six, because someone who asked for less motion did not ask for a
   * carousel that has to be operated.
   *
   * `showsStill` is a fact about the browser. The section still works exactly as designed -
   * arrows, dots, keyboard, swipe - and a WebP still stands where the renderer would be.
   * Never a black canvas: nothing that would need a GL context is mounted at all.
   *
   * `settled` is why both are gated. `usePrefersReducedMotion` reads `matchMedia` in its
   * state initialiser, so it answers `false` on the server and `true` on the client's very
   * first render - and these two branches render DIFFERENT ELEMENTS (`<ol>` against the
   * grid). React calls that a hydration mismatch, throws the whole subtree away and rebuilds
   * it, and says so in the console. `useWebGLSupport` already has the right shape for this -
   * `useSyncExternalStore` with a server snapshot of `null` - so its "not known yet" is
   * borrowed as the signal for both: until it answers, the markup is exactly what the server
   * sent. One commit later the real branch takes over.
   *
   * Nothing is animating during that commit and the box is reserved by `aspect-ratio`, so
   * the wait costs neither a flash nor a layout shift.
   */
  const settled = webglSupported !== null;
  const reduced = settled && prefersReducedMotion;
  const renders3D = settled && !prefersReducedMotion && webglSupported;
  const showsStill = settled && !prefersReducedMotion && !webglSupported;

  const { index, direction, columnRef, goTo, step, stageVisible, interacted } =
    useDisciplineIndex({ count: DISCIPLINE_ORDER.length });

  const active = disciplines[DISCIPLINE_ORDER[index]];

  /**
   * THE COPY DOES NOT TRAVEL - ONLY THE MODEL DOES.
   *
   * `DisciplineStage` slides the 3D model left/right on a step (see `SLOT_AXIS`
   * there). The text panel opposite it stays anchored: on a change the outgoing
   * `DisciplineCopy` leaves in place and the incoming one arrives in place, each
   * running its own site-wide reveal (fade + blur + Y) keyed on its `active`
   * prop. Six panels share one grid cell and never move, which is also the
   * section's SEO argument - all six are always in the DOM.
   *
   * So there is no horizontal push on the copy to write here. Removing it is the
   * whole point: the model glides, the words resolve in place.
   */

  /**
   * The first model, fetched a viewport and a half before the section arrives - see
   * `observeFirstModel`. Deliberately not a module-scope `useGLTF.preload`, which would
   * start the download the moment this file is imported, i.e. during the page's own load,
   * competing with LCP for a section that sits above the footer.
   *
   * Gated on `renders3D`: a client on Save-Data or without WebGL never renders a GLB, so
   * fetching one for it would be the exact network waste the fallback exists to avoid.
   */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !renders3D) return;
    const observer = observeFirstModel(section, 0);
    return () => observer.disconnect();
  }, [renders3D]);

  /**
   * Neighbours on idle. Keyed on the settled index rather than on the step, so a run of
   * quick steps schedules one prefetch at the end instead of one per panel passed through.
   */
  useEffect(() => {
    if (!renders3D) return;
    const handle = prefetchNeighbours(index);
    return () => handle.cancel();
  }, [index, renders3D]);

  /**
   * The environment's colours are read from CSS variables OUTSIDE `<Canvas>` and
   * passed in as props. Memoised on the theme, not held in state: `getComputedStyle`
   * is a read with no side effects, and keeping it out of state means the server
   * and the client render the same tree - the value is `null` where there is no
   * document, and the environment simply waits. The identity has to be stable
   * because `createDisciplineEnvironment` runs a PMREM pass, and that must not
   * happen once per render.
   */
  const colors: EnvironmentColors | null = useMemo(
    () => readEnvironmentColors(theme),
    [theme]
  );

  return (
    <section
      ref={sectionRef}
      className="site-gutter disciplines relative theme-section py-24 transition-theme"
    >
      <div className="site-container">
        <header className="mb-14 flex max-w-3xl flex-col gap-4">
          <span className="font-broken-console text-xs uppercase tracking-[0.4em] text-cyan-400">
            {SECTION_KICKER}
          </span>
          <h2 className="text-3xl text-theme-primary md:text-4xl lg:text-5xl">
            {SECTION_TITLE}
          </h2>
          <p className="text-base text-theme-muted md:text-lg">{SECTION_LEDE}</p>
        </header>

        {reduced ? (
          /*
            REDUCED MOTION, SAVE-DATA, LOW BATTERY: a plain vertical list of six.
            No canvas, no still, no stepper, and - because `columnRef` is never attached
            to anything - no wheel listener either. Every panel is active, so every panel
            is readable and every CTA is in the tab order, which is what makes this a
            usable list rather than a carousel with its controls taken away.
          */
          <ol className="discipline-copy-list">
            {DISCIPLINE_ORDER.map((key) => (
              <li key={key}>
                <DisciplineCopy discipline={disciplines[key]} active />
              </li>
            ))}
          </ol>
        ) : (
          <div
            className="discipline-slider"
            aria-roledescription="carousel"
            aria-label={SECTION_TITLE}
          >
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              {/*
                The capture region, and deliberately only this. The wheel listener, the
                arrow keys and the touch swipe all hang off this element, so a cursor
                over the headline, the lede or the CTA never meets a listener at all
                and the page scrolls on towards the footer.
              */}
              <div
                ref={columnRef}
                tabIndex={0}
                role="group"
                aria-label="Discipline model. Use the arrow keys or the mouse wheel to change discipline."
                className="discipline-column"
              >
                {/*
                  The box, reserved by `aspect-ratio` before a single byte of model or image
                  is requested - so nothing below it moves when either lands, in any of the
                  three branches inside it. `role="img"` with a label that changes with the
                  model is the HeroCube pattern: what is inside is a picture to a screen
                  reader, whichever way it was drawn.
                */}
                <div
                  role="img"
                  aria-label={`${active.title} shown as a 3D device`}
                  className="discipline-viewport"
                >
                  {renders3D ? (
                    <DisciplineStage
                      index={index}
                      direction={direction}
                      colors={colors}
                      theme={theme}
                    />
                  ) : null}
                  {showsStill ? <DisciplineStill index={index} /> : null}
                </div>

                {/*
                  Mounted with the stage, armed until the visitor touches
                  anything. The two are separate on purpose: unmounting is what
                  resets the hint's clock, and it may only happen while the
                  section is off screen - disarming while it is on screen has to
                  leave the pill in place long enough to fade out.
                */}
                {stageVisible ? <DisciplineHint armed={!interacted} /> : null}
              </div>

              {/*
                All six panels, always. They share one grid cell, so the tallest holds
                the height and nothing jumps on a change, and the inactive five are
                hidden with plain `opacity` plus `inert` - never `display:none`, never
                conditionally mounted, which is the whole SEO argument for the section.

                The panels never travel: on a change the outgoing one leaves and the
                incoming one arrives IN PLACE, each on its own reveal inside
                `DisciplineCopy` (keyed on `active`). Only the 3D model slides.
              */}
              <div className="discipline-copy-stack">
                {DISCIPLINE_ORDER.map((key, position) => (
                  <div key={key} className="discipline-slide">
                    <DisciplineCopy
                      discipline={disciplines[key]}
                      active={position === index}
                    />
                  </div>
                ))}
              </div>
            </div>

            <DisciplineStepper index={index} onStep={step} onSelect={goTo} />
          </div>
        )}
      </div>

      {/*
        The third SEO signal, after the copy itself and the six real `<Link>`s: the
        `ItemList` graph, handed down from the server component in `DisciplinesSection.tsx`.
        Inside the section rather than in the page head, so it travels with the component -
        and `LanguageProvider` skips `SCRIPT`, so the graph stays in English no matter which
        language the page is showing, which is what schema.org consumers expect.
      */}
      {children}
    </section>
  );
}
