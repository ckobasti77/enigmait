"use client";

import type { ServiceStat } from "@/constants/services/types";

/**
 * Four proof points directly under the hero. Value and label each live in
 * their own block `<span>` - never bare text in a grid cell, per the text
 * reveal contract.
 */
export default function ServiceProofStrip({ stats }: { stats: ServiceStat[] }) {
  return (
    <section className="site-gutter theme-section pb-16 transition-theme sm:pb-20">
      <div className="site-container grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-theme theme-card-muted p-5"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-80"
            />
            <span className="block font-accent text-2xl text-theme-primary md:text-3xl">
              {stat.value}
            </span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-theme-muted">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
