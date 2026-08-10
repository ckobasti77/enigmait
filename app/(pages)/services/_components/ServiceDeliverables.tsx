"use client";

import { Check } from "lucide-react";

import type { ServiceSectionIntro } from "@/constants/services/types";
import ServiceSectionHeader from "./ServiceSectionHeader";

export default function ServiceDeliverables({
  data,
}: {
  data: { intro: ServiceSectionIntro; items: string[]; stack: string[] };
}) {
  return (
    <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
      <div className="site-container space-y-12">
        <ServiceSectionHeader intro={data.intro} />

        <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {data.items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-theme theme-card-muted text-cyan-300">
                <Check className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-theme-muted md:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>

        {/* Tech names are proper nouns - the i18n walker passes them through. */}
        <ul aria-label="Stack" className="flex flex-wrap gap-2" data-reveal="off">
          {data.stack.map((tool) => (
            <li
              key={tool}
              className="rounded-full border border-theme px-3 py-1 text-xs text-theme-muted transition-theme hover:border-cyan-400/40 hover:text-theme-primary"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
