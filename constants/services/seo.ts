import type { Metadata } from "next";

import { disciplines, type DisciplineKey } from "@/constants/disciplines";
import { servicePages } from "./index";

/**
 * Metadata for a service page's server component. Serbian on purpose - it is
 * the site's canonical language (`html lang="sr-Latn-RS"`); the EN locale is a
 * cookie, not a route, so there is no per-locale URL to hang alternates on.
 */
export function buildServiceMetadata(slug: DisciplineKey): Metadata {
  const content = servicePages[slug];

  return {
    title: content.seo.title,
    description: content.seo.description,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      type: "website",
      locale: "sr_RS",
    },
  };
}

/**
 * One `@graph` per page: Service + FAQPage (mapped from the same array the
 * accordion renders - parity by construction) + BreadcrumbList. Rendered by
 * the server `page.tsx` as a plain `<script>` so it lands in view-source;
 * `next/script` never reaches the served HTML (the DisciplinesSection lesson).
 * Relative URLs and `<`-escaping follow `sectionCopy.ts`.
 */
export function buildServiceJsonLd(slug: DisciplineKey): string {
  const content = servicePages[slug];
  const url = `/services/${slug}`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: disciplines[slug].title,
        description: content.seo.description,
        serviceType: disciplines[slug].title,
        provider: { "@type": "Organization", name: "Enigma Digital" },
        url,
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: "/" },
          { "@type": "ListItem", position: 2, name: "Usluge", item: "/services" },
          { "@type": "ListItem", position: 3, name: disciplines[slug].title, item: url },
        ],
      },
    ],
  };

  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
