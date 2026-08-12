"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { preloadDiscipline } from "@/components/sections/disciplines/disciplinePrefetch";
import {
  DISCIPLINE_ORDER,
  disciplineHref,
  disciplines,
  type DisciplineKey,
} from "@/constants/disciplines";
import { servicePages } from "@/constants/services";
import { useIntersectionActive } from "@/hooks/useIntersectionActive";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ServiceFaq from "./ServiceFaq";
import ServicePanel from "./ServicePanel";

/**
 * The six service pages as one carousel.
 *
 * THE ROUTE STILL OWNS THE SEO. Each `/services/<slug>/page.tsx` is untouched:
 * a server component that exports `buildServiceMetadata(slug)` and prints the
 * Service + FAQPage + BreadcrumbList JSON-LD into the served HTML. This
 * component is what those pages render *below* that, and it starts on the slug
 * the route handed it. A step sideways is therefore a client-side change of
 * panel, not a navigation - `history.replaceState` keeps the address bar
 * honest without a route transition, because a remount in the middle of a
 * 620ms push is the one thing that would break it.
 *
 * THE PUSH IS THE PROTOTYPE'S, with one change. A stage clips, a track twice
 * its width holds two slots, and the incoming panel shoves the current one out
 * by the width of exactly one slot. What differs is the driver: the prototype
 * forces a reflow between two class writes, which React would fight over; a Web
 * Animations API keyframe states both ends outright, so there is nothing to
 * force and no `transitionend` to guess at.
 *
 * SLIDES ARE KEYED BY SLUG, and that is load-bearing rather than tidy. When the
 * push lands and the track drops back to one slot, React finds the incoming
 * key already mounted and moves that DOM node instead of rebuilding it: the
 * WebGL canvas is not re-created, and the copy the text reveal has just
 * finished revealing is not re-hidden.
 */

/** Matches the prototype's `.track.anim` - 0.62s on a firm ease-out curve. */
const SLIDE_MS = 620;
const SLIDE_EASE = "cubic-bezier(0.65, 0, 0.24, 1)";

/** A compositor animation in a background tab never finishes. This lands it anyway. */
const SETTLE_GRACE_MS = 240;

/** Horizontal travel a touch needs before it counts as a step rather than a scroll. */
const SWIPE_THRESHOLD = 44;

const LENGTH = DISCIPLINE_ORDER.length;

const wrap = (index: number) => ((index % LENGTH) + LENGTH) % LENGTH;

type Move = { target: number; direction: 1 | -1 };

