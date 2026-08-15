"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";

import { useTheme } from "@/app/_components/ThemeProvider";
import ProjectMockupCluster from "@/components/ui/project-mockup-cluster";
import { projects } from "@/constants/projects";
import {
  LAYOUT_NARROW,
  LAYOUT_SPLIT,
  LAYOUT_WIDE,
  NARROW_QUERY,
  SPLIT_QUERY,
  TEXTURE_WINDOW,
} from "@/constants/projectShowcase3D";
import { SWIPE_DOMINANCE, SWIPE_THRESHOLD_PX } from "@/components/sections/disciplines/disciplinesTiming";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

import ProjectShowcaseCopy from "./ProjectShowcaseCopy";
import ProjectShowcaseStage from "./ProjectShowcaseStage";
import ProjectShowcaseStepper from "./ProjectShowcaseStepper";
import { loadProject, prefetchNeighbours, releaseAllProjects } from "./projectScreenTextures";
import { useProjectIndex } from "./useProjectIndex";
import { useProjectShowcaseVideo } from "./useProjectShowcaseVideo";

const COUNT = projects.length;
const wrap = (index: number) => ((index % COUNT) + COUNT) % COUNT;

/**
 * Vitrina projekata: jedna 3D scena sa četiri uređaja, i slajder ispod nje.
 *
 * TRI GRANE, JEDAN OKVIR. Dok `useWebGLSupport()` ne odgovori (`null` na serveru i
 * kroz hidraciju) ne montira se ništa - isti trik koji `Disciplines.tsx`
 * dokumentuje, i jedini način da ovde ne bude neslaganja u hidraciji. Kad
 * odgovori: 3D, ili CSS klaster iz `components/ui/project-mockup-cluster.tsx` za
 * `prefers-reduced-motion` i mašine bez WebGL-a. Prostor drži `.project-viewport`
 * iz CSS-a u sve tri, pa nema pomeranja rasporeda.
 *
 * `children` je server-renderovan SEO blok. Isti razlog kao u
 * `DisciplinesSection.tsx`: ovo je klijentska komponenta od prve linije, pa
 * markup koji mora da bude u serviranom HTML-u pravi strana i predaje ga ovamo.
 */
