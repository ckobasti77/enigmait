"use client";

import type { ReactNode } from "react";
import AutoTypingConsole from "@/components/ui/auto-typing-console";
import CtaButton from "@/components/ui/cta-button";
import FloatingServiceObjects from "@/app/(pages)/services/_components/FloatingServiceObjects";
import type { ServiceFloatingKey } from "@/constants/serviceFloatingObjects";
import type { LucideIcon } from "lucide-react";

type PageHeroMetric = {
  value: string;
  label: string;
};

type PageHeroHighlight = {
  title: string;
  body: string;
  icon?: LucideIcon;
  badge?: string;
};

type PageHeroCta = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
};

export type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  metrics?: PageHeroMetric[];
  highlights?: PageHeroHighlight[];
  ctas?: PageHeroCta[];
  children?: ReactNode;
  footnote?: string;
  floatingServiceKey?: ServiceFloatingKey;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  metrics,
  highlights,
  ctas,
  children,
  footnote,
  floatingServiceKey,
}: PageHeroProps) {
  return (
    <section className="site-gutter relative overflow-visible overflow-x-hidden theme-section py-24 transition-theme">
      <div
        className="pointer-events-none absolute left-1/2 top-10 z-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22)_0%,rgba(168,85,247,0.18)_45%,rgba(15,23,42,0)_78%)] blur-[160px]"
        aria-hidden
      />
      {floatingServiceKey ? (
        <FloatingServiceObjects serviceKey={floatingServiceKey} className="z-10" />
      ) : null}
      <div className="site-container relative z-20 grid gap-14 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.85fr)]">
        <div className="space-y-8">
          {eyebrow ? (
            <span className="inline-flex items-center text-xs uppercase tracking-[0.6em] text-cyan-400">
              {eyebrow}
            </span>
          ) : null}
          {/* A step down from the old Aeonik sizing: the display face is extended,
              so the same point size runs ~30% wider and walks into the floating
              objects that sit over the middle of this section. */}
          <AutoTypingConsole text={title} className="text-left text-3xl md:text-4xl" />
          <p className="max-w-xl text-base leading-relaxed text-theme-muted md:text-lg">{description}</p>
          {ctas && ctas.length ? (
            <div className="flex flex-wrap gap-3">
              {ctas.map(({ href, label, variant = "primary", icon: Icon }) => (
                <CtaButton key={label} href={href} variant={variant}>
                  {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                  {label}
                </CtaButton>
              ))}
            </div>
          ) : null}
          {metrics && metrics.length ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-theme theme-card-muted px-4 py-5 shadow-theme"
                >
                  <div className="text-xl font-semibold leading-tight text-theme-primary sm:text-2xl">
                    {value}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.22em] leading-snug text-theme-muted">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {footnote ? (
            <p className="text-sm text-theme-muted">{footnote}</p>
          ) : null}
        </div>

        {(highlights && highlights.length) || children ? (
          <div className="grid gap-5 lg:justify-self-end lg:max-w-[520px]">
            {children}
            {highlights?.map(({ title: highlightTitle, body, icon: Icon, badge }) => (
              <article
                key={highlightTitle}
                className="group relative overflow-hidden rounded-3xl border border-theme theme-card px-5 py-4 card-lift transform-gpu translate-y-0 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(56,189,248,0.16), rgba(168,85,247,0.16))",
                    mixBlendMode: "screen",
                  }}
                />
                <div className="relative flex gap-3">
                  {Icon ? (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-theme theme-card text-cyan-400">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                  ) : null}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-theme-primary">{highlightTitle}</h3>
                      {badge ? (
                        <span className="rounded-full border border-theme px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-400">
                          {badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base leading-relaxed text-theme-muted">{body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}














