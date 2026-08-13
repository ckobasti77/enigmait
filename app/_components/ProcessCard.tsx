"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ProcessIcon } from "@/components/ui/process-icons";
import {
  buildBorderTracePaths,
  TRACE_LENGTH,
  type BorderTraceEntry,
} from "@/lib/borderTrace";
import { restoreWords, splitWords, type Split } from "@/lib/textReveal";
import type { ProcessCardPosition, ProcessStep } from "@/constants/processSteps";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLanguage } from "./LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Matches `--process-card-radius`; the trace has to follow the same corner.
 * That variable now reads the site-wide `--surface-radius` (14px, the CTA's
 * corner).
 */
const CARD_RADIUS = 14;

/**
 * Where the connector lands on a side edge, in border-box pixels from the top:
 * the seam between image and body. Matches `--process-media-h` (12rem) plus the
 * shell's 1px border - change one and the streaks split away from the line the
 * connector visibly hits.
 */
const TRACE_ENTRY_Y = 193;

/** Streak length, in the same normalised units the paths are rendered at. */
const TRACE_DASH = TRACE_LENGTH * 0.17;

/** The card is only allowed off the spine's centre line from here up. */
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * The card's centre a third of the way up from the bottom edge - so the unlock
 * runs while the card is still travelling into view. Waiting for dead centre
 * meant the reader had scrolled past before the sequence finished.
 */
const TRIGGER_START = "center 67%";

/**
 * One knob for the whole chain. The choreography - node, key, trace, copy - is
 * written at a readable tempo and then played faster, so the overlaps stay
 * exactly as authored instead of drifting apart duration by duration.
 */
const SEQUENCE_SPEED = 3;

type ProcessCardProps = {
  step: ProcessStep;
  position: ProcessCardPosition;
};

/**
 * The entry edge is the side the spine is on, so the streaks always launch from
 * the point the connector lands on. Below `lg` every card straddles the spine
 * and the connector drops in from above.
 */
const entryFor = (
  position: ProcessCardPosition,
  isDesktop: boolean
): BorderTraceEntry => {
  if (!isDesktop || position === "center") return "top";
  return position === "left" ? "right" : "left";
};

/** Where the connector grows *from* - the spine end, never the card end. */
const connectorOrigin: Record<BorderTraceEntry, string> = {
  top: "50% 0%",
  left: "0% 50%",
  right: "100% 50%",
};

const scalePropFor = (entry: BorderTraceEntry) =>
  entry === "top" ? "scaleY" : "scaleX";

