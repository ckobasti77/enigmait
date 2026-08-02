"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import clsx from "clsx";

import { disciplineHref, type Discipline } from "@/constants/disciplines";
import CtaButton from "@/components/ui/cta-button";
import { useLanguage } from "@/app/_components/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { TEXT_REVEAL } from "@/constants/textRevealConfig";
import { restoreWords, splitWords, type Split } from "@/lib/textReveal";
import {
  COPY_CTA_START,
  COPY_ENTER_EASE,
  COPY_EXIT_DURATION,
  COPY_EXIT_EASE,
  COPY_EXIT_Y,
  COPY_KICKER_BLUR,
  COPY_KICKER_DURATION,
  COPY_KICKER_STAGGER_EACH,
  COPY_KICKER_STAGGER_MAX,
  COPY_KICKER_START,
  COPY_KICKER_Y,
  COPY_KICKER_Y_PERCENT,
  COPY_LEDE_BLUR,
  COPY_LEDE_DURATION,
  COPY_LEDE_STAGGER_EACH,
  COPY_LEDE_STAGGER_MAX,
  COPY_LEDE_START,
  COPY_LEDE_Y,
  COPY_LEDE_Y_PERCENT,
  COPY_TITLE_BLUR,
  COPY_TITLE_DURATION,
  COPY_TITLE_STAGGER_EACH,
  COPY_TITLE_STAGGER_MAX,
  COPY_TITLE_START,
  COPY_TITLE_Y_PERCENT,
  COPY_WORD_EASE,
} from "./disciplinesTiming";

type DisciplineCopyProps = {
  discipline: Discipline;
  /** False panels stay in the DOM and go `inert` - never `display:none`, never unmounted. */
  active?: boolean;
  className?: string;
};

/**
 * The text panel for one discipline: kicker, title, lede, CTA.
 *
 * Six of these are in the DOM at once, which is why the inactive ones are hidden
 * with plain `opacity` plus `inert` and nothing else. `display:none`,
 * `visibility:hidden`, conditional mounting and GSAP's `autoAlpha` are all off
 * the table - each of them takes the copy out of the document or out of the
 * accessibility tree, and that copy is the whole SEO argument for the section.
 * `autoAlpha` is the one that looks harmless and is not: it writes
 * `visibility: hidden`. Every opacity below is therefore plain `opacity`, on the
 * word spans too.
 *
 * ARRIVAL IS THE SITE'S REVEAL, AND IT PLAYS EVERY TIME. The panel opts out of
 * the site-wide pass with `data-reveal="off"` and runs its own, because the
 * global controller reveals an element once and is then finished with it - and
 * here the copy is new on every step, including a step back to a discipline the
 * visitor has already seen. Same splitter, same contract with
 * `LanguageProvider`: move the text node, carry `data-no-translate` while it is
 * split, hand it back before the translation walker runs.
 */
