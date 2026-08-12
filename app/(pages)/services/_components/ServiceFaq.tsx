"use client";

import { useState } from "react";
import clsx from "clsx";

import { Card } from "@/components/ui/card";
import type { ServiceFaqItem, ServiceSectionIntro } from "@/constants/services/types";
import ServiceSectionHeader from "./ServiceSectionHeader";

/**
 * The one stateful section. The collapse is `grid-template-rows: 0fr/1fr` -
 * no measured max-height, so no clipping on long answers and no magic number.
 *
 * `data-reveal="off"` on the accordion: collapsed copy must never be claimed
 * by the site-wide reveal (it would be hidden with no viewport entry to
 * reveal it), and an answer has to be readable the instant it expands.
 *
 * The wrapper is the shared `Card` primitive (plain, not `RevealCard` - its
 * once-on-scroll border trace would fight the accordion's own open/close
 * state), so the blue border and cyan hairline come from the same system
 * every other card on the site uses instead of being retyped here.
 */
export default function ServiceFaq({
  intro,
  items,
}: {
  intro: ServiceSectionIntro;
  items: ServiceFaqItem[];
}) {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
      <div className="site-container space-y-12">
        <ServiceSectionHeader intro={intro} />

        <Card data-reveal="off">
          {/* divide-y on its own wrapper: the card's absolute hairline must not
              count as a sibling, or the first question grows a second line. */}
          <div className="divide-y divide-[var(--border-soft)]">
          {items.map((item, index) => {
            const open = active === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`service-faq-panel-${index}`}
                  onClick={() => setActive(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                >
                  <span
                    className={clsx(
                      "text-sm font-semibold transition-colors duration-300 sm:text-base",
                      open ? "text-primary" : "text-theme-primary"
                    )}
                  >
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-theme text-sm transition-transform duration-300",
                      open ? "rotate-45 border-primary/50 text-primary" : "text-theme-muted"
                    )}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`service-faq-panel-${index}`}
                  role="region"
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-theme-muted">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </Card>
      </div>
    </section>
  );
}
