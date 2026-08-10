"use client";

import type { DisciplineKey } from "@/constants/disciplines";
import { servicePages } from "@/constants/services";
import ServiceCapabilities from "./ServiceCapabilities";
import ServiceDeliverables from "./ServiceDeliverables";
import ServiceDifferentiators from "./ServiceDifferentiators";
import ServiceFaq from "./ServiceFaq";
import ServiceFinalCta from "./ServiceFinalCta";
import ServiceHero from "./ServiceHero";
import ServiceProcess from "./ServiceProcess";
import ServiceProofStrip from "./ServiceProofStrip";

/**
 * One fixed template for all six service pages. The page files are server
 * components that own metadata and JSON-LD; everything visible renders from
 * `servicePages[slug]` through here.
 */
export default function ServicePageTemplate({ slug }: { slug: DisciplineKey }) {
  const content = servicePages[slug];

  return (
    <>
      <ServiceHero content={content} />
      <ServiceProofStrip stats={content.stats} />
      <ServiceCapabilities data={content.capabilities} />
      <ServiceProcess data={content.process} />
      <ServiceDifferentiators data={content.differentiators} />
      <ServiceDeliverables data={content.deliverables} />
      <ServiceFaq intro={content.faqIntro} items={content.faq} />
      <ServiceFinalCta content={content} />
    </>
  );
}
