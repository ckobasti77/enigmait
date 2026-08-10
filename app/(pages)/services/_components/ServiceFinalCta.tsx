"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import CtaButton from "@/components/ui/cta-button";
import {
  DISCIPLINE_ORDER,
  disciplineHref,
  disciplines,
} from "@/constants/disciplines";
import type { ServicePageContent } from "@/constants/services/types";

/**
 * Closing band plus free internal linking: the previous/next discipline pair
 * is derived from DISCIPLINE_ORDER, zero new data. Titles come from
 * `disciplines` (EN source - the i18n walker already owns those pairs).
 */
export default function ServiceFinalCta({
  content,
}: {
  content: ServicePageContent;
}) {
  const { finalCta, slug } = content;

  const index = DISCIPLINE_ORDER.indexOf(slug);
  const previous =
    DISCIPLINE_ORDER[
      (index - 1 + DISCIPLINE_ORDER.length) % DISCIPLINE_ORDER.length
    ];
  const next = DISCIPLINE_ORDER[(index + 1) % DISCIPLINE_ORDER.length];

  return (
    <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
      <div className="site-container flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-3xl text-2xl leading-snug text-theme-primary md:text-3xl">
          {finalCta.title}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-theme-muted">
          {finalCta.body}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {finalCta.ctas.map((cta) => (
            <CtaButton
              key={cta.href + cta.label}
              href={cta.href}
              variant={cta.variant ?? "primary"}
            >
              {cta.label}
            </CtaButton>
          ))}
        </div>

        <nav
          aria-label="Ostale usluge"
          className="mt-10 flex w-full flex-col gap-4 border-t border-theme pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href={disciplineHref(previous)}
            className="group inline-flex items-center gap-2 text-theme-muted transition-theme hover:text-theme-primary"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden
            />
            <span>{disciplines[previous].title}</span>
          </Link>
          <Link
            href={disciplineHref(next)}
            className="group inline-flex items-center gap-2 text-theme-muted transition-theme hover:text-theme-primary sm:ml-auto"
          >
            <span>{disciplines[next].title}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </nav>
      </div>
    </section>
  );
}
