"use client";

import { RevealCard } from "@/components/ui/card";
import CtaButton from "@/components/ui/cta-button";
import { type DisciplineKey } from "@/constants/disciplines";
import { servicePages } from "@/constants/services";
import ServiceModelStage from "./ServiceModelStage";

/**
 * One service, one screen.
 *
 * The eight sections this replaces all read from `servicePages[slug]`, and so
 * does this - nothing new was written for the panel, it just stops rendering
 * most of what the file holds. What survives is the argument in its shortest
 * form: what the service is, one line of why, one ask, three things it covers,
 * and the model.
 *
 * FOUR THINGS, IN THAT ORDER, AND NOTHING BETWEEN THEM. The eyebrow, the
 * `01 / 06` counter and the three proof numbers came off in round 2: the
 * counter repeated what the dots under the stage already say, and the numbers
 * were an argument the panel does not have room to make. What is left is a
 * title, a line, a button, and the scope row holding the floor.
 *
 * The rest of the content (`stats`, `differentiators`, `deliverables`, the full
 * `process` and `capabilities` lists) stays in the constants files untouched.
 * It is data, not markup, and the sections that used to render it are still on
 * disk - see the note in REPORT-04.
 *
 * No entrance animation lives here. The copy is plain semantic markup, which is
 * what the site-wide text reveal claims, and `RevealCard` brings the panel up
 * out of a blur inside its own border trace. Two layers, neither one fighting
 * the other over an opacity.
 */

/** Three is the count the spec fixes for the scope row. */
const CAPABILITY_COUNT = 3;

export default function ServicePanel({ slug }: { slug: DisciplineKey }) {
  const content = servicePages[slug];
  const { hero } = content;
  const ask = hero.ctas[0];

  return (
    <RevealCard as="article" className="service-panel">
      {/* The homepage's ambient glow, kept: the shell clips, so these read as
          light inside the panel rather than as a halo around it. */}
      <span aria-hidden className="service-panel-glow service-panel-glow--lead glow-accent" />
      <span aria-hidden className="service-panel-glow service-panel-glow--trail glow-accent" />

      <div className="service-panel-grid">
        <div className="service-panel-copy">
          {/* The argument, held together as one block so the scope row can be
              pushed to the floor without the copy stretching after it. */}
          <div className="service-panel-lead">
            <h1 className="text-2xl leading-tight text-theme-primary md:text-3xl lg:text-[2.15rem]">
              {hero.title}
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-theme-muted md:text-base">
              {hero.lede}
            </p>

            <div className="pt-1">
              <CtaButton href={ask.href} variant={ask.variant ?? "primary"}>
                {ask.label}
              </CtaButton>
            </div>
          </div>

          {/* The scope row, standing where the proof numbers used to. Same item
              as before - bullet, then label - turned sideways, and deliberately
              allowed to run past the column into the empty air under the model
              rather than being squeezed to fit it. */}
          <ul className="service-panel-scope">
            {content.capabilities.items
              .slice(0, CAPABILITY_COUNT)
              .map(({ title, icon: Icon }) => (
                <li
                  key={title}
                  className="flex items-center gap-3 text-sm text-theme-primary"
                >
                  <span aria-hidden className="service-panel-bullet">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{title}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="service-hero-viewport">
          <ServiceModelStage slug={slug} />
        </div>
      </div>
    </RevealCard>
  );
}
