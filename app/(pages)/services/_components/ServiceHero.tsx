"use client";

import CtaButton from "@/components/ui/cta-button";
import type { ServicePageContent } from "@/constants/services/types";
import ServiceModelStage from "./ServiceModelStage";

/**
 * Copy left, model right - the homepage hero's grammar, deliberately not a
 * mirror of the Disciplines section. Below `lg` the copy comes first and the
 * model box follows; `.service-hero-viewport` reserves the ratio either way.
 *
 * No entrance animation code in here at all: the h1, lede and eyebrow are
 * plain semantic markup, which is exactly what the site-wide text reveal
 * claims. The h1 gets the Microgramma display face automatically.
 */
export default function ServiceHero({
  content,
}: {
  content: ServicePageContent;
}) {
  const { hero, slug } = content;

  return (
    <section className="site-gutter theme-section relative overflow-x-hidden py-20 transition-theme lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 z-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full glow-accent blur-[150px]"
      />

      <div className="site-container relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
            {hero.eyebrow}
          </span>
          <h1 className="text-3xl leading-tight text-theme-primary md:text-4xl lg:text-[2.75rem]">
            {hero.title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-theme-muted md:text-lg">
            {hero.lede}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {hero.ctas.map((cta) => (
              <CtaButton
                key={cta.href + cta.label}
                href={cta.href}
                variant={cta.variant ?? "primary"}
              >
                {cta.label}
              </CtaButton>
            ))}
          </div>
        </div>

        <div className="service-hero-viewport">
          <ServiceModelStage slug={slug} />
        </div>
      </div>
    </section>
  );
}
