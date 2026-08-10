"use client";

import type {
  ServiceDifferentiator,
  ServiceSectionIntro,
} from "@/constants/services/types";
import ServiceSectionHeader from "./ServiceSectionHeader";

/** 2x2, understated on purpose - this is the craft section, typography does the work. */
export default function ServiceDifferentiators({
  data,
}: {
  data: { intro: ServiceSectionIntro; items: ServiceDifferentiator[] };
}) {
  return (
    <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
      <div className="site-container space-y-12">
        <ServiceSectionHeader intro={data.intro} />

        <div className="grid gap-6 md:grid-cols-2">
          {data.items.map(({ title, body }) => (
            <article
              key={title}
              className="rounded-3xl border border-theme theme-card-muted p-8"
            >
              <h3 className="text-xl font-semibold text-theme-primary">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted md:text-base">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