export default function ProcessCard({ step, position }: ProcessCardProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  /** Live for as long as the copy is in word spans; see `lib/textReveal.ts`. */
  const splitsRef = useRef<Array<[HTMLElement, Split]>>([]);
  const restoreRef = useRef<() => void>(() => {});
  /** Survives timeline rebuilds so a resize does not re-lock an opened card. */
  const openedRef = useRef(false);

  // The unlock is a one-shot entrance and it is the section's whole point, so
  // it follows the OS preference only. Folding a low battery into this gate
  // deleted the animation outright on any laptop under 20%.
  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });
  const { locale } = useLanguage();
  const localeRef = useRef(locale);

  const [isDesktop, setIsDesktop] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  /** Bumped after a language switch to force a fresh split. */
  const [splitEpoch, setSplitEpoch] = useState(0);

  const entry = entryFor(position, isDesktop);

  const tracePaths = useMemo(
    () =>
      buildBorderTracePaths(
        size.width,
        size.height,
        CARD_RADIUS,
        entry,
        entry === "top" ? undefined : TRACE_ENTRY_Y
      ),
    [size.width, size.height, entry]
  );

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // The trace is drawn in the card's own pixel space, so it has to be measured
  // rather than derived: the card is fluid below `lg` and fixed above it.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const observer = new ResizeObserver(([record]) => {
      // Border box, not content box: the trace is drawn *on* the border, and a
      // content-box viewBox is two pixels narrow - enough to push a 1px stroke
      // off the corner it is supposed to follow.
      const box = record.borderBoxSize?.[0];
      const width = box ? box.inlineSize : record.contentRect.width;
      const height = box ? box.blockSize : record.contentRect.height;

      setSize((current) =>
        Math.abs(current.width - width) < 0.5 &&
        Math.abs(current.height - height) < 0.5
          ? current
          : { width, height }
      );
    });

    observer.observe(shell, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    const title = titleRef.current;
    const text = textRef.current;

    if (!row || !title || !text) return;

    // Nothing is hidden by CSS, so opting out is just declining to stage it:
    // the card is already in its finished state.
    if (prefersReducedMotion) return;

    // Nothing to trace until the card has been measured.
    if (!size.width || !size.height) return;

    const splits: Array<[HTMLElement, Split]> = [];
    for (const element of [title, text] as HTMLElement[]) {
      const split = splitWords(element);
      if (split) splits.push([element, split]);
    }
    splitsRef.current = splits;

    const restore = () => {
      for (const [element, split] of splitsRef.current) {
        restoreWords(element, split);
        gsap.set(element, { clearProps: "all" });
      }
      splitsRef.current = [];
    };
    restoreRef.current = restore;

    const titleWords = splits.find(([el]) => el === title)?.[1].words ?? [title];
    const textWords = splits.find(([el]) => el === text)?.[1].words ?? [text];

    const scaleProp = scalePropFor(entry);

    const ctx = gsap.context(() => {
      const veil = ".process-card-veil";
      const node = ".process-node";
      const connector = ".process-connector";
      const traces = ".process-trace-path";
      const image = ".process-card-img";
      const icon = ".process-card-icon";

      gsap.set(veil, { autoAlpha: 0.24, filter: "blur(5px)" });
      gsap.set(node, { scale: 0, autoAlpha: 0, rotate: 45 });
      gsap.set(connector, {
        [scaleProp]: 0,
        autoAlpha: 0,
        transformOrigin: connectorOrigin[entry],
      });
      gsap.set(traces, { strokeDashoffset: TRACE_DASH, autoAlpha: 0 });
      gsap.set(image, {
        scale: 1.12,
        autoAlpha: 0.5,
        filter: "saturate(0.3) blur(2px)",
      });
      gsap.set(icon, { scale: 0.7, autoAlpha: 0, rotate: -14 });
      gsap.set([...titleWords, ...textWords], {
        autoAlpha: 0,
        yPercent: 26,
        filter: "blur(8px)",
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      timeline.timeScale(SEQUENCE_SPEED);

      timeline
        // 1. the spine puts a node down where the card will be unlocked
        .to(node, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.34,
          ease: "back.out(2.4)",
        })
        // 2. the key travels out to the card
        .to(connector, { autoAlpha: 1, duration: 0.12 }, "<")
        .to(
          connector,
          { [scaleProp]: 1, duration: 0.44, ease: "power2.inOut" },
          "<"
        )
        // 3. it lands, splits, and both halves run the border to the far side
        .to(traces, { autoAlpha: 1, duration: 0.08 }, ">-0.05")
        .to(
          traces,
          {
            // Past the end of the path the streak is clipped away entirely, so
            // it arrives at the meeting point and vanishes there rather than
            // needing a fade of its own.
            strokeDashoffset: -TRACE_LENGTH,
            duration: 1.05,
            ease: "power1.inOut",
          },
          "<"
        )
        // 4. everything on the card comes up inside that trace
        .to(veil, { autoAlpha: 1, filter: "blur(0px)", duration: 0.85 }, "<0.1")
        .to(
          image,
          {
            scale: 1,
            autoAlpha: 1,
            filter: "saturate(1) blur(0px)",
            duration: 1.1,
          },
          "<"
        )
        .to(
          titleWords,
          {
            autoAlpha: 1,
            yPercent: 0,
            filter: "blur(0px)",
            duration: 0.6,
            stagger: { amount: 0.3, from: "random" },
          },
          "<0.16"
        )
        .to(
          textWords,
          {
            autoAlpha: 1,
            yPercent: 0,
            filter: "blur(0px)",
            duration: 0.55,
            stagger: { amount: 0.42, from: "random" },
          },
          "<0.12"
        )
        .to(
          icon,
          {
            scale: 1,
            autoAlpha: 1,
            rotate: 0,
            duration: 0.5,
            ease: "back.out(1.8)",
          },
          "<0.04"
        )
        // 5. the key settles back to a hairline once it has done its job
        .to(connector, { autoAlpha: 0.75, duration: 0.5 }, "<");

      ScrollTrigger.create({
        trigger: row,
        start: TRIGGER_START,
        onEnter: () => {
          openedRef.current = true;
          timeline.play();
        },
        onLeaveBack: () => {
          openedRef.current = false;
          timeline.reverse();
        },
      });

      // A resize rebuilds this timeline from scratch; a card that had already
      // been unlocked must not drop back to its locked state behind the reader.
      if (openedRef.current) timeline.progress(1).pause();
    }, row);

    return () => {
      ctx.revert();
      restore();
      restoreRef.current = () => {};
    };
  }, [entry, prefersReducedMotion, size.width, size.height, splitEpoch]);

  // `LanguageProvider` translates whole text nodes and this card is a
  // descendant of it, so React runs this effect first: the copy is whole again
  // before the walker upstairs looks at it. The epoch bump re-splits on the
  // next commit, which is after the walk.
  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;

    restoreRef.current();
    setSplitEpoch((epoch) => epoch + 1);
  }, [locale]);

  return (
    <div
      className="process-row"
      data-position={position}
      ref={rowRef}
      style={
        {
          "--card-accent": step.accent,
          "--card-glow": step.glow,
        } as CSSProperties
      }
    >
      <span aria-hidden className="process-node" />
      <span aria-hidden className="process-connector" />

      <article
        aria-label={`${step.number}. ${step.title}`}
        className="process-card group"
        data-reveal="off"
      >
        <div className="process-card-veil">
          <div aria-hidden className="process-card-halo" />

          <div className="process-card-shell" ref={shellRef}>
            <div aria-hidden className="process-card-sheen" />
            <div aria-hidden className="process-card-hairline" />

            <div className="process-card-media">
              <Image
                alt=""
                className="process-card-img object-cover"
                fill
                sizes="(max-width: 1024px) calc(100vw - 2rem), 440px"
                src={step.imageSrc}
                style={{ objectPosition: "center 38%" }}
              />
              <div aria-hidden className="process-card-scrim" />
              <div aria-hidden className="process-card-media-glow" />
            </div>

            <div className="process-card-body">
              <div className="process-card-copy">
                <h3 className="process-card-title font-accent" ref={titleRef}>
                  {step.title}
                </h3>
                <p className="process-card-text" ref={textRef}>
                  {step.description}
                </p>
              </div>

              <span aria-hidden className="process-card-icon">
                <ProcessIcon className="h-5 w-5" name={step.icon} />
              </span>
            </div>
          </div>
        </div>

        {tracePaths[0] ? (
          <svg
            aria-hidden
            className="process-trace"
            focusable="false"
            viewBox={`0 0 ${size.width} ${size.height}`}
          >
            {tracePaths.map((d, index) => (
              <path
                className="process-trace-path"
                d={d}
                key={index}
                pathLength={TRACE_LENGTH}
                style={{ strokeDasharray: `${TRACE_DASH} ${TRACE_LENGTH}` }}
              />
            ))}
          </svg>
        ) : null}
      </article>
    </div>
  );
}
