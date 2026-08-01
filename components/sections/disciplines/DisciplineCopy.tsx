"use client";

import clsx from "clsx";

import { disciplineHref, type Discipline } from "@/constants/disciplines";
import CtaButton from "@/components/ui/cta-button";

type DisciplineCopyProps = {
  discipline: Discipline;
  /** False panels stay in the DOM and go `inert` - never `display:none`, never unmounted. */
  active?: boolean;
  className?: string;
};

/**
 * The text panel for one discipline: kicker, title, lede, CTA.
 *
 * Six of these are in the DOM at once once Faza D lands, which is why the inactive ones are
 * hidden with plain `opacity` plus `inert` and nothing else. `display:none`,
 * `visibility:hidden`, conditional mounting and GSAP's `autoAlpha` are all off the table -
 * each of them takes the copy out of the document or out of the accessibility tree, and
 * that copy is the whole SEO argument for the section.
 */
export default function DisciplineCopy({
  discipline,
  active = true,
  className,
}: DisciplineCopyProps) {
  return (
    <div
      className={clsx(
        "discipline-panel flex flex-col items-start gap-5 transition-opacity duration-300",
        active ? "opacity-100" : "pointer-events-none opacity-0",
        className
      )}
      inert={!active}
    >
      <span className="font-broken-console text-xs uppercase tracking-[0.4em] text-cyan-400">
        {discipline.kicker}
      </span>

      <h2 className="text-3xl text-theme-primary md:text-4xl">
        {discipline.title}
      </h2>

      <p className="max-w-xl text-base text-theme-muted md:text-lg">
        {discipline.lede}
      </p>

      <CtaButton
        href={disciplineHref(discipline.key)}
        // The visible label is the same on all six, so the accessible name has to carry
        // which discipline it leads to.
        aria-label={`See the discipline: ${discipline.title}`}
        text="See the discipline"
        className="mt-2"
      />
    </div>
  );
}
