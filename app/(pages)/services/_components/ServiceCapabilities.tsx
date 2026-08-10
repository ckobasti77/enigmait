"use client";

import type {
  ServiceCapability,
  ServiceSectionIntro,
} from "@/constants/services/types";
import ServiceSectionHeader from "./ServiceSectionHeader";

export default function ServiceCapabilities({
  data,
}: {
  data: { intro: ServiceSectionIntro; items: ServiceCapability[] };
}) {
  return (
    <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
      <div className="site-container space-y-12">
        <ServiceSectionHeader intro={data.intro} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="card-lift relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-theme theme-card p-6 transition-theme hover:border-cyan-400/50"
            >
              {/* The process card's hairline - the homepage accent every card
                  on the site shares. */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-80"
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-theme theme-card-muted text-cyan-300">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-theme-primary">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-theme-muted">
                  {body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