export default function ServiceCarousel({
  initialSlug,
}: {
  initialSlug: DisciplineKey;
}) {
  const [index, setIndex] = useState(() =>
    Math.max(0, DISCIPLINE_ORDER.indexOf(initialSlug))
  );
  const [move, setMove] = useState<Move | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const busyRef = useRef(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // One-shot travel, so the OS preference decides and Save-Data does not.
  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });

  // The arrows are fixed to the viewport edges, so they have to know when the
  // carousel has left it - otherwise they hover over the FAQ and the footer.
  const { ref: stageRef, isIntersecting } = useIntersectionActive<HTMLDivElement>(
    { threshold: 0 }
  );

  const current = DISCIPLINE_ORDER[index];

  /**
   * One slot at rest, two while a push runs. The order is the geometry: the
   * incoming panel has to sit on the side it arrives from.
   */
  const slides: DisciplineKey[] = move
    ? move.direction > 0
      ? [current, DISCIPLINE_ORDER[move.target]]
      : [DISCIPLINE_ORDER[move.target], current]
    : [current];

  /** Where the track sits before the push - and where it sits at rest. */
  const restingTransform =
    move && move.direction < 0 ? "translateX(-50%)" : "translateX(0%)";

  /**
   * The dots follow the destination, not the committed index. The address bar
   * changes the moment the step is asked for, and a control that waits 620ms to
   * agree with it reads as lag rather than as motion.
   */
  const activeIndex = move ? move.target : index;

  const goTo = useCallback(
    (target: number, direction: 1 | -1) => {
      if (busyRef.current || target === index) return;

      // Straight to the History API, never the router: `router.replace` would
      // re-render the route and remount this component mid-push. The existing
      // state object is passed through so Next's own history bookkeeping
      // survives the rewrite.
      window.history.replaceState(
        window.history.state,
        "",
        disciplineHref(DISCIPLINE_ORDER[target])
      );

      if (prefersReducedMotion) {
        setIndex(target);
        return;
      }

      busyRef.current = true;
      setMove({ target, direction });
    },
    [index, prefersReducedMotion]
  );

  const step = useCallback(
    (direction: 1 | -1) => goTo(wrap(index + direction), direction),
    [goTo, index]
  );

  /** A dot takes the short way round, exactly like the prototype's `goto`. */
  const jumpTo = useCallback(
    (target: number) => {
      const forward = wrap(target - index);
      goTo(target, forward <= LENGTH / 2 ? 1 : -1);
    },
    [goTo, index]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!move || !track) return;

    const from = move.direction > 0 ? "translateX(0%)" : "translateX(-50%)";
    const to = move.direction > 0 ? "translateX(-50%)" : "translateX(0%)";

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;

      // Commit first, reset second, and synchronously. The finished animation
      // holds the track at its end offset; drop that hold before React has
      // painted the single-slot layout and the frame in between shows the panel
      // we just left.
      flushSync(() => {
        setIndex(move.target);
        setMove(null);
      });

      animationRef.current?.cancel();
      animationRef.current = null;
      busyRef.current = false;
    };

    const animation = track.animate([{ transform: from }, { transform: to }], {
      duration: SLIDE_MS,
      easing: SLIDE_EASE,
      fill: "forwards",
    });
    animationRef.current = animation;
    animation.addEventListener("finish", settle);

    const timer = window.setTimeout(settle, SLIDE_MS + SETTLE_GRACE_MS);

    return () => {
      window.clearTimeout(timer);
      animation.removeEventListener("finish", settle);
    };
  }, [move]);

  /**
   * Keep the two neighbours warm so a step never opens on an empty model box.
   * Nothing is released: this page mounts one model at a time and the whole
   * six-GLB working set is small - the same call `ServiceModelStage` documents.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      preloadDiscipline(wrap(index + 1));
      preloadDiscipline(wrap(index - 1));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

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

    // The gesture has to be sideways *and* long enough; the page's own scroll
    // owns everything else (`touch-action: pan-y` on the stage says so too).
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;

    step(dx < 0 ? 1 : -1);
  };

  const content = servicePages[current];

  return (
    <>
      {/* The navbar is `fixed` with no spacer, so the section clears it itself -
          the same debt `ServiceHero` used to pay with `py-20 lg:py-28`. */}
      <section
        aria-roledescription="carousel"
        aria-label="Usluge"
        className="service-carousel site-gutter theme-section relative pb-14 pt-24 transition-theme lg:pb-16 lg:pt-28"
      >
        <button
          type="button"
          aria-label="Prethodna usluga"
          className="service-arrow service-arrow--prev"
          data-visible={isIntersecting}
          onClick={() => step(-1)}
          tabIndex={isIntersecting ? 0 : -1}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Sledeća usluga"
          className="service-arrow service-arrow--next"
          data-visible={isIntersecting}
          onClick={() => step(1)}
          tabIndex={isIntersecting ? 0 : -1}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>

        <div className="site-container">
          <div
            ref={stageRef}
            className="service-stage"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={trackRef}
              className="service-track"
              style={{ transform: restingTransform }}
            >
              {slides.map((slug) => (
                <div className="service-slide" key={slug}>
                  <ServicePanel slug={slug} />
                </div>
              ))}
            </div>
          </div>

          <div className="service-dots" role="group" aria-label="Usluge">
            {DISCIPLINE_ORDER.map((slug, position) => (
              <button
                type="button"
                key={slug}
                className="service-dot"
                aria-label={disciplines[slug].title}
                aria-current={position === activeIndex}
                onClick={() => jumpTo(position)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* The accordion stays: it is the visible half of the FAQPage JSON-LD the
          route prints, and structured data with nothing on the page behind it
          is exactly the kind of thing that gets an entry dropped. It swaps with
          the panel instead of sliding with it - the key resets which question is
          open when the service changes. */}
      <ServiceFaq key={current} intro={content.faqIntro} items={content.faq} />
    </>
  );
}
