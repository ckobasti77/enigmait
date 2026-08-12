"use client";

import { RevealCard } from "@/components/ui/card";
import CtaButton from "@/components/ui/cta-button";
import { DISCIPLINE_ORDER, type DisciplineKey } from "@/constants/disciplines";
import { servicePages } from "@/constants/services";
import ServiceModelStage from "./ServiceModelStage";

/**
 * One service, one screen.
 *
 * The eight sections this replaces all read from `servicePages[slug]`, and so
 * does this - nothing new was written for the panel, it just stops rendering
 * most of what the file holds. What survives is the argument in its shortest
 * form: what the service is, one line of why, three numbers that prove it,
 * three things it covers, one ask, and the model.
 *
 * The rest of the content (`differentiators`, `deliverables`, the full
 * `process` and `capabilities` lists) stays in the constants files untouched.
 * It is data, not markup, and the sections that used to render it are still on
 * disk - see the note in REPORT-04.
 *
 * No entrance animation lives here. The copy is plain semantic markup, which is
 * what the site-wide text reveal claims, and `RevealCard` brings the panel up
 * out of a blur inside its own border trace. Two layers, neither one fighting
 * the other over an opacity.
 */

/** Three is the count the spec fixes for both rows - proof and scope. */
const PROOF_COUNT = 3;
const CAPABILITY_COUNT = 3;

const pad = (value: number) => String(value).padStart(2, "0");

export default function ServicePanel({ slug }: { slug: DisciplineKey }) {
  const content = servicePages[slug];
  const { hero } = content;
  const position = DISCIPLINE_ORDER.indexOf(slug);
  const ask = hero.ctas[0];

  return (
    <RevealCard as="article" className="service-panel">
      {/* The homepage's ambient glow, kept: the shell clips, so these read as
          light inside the panel rather than as a halo around it. */}
      <span aria-hidden className="service-panel-glow service-panel-glow--lead glow-accent" />
      <span aria-hidden className="service-panel-glow service-panel-glow--trail glow-accent" />

      <div className="service-panel-grid">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-[0.7rem] uppercase tracking-[0.5em] text-cyan-400">
              {hero.eyebrow}
            </span>
            {/* Digits only - a counter that reads the same in both locales and
                needs no dictionary entry. */}
            <span className="font-accent text-[0.7rem] tracking-[0.35em] text-theme-muted">
              {`${pad(position + 1)} / ${pad(DISCIPLINE_ORDER.length)}`}
            </span>
          </div>

          <h1 className="text-2xl leading-tight text-theme-primary md:text-3xl lg:text-[2.15rem]">
            {hero.title}
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-theme-muted md:text-base">
            {hero.lede}
          </p>

          <ul className="flex flex-col gap-2.5">
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

          <div className="pt-1">
            <CtaButton href={ask.href} variant={ask.variant ?? "primary"}>
              {ask.label}
            </CtaButton>
          </div>

          {/* `dt` is the label and `dd` the value, which is the honest reading of
              a definition list; `column-reverse` is what puts the number on top
              without lying about which one defines which. */}
          <dl className="service-panel-stats">
            {content.stats.slice(0, PROOF_COUNT).map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-theme-muted">
                  {stat.label}
                </dt>
                <dd className="m-0 font-accent text-xl text-theme-primary md:text-2xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="service-hero-viewport">
          <ServiceModelStage slug={slug} />
        </div>
      </div>
    </RevealCard>
  );
}
