"use client";

import type {
  ServiceProcessStep,
  ServiceSectionIntro,
} from "@/constants/services/types";
import ServiceSectionHeader from "./ServiceSectionHeader";

/**
 * Five steps on one rail: vertical through the discs on mobile, horizontal
 * under the disc row from `lg`. The rail is a sibling of the `<ol>` (an `<ol>`
 * may only contain `<li>`), positioned against the same box.
 */
export default function ServiceProcess({
  data,
}: {
  data: { intro: ServiceSectionIntro; steps: ServiceProcessStep[] };
}) {
  return (
    <section className="site-gutter theme-section relative overflow-hidden border-t border-theme py-20 transition-theme sm:py-24">
      {/* The homepage Timeline's glow orb - this is the page's one typed
          section, so it also carries the section aura. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-8 h-[380px] w-[380px] -translate-x-1/2 rounded-full glow-accent blur-[140px]"
      />
      <div className="site-container relative space-y-12">
        <ServiceSectionHeader intro={data.intro} typed />

        <div className="relative">
          <div
            aria-hidden
            className="absolute bottom-2 left-5 top-2 w-px bg-[var(--border-soft)] lg:bottom-auto lg:left-5 lg:right-5 lg:top-5 lg:h-px lg:w-auto"
          />
          <ol className="relative space-y-10 lg:grid lg:grid-cols-5 lg:gap-6 lg:space-y-0">
            {data.steps.map((step, index) => (
              <li key={step.title} className="flex gap-5 lg:block">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-theme theme-card font-accent text-sm text-cyan-300">
                  {index + 1}
                </span>
                <div className="pt-1.5 lg:pt-5">
                  <h3 className="text-base font-semibold text-theme-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-muted">
                    {step.body}
                  </p>
                  <span className="mt-3 inline-block rounded-full border border-theme theme-card-muted px-3 py-1 text-[11px] leading-relaxed text-theme-muted">
                    {step.deliverable}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
