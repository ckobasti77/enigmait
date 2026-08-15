// app/_components/Timeline.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import AutoTypingConsole from "@/components/ui/auto-typing-console";
import ProcessCard from "./ProcessCard";
import {
  PROCESS_CARD_POSITIONS,
  processSteps,
} from "@/constants/processSteps";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The process run: five cards threaded onto one vertical spine.
 *
 * The spine is the only thing this component animates. Each card owns its own
 * unlock - node, connector, border trace, copy - because the sequence is
 * per-card and has to start when *that* card reaches the middle of the
 * viewport. See `ProcessCard`.
 */
const Timeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".process-rail-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".process-rail",
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="timeline-spine"
      ref={containerRef}
      className="site-gutter theme-section relative flex flex-col items-center py-24"
    >
      {/* Heading glow. It bleeds up over the section above and stays under the
          cards (z-0; `.process-rows` is z-1). The section no longer clips its
          overflow, so the top edge is no longer cut into a hard line - the
          global `overflow-x: clip` still keeps the blur from widening the page. */}
      <div aria-hidden className="section-heading-glow" />

      <div className="site-container relative">
        <header className="mx-auto mb-16 max-w-3xl space-y-6 text-center">
          <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
            Kako gradimo zamah
          </span>
          <AutoTypingConsole
            text="Upoznajte naš način rada"
            className="text-center"
          />
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-theme-muted">
            Pet faza koje spajaju istraživanje, dizajn i isporuku, tako da u
            svakom trenutku znate gde smo i šta sledi. Skrolujte kroz tok — svaka
            faza se otključava kada dođe na red.
          </p>
        </header>

        <div className="process-timeline">
          <div aria-hidden className="process-rail">
            <div className="process-rail-fill" />
          </div>

          <div className="process-rows">
            {processSteps.map((step, index) => (
              <ProcessCard
                key={step.number}
                position={PROCESS_CARD_POSITIONS[index] ?? "center"}
                step={step}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