export default function ProjectShowcase({ children }: { children?: ReactNode }) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const webglSupported = useWebGLSupport();
  const narrow = useMediaQuery(NARROW_QUERY);
  /**
   * Tri preseta, dve linije preloma, i obe su iste one koje koristi CSS: ispod
   * 768 portretni klaster, od 1024 kadar pomeren ulevo da tekst dobije mesto
   * desno, između njih centriran kadar sa tekstom ispod. Ako se ove dve
   * vrednosti raziđu od `globals.css`, tekst sedne na neki od uređaja.
   */
  const split = useMediaQuery(SPLIT_QUERY);
  const layout = narrow ? LAYOUT_NARROW : split ? LAYOUT_SPLIT : LAYOUT_WIDE;

  const { ref: viewportRef, isIntersecting } = useIntersectionActive<HTMLDivElement>({
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

  const settled = webglSupported !== null;
  const renders3D = settled && !prefersReducedMotion && webglSupported;
  const showsFallback = settled && !renders3D;

  const animated = isIntersecting && documentVisible;

  /**
   * Snimci sledećeg projekta moraju da postoje pre nego što tween krene - uređaj
   * bez teksture je rupa u kućištu. Prefetch drži susede toplim, pa se ovo za
   * strelicu i swipe rešava u istom mikrotasku; čeka se samo skok na udaljenu
   * tačku.
   */
  const prepare = useCallback(
    (index: number) => loadProject(index),
    []
  );

  const { index, move, activeIndex, sliding, goTo, step } = useProjectIndex({
    count: COUNT,
    animate: renders3D && animated,
    prepare: renders3D ? prepare : undefined,
  });

  const project = projects[index];
  const activeProject = projects[activeIndex];

  // Video svira samo kad je slika mirna: `media` se menja tačno na settle-u, pa
  // su zamena izvora i povratak u kadar isti trenutak.
  const { setVideo, video, playing } = useProjectShowcaseVideo(
    renders3D ? project.media : null,
    renders3D && animated && !sliding
  );

  useEffect(() => {
    if (!renders3D) return;
    const handle = prefetchNeighbours(index);
    return () => handle.cancel();
  }, [index, renders3D]);

  useEffect(() => {
    if (!renders3D) return;
    return () => releaseAllProjects();
  }, [renders3D]);

  /* --- Swipe --------------------------------------------------------------- */

  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    // `touch-action: pan-y pinch-zoom` na sceni ostavlja vertikalni gest i pinch
    // browseru, pa ovde stiže već bočni deo - ništa se ne otima skrolu strane.
    if (Math.abs(dx) <= Math.abs(dy) * SWIPE_DOMINANCE) return;

    // Ulevo je napred, kako se slajder kreće pod palcem.
    step(dx < 0 ? 1 : -1);
  };

  /* --- Fallback ------------------------------------------------------------ */

  /**
   * Prozor od tri klastera, ukršteni prelazom - nikad remount. Korak tako menja
   * dve već dekodovane slike umesto da pokrene fetch, što je jedini način da
   * kontrole u fallback-u budu stvarno instant.
   */
  const fallbackWindow = Array.from(
    { length: TEXTURE_WINDOW * 2 + 1 },
    (_, offset) => wrap(index + offset - TEXTURE_WINDOW)
  );

  return (
    <section
      className="site-gutter theme-section relative overflow-hidden py-14 transition-theme md:py-16"
      aria-roledescription="carousel"
      aria-label="Projekti"
    >
      <div className="site-container flex flex-col gap-5">
        {/* Scena i tekst dele jedan pozicioni kontekst: od `lg` naviše tekst
            stoji PREKO scene, u praznini koju kadar namerno ostavlja desno (vidi
            `LAYOUT_SPLIT`). Ispod `lg` isti blok pada pod scenu, jer u portretnom
            kadru te praznine nema. */}
        <div className="project-stage">
        <div
          ref={viewportRef}
          className="project-viewport"
          role="img"
          // Statično, ne sastavljeno sa naslovom: `LanguageProvider` prevodi
          // `aria-label` kao celinu, pa bi string sa naslovom u sebi promašio
          // svaki par u `lib/i18n.ts`. Koji je projekat u kadru čita se iz naslova
          // ispod scene, koji je pravi tekst i ima svoj par.
          aria-label="Projekat prikazan na četiri uređaja"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {renders3D ? (
            <ProjectShowcaseStage
              index={index}
              move={move}
              layout={layout}
              theme={theme}
              animated={animated}
              videoElement={video}
              videoPlaying={playing}
            />
          ) : null}

          {showsFallback
            ? fallbackWindow.map((position) => (
                <div
                  key={projects[position].id}
                  className="project-fallback"
                  data-active={position === index ? "true" : undefined}
                  inert={position !== index}
                >
                  <ProjectMockupCluster
                    projectId={projects[position].id}
                    media={projects[position].media}
                    monogram={projects[position].monogram}
                    stills
                  />
                </div>
              ))
            : null}
        </div>

          <ProjectShowcaseCopy project={activeProject} />
        </div>

        <ProjectShowcaseStepper
          activeIndex={activeIndex}
          onStep={step}
          onSelect={goTo}
        />
      </div>

      {/*
        Video ide u DOM, ne u odvojen element: Safari odbija inline dekodiranje za
        `<video>` van dokumenta. `opacity: 0` i 1px, nikad `display: none` ni
        `visibility: hidden` - oba u WebKit-u zaustavljaju dekodiranje, a ovaj
        element postoji isključivo da bi `VideoTexture` imao odakle da čita.
      */}
      {renders3D ? (
        <div aria-hidden className="project-video-host">
          <video
            ref={setVideo}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            disablePictureInPicture
          />
        </div>
      ) : null}

      {children}
    </section>
  );
}
