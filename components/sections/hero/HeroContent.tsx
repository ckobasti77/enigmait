"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CtaButton from "@/components/ui/cta-button";
import { useLanguage } from "@/app/_components/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { translateText } from "@/lib/i18n";
import { HERO_REVEAL_DURATION, HERO_TITLE_SHARE } from "./heroTiming";

const TITLE = "One line. Everything connected.";

const TITLE_WINDOW = HERO_REVEAL_DURATION * HERO_TITLE_SHARE;
// Each word takes this long to arrive; the starts are spread across what is left
// of the headline's window, so the last word lands on TITLE_WINDOW whatever the
// word count of the active language.
const WORD_DURATION = 0.5;
// The lede and the buttons trail the words and finish exactly on
// HERO_REVEAL_DURATION - the same instant the cube closes its line.
const LEDE_START = HERO_REVEAL_DURATION * 0.45;
const ACTIONS_START = HERO_REVEAL_DURATION * 0.6;
const TAIL_DURATION = HERO_REVEAL_DURATION - ACTIONS_START;

const NOSCRIPT_FALLBACK =
  ".hero-reveal-word,.hero-reveal-lede,.hero-reveal-actions{opacity:1}";

export function HeroContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { locale } = useLanguage();

  // Translated here rather than by LanguageProvider's DOM walker: the walker
  // matches whole text nodes, and one word per span leaves it nothing to match.
  // The h1 opts out of the walker with data-no-translate.
  //
  // Split on sentence ends, not on a hard-coded break: the headline is two
  // sentences and each one owns a line, in whatever language. The break is
  // structural (a block per sentence) rather than a `<br>`, so a sentence that
  // is too wide still wraps inside its own line instead of overflowing.
  const lines = translateText(TITLE, locale)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .map((line) => line.split(" "));

  useGSAP(
    () => {
      const wordEls = gsap.utils.toArray<HTMLElement>(".hero-reveal-word");
      const tailEls = gsap.utils.toArray<HTMLElement>(
        ".hero-reveal-lede, .hero-reveal-actions"
      );

      if (prefersReducedMotion) {
        gsap.set([...wordEls, ...tailEls], {
          autoAlpha: 1,
          filter: "none",
          willChange: "auto",
          y: 0,
          yPercent: 0,
        });
        return;
      }

      const stagger =
        wordEls.length > 1
          ? (TITLE_WINDOW - WORD_DURATION) / (wordEls.length - 1)
          : 0;

      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () =>
            gsap.set(wordEls, { clearProps: "filter,willChange" }),
        })
        .fromTo(
          wordEls,
          { autoAlpha: 0, filter: "blur(9px)", yPercent: 26 },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            yPercent: 0,
            duration: WORD_DURATION,
            // Shuffled arrival, the way anthropic.com brings a headline in: the
            // line assembles out of order instead of typing left to right.
            stagger: { each: stagger, from: "random" },
          },
          0
        )
        .fromTo(
          ".hero-reveal-lede",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: TAIL_DURATION },
          LEDE_START
        )
        .fromTo(
          ".hero-reveal-actions",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: TAIL_DURATION },
          ACTIONS_START
        );
    },
    {
      // Switching language rebuilds the words, so the reveal replays rather than
      // leaving fresh spans stuck at the CSS starting opacity.
      dependencies: [locale, prefersReducedMotion],
      revertOnUpdate: true,
      scope: rootRef,
    }
  );

  return (
    <div
      ref={rootRef}
      className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center lg:mx-0 lg:items-start lg:text-left"
      // The site-wide reveal stays out of the hero: this timeline is tied to
      // the cube's clock and already owns every opacity in here.
      data-reveal="off"
    >
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NOSCRIPT_FALLBACK }} />
      </noscript>

      <h1
        className="text-3xl text-theme-primary md:text-4xl lg:text-5xl"
        data-no-translate="true"
      >
        {lines.map((words, lineIndex) => (
          <span className="block" key={`${locale}-line-${lineIndex}`}>
            {words.map((word, index) => (
              // The separator sits outside the span on purpose: a trailing
              // space inside an inline-block collapses and the line would lose
              // its gaps.
              <Fragment key={`${locale}-${lineIndex}-${index}`}>
                <span className="hero-reveal-word">{word}</span>
                {index < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
        ))}
      </h1>

      <p className="hero-reveal-lede max-w-lg text-base leading-relaxed text-theme-muted md:text-lg">
        Product, engineering and design as one continuous system - not three
        vendors.
      </p>

      <div className="hero-reveal-actions flex flex-wrap items-center gap-4 pt-2">
        <CtaButton href="/contact" text="Start a project" size="lg" />
        <CtaButton
          href="/projects"
          text="See our work"
          variant="secondary"
          size="lg"
        />
      </div>
    </div>
  );
}