export default function DisciplineCopy({
  discipline,
  active = true,
  className,
}: DisciplineCopyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  /** Every element currently split, so a restore never has to go looking. */
  const splitsRef = useRef<Array<{ element: HTMLElement; split: Split }>>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const { locale } = useLanguage();
  // One-shot entrance, so Save-Data and a low battery do not delete it - the OS
  // preference still does. `.claude/rules` calls this out for exactly this case.
  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });

  /**
   * The first panel must not play to an empty room. The section is the last one
   * before the footer, so at mount it is far below the fold; without this its
   * arrival would run and finish long before anyone scrolled to it, and the
   * visitor would meet copy that had already landed. Same trigger the site-wide
   * controller uses - `enterRatio` into the viewport, not the instant it clips
   * the fold - so the two agree on what "arrived" means.
   */
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      {
        rootMargin: `0px 0px -${Math.round(TEXT_REVEAL.enterRatio * 100)}% 0px`,
        threshold: 0,
      }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    const kicker = kickerRef.current;
    const lede = ledeRef.current;
    const cta = ctaRef.current;
    if (!root || !title || !kicker || !lede || !cta) return;

    timelineRef.current?.kill();
    timelineRef.current = null;

    /**
     * Hand every split line its original text node back. Called the moment the
     * arrival finishes rather than being held until the panel leaves: a split
     * element carries `data-no-translate`, and copy that stays split is copy
     * the language switch cannot reach.
     */
    const release = () => {
      const splits = splitsRef.current;
      if (!splits.length) return;
      splitsRef.current = [];

      for (const { element, split } of splits) {
        restoreWords(element, split);
        gsap.set(element, { clearProps: "opacity,transform,filter,willChange" });
      }
    };

    if (!active) {
      release();
      if (prefersReducedMotion) {
        gsap.set(root, { opacity: 0, y: 0 });
        return;
      }

      const exit = gsap.timeline().to(root, {
        opacity: 0,
        y: COPY_EXIT_Y,
        duration: COPY_EXIT_DURATION,
        ease: COPY_EXIT_EASE,
        // The panel is coming back one day and has to come back from zero, not
        // from wherever it left.
        onComplete: () => gsap.set(root, { y: 0 }),
      });

      timelineRef.current = exit;
      return () => {
        exit.kill();
      };
    }

    if (prefersReducedMotion) {
      release();
      gsap.set(root, { opacity: 1, y: 0 });
      gsap.set([kicker, title, lede, cta], { opacity: 1, y: 0 });
      return;
    }

    // Staged and holding. The panel itself is up so its height is real; the four
    // pieces inside it are where the arrival starts from.
    gsap.set(root, { opacity: 1, y: 0 });
    gsap.set([kicker, title, lede, cta], { opacity: 0 });

    if (!inView) return;

    const timeline = gsap.timeline({ onComplete: release });

    /**
     * One line of copy, word by word. Falls back to moving the line as a single
     * piece when there is nothing to split (no text, or past the splitter's word
     * cap) - the line still arrives, it just arrives whole.
     */
    const arrive = (
      element: HTMLElement,
      settings: {
        start: number;
        duration: number;
        blur: number;
        yPercent: number;
        staggerEach: number;
        staggerMax: number;
        fallbackY: number;
      }
    ) => {
      const split = splitWords(element);

      if (!split) {
        timeline.fromTo(
          element,
          { opacity: 0, y: settings.fallbackY },
          {
            opacity: 1,
            y: 0,
            duration: settings.duration,
            ease: COPY_ENTER_EASE,
          },
          settings.start
        );
        return;
      }

      splitsRef.current.push({ element, split });

      // The line stops being hidden; its words carry the arrival. Plain
      // `opacity`, never `autoAlpha` - see the note at the top of this file.
      gsap.set(element, { opacity: 1 });
      timeline.fromTo(
        split.words,
        {
          opacity: 0,
          filter: `blur(${settings.blur}px)`,
          yPercent: settings.yPercent,
          willChange: "opacity, transform, filter",
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: settings.duration,
          ease: COPY_WORD_EASE,
          // Out of order, and spread over a fixed total rather than a fixed
          // per-word gap, so a three-word line and a twenty-word one finish
          // together and the panel takes the same time in both languages.
          stagger: {
            amount: Math.min(
              settings.staggerMax,
              settings.staggerEach * Math.max(split.words.length - 1, 0)
            ),
            from: "random",
          },
          // Blur and the layer hint are per-word costs with nothing left to buy
          // once the line has landed.
          clearProps: "filter,willChange,transform",
        },
        settings.start
      );
    };

    arrive(title, {
      start: COPY_TITLE_START,
      duration: COPY_TITLE_DURATION,
      blur: COPY_TITLE_BLUR,
      yPercent: COPY_TITLE_Y_PERCENT,
      staggerEach: COPY_TITLE_STAGGER_EACH,
      staggerMax: COPY_TITLE_STAGGER_MAX,
      fallbackY: COPY_LEDE_Y,
    });

    arrive(kicker, {
      start: COPY_KICKER_START,
      duration: COPY_KICKER_DURATION,
      blur: COPY_KICKER_BLUR,
      yPercent: COPY_KICKER_Y_PERCENT,
      staggerEach: COPY_KICKER_STAGGER_EACH,
      staggerMax: COPY_KICKER_STAGGER_MAX,
      fallbackY: COPY_KICKER_Y,
    });

    arrive(lede, {
      start: COPY_LEDE_START,
      duration: COPY_LEDE_DURATION,
      blur: COPY_LEDE_BLUR,
      yPercent: COPY_LEDE_Y_PERCENT,
      staggerEach: COPY_LEDE_STAGGER_EACH,
      staggerMax: COPY_LEDE_STAGGER_MAX,
      fallbackY: COPY_LEDE_Y,
    });

    // The one piece that stays a block: a button that assembles itself out of
    // words reads as copy, and this is a control.
    timeline.fromTo(
      cta,
      { opacity: 0, y: COPY_LEDE_Y },
      {
        opacity: 1,
        y: 0,
        duration: COPY_LEDE_DURATION,
        ease: COPY_ENTER_EASE,
      },
      COPY_CTA_START
    );

    timelineRef.current = timeline;
    return () => {
      timeline.kill();
      release();
    };
  }, [active, inView, prefersReducedMotion]);

  /**
   * `LanguageProvider` translates whole text nodes, so every split line has to
   * be whole again before its walker runs. React runs this child effect before
   * the provider's own, which is the only reason this works - see
   * `TextRevealGlobal`, which owes the site the same debt.
   */
  const localeRef = useRef(locale);
  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;

    const splits = splitsRef.current;
    if (!splits.length) return;

    timelineRef.current?.kill();
    splitsRef.current = [];

    for (const { element, split } of splits) {
      restoreWords(element, split);
      gsap.set(element, { clearProps: "opacity,transform,filter,willChange" });
    }
  }, [locale]);

  return (
    <div
      ref={rootRef}
      // `data-reveal="off"` is not decoration: it is what stops the site-wide
      // controller from claiming this copy, so the panel can reveal it again on
      // every arrival instead of once per page load.
      data-reveal="off"
      className={clsx(
        "discipline-panel flex flex-col items-start gap-5",
        active ? "opacity-100" : "pointer-events-none opacity-0",
        className
      )}
      inert={!active}
    >
      <span
        ref={kickerRef}
        className="font-broken-console text-xs uppercase tracking-[0.4em] text-cyan-400"
      >
        {discipline.kicker}
      </span>

      {/*
        `h3`, under the section's own `h2`. Six sibling `h2`s inside a section with no
        heading of its own is a flat outline that says these six are peers of the section
        rather than its contents - and the section IS a list of six, which is also what the
        `ItemList` says. `.heading-display` because the Microgramma rule in `globals.css`
        only reaches `h1` and `h2` automatically; the face is unchanged, only the level is.
      */}
      <h3
        ref={titleRef}
        className="heading-display text-3xl text-theme-primary md:text-4xl"
      >
        {discipline.title}
      </h3>

      <p ref={ledeRef} className="max-w-xl text-base text-theme-muted md:text-lg">
        {discipline.lede}
      </p>

      <div ref={ctaRef} className="mt-2">
        <CtaButton
          href={disciplineHref(discipline.key)}
          // The visible label is the same on all six, so the accessible name has
          // to carry which discipline it leads to.
          aria-label={`See the discipline: ${discipline.title}`}
          text="See the discipline"
        />
      </div>
    </div>
  );
}
