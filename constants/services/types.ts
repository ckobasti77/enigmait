import type { LucideIcon } from "lucide-react";
import type { DisciplineKey } from "@/constants/disciplines";

/**
 * The content contract for one service detail page. Isomorphic data - no
 * "use client" anywhere in `constants/services/`: the client template renders
 * from it and the server `page.tsx` reads `seo` + `faq` for metadata and
 * JSON-LD, each side importing the module itself.
 *
 * Every user-facing string in here is Serbian and needs an `[en, sr]` pair in
 * `lib/i18n.ts` unless it is a proper noun (tech names in `stack`) or reused
 * verbatim from copy that already has one.
 */
export type ServiceCta = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

export type ServiceSectionIntro = {
  kicker: string;
  title: string;
  lede?: string;
};

export type ServiceStat = { value: string; label: string };

export type ServiceCapability = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export type ServiceProcessStep = {
  title: string;
  body: string;
  deliverable: string;
};

export type ServiceDifferentiator = { title: string; body: string };

export type ServiceFaqItem = { question: string; answer: string };

export type ServicePageContent = {
  slug: DisciplineKey;
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    ctas: [ServiceCta, ServiceCta];
  };
  /** Four proof points, rendered as a full-width strip under the hero. */
  stats: ServiceStat[];
  capabilities: { intro: ServiceSectionIntro; items: ServiceCapability[] };
  process: { intro: ServiceSectionIntro; steps: ServiceProcessStep[] };
  differentiators: {
    intro: ServiceSectionIntro;
    items: ServiceDifferentiator[];
  };
  deliverables: {
    intro: ServiceSectionIntro;
    items: string[];
    /** Tool/tech chips. Proper nouns - the i18n walker passes them through. */
    stack: string[];
  };
  faqIntro: ServiceSectionIntro;
  /** Also the source of the FAQPage JSON-LD - visible copy parity by construction. */
  faq: ServiceFaqItem[];
  finalCta: { title: string; body: string; ctas: [ServiceCta, ServiceCta] };
  /** Metadata source. Never rendered into the DOM, so no i18n pairs needed. */
  seo: { title: string; description: string };
};
