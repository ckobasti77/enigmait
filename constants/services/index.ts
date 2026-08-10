import type { DisciplineKey } from "@/constants/disciplines";
import type { ServicePageContent } from "./types";
import { branding } from "./branding";
import { mobileAppDevelopment } from "./mobile-app-development";
import { seoGeo } from "./seo-geo";
import { socialMedia } from "./social-media";
import { uiUxDesign } from "./ui-ux-design";
import { webDevelopment } from "./web-development";

/**
 * Keyed by `DisciplineKey`, so the compiler guarantees all six pages exist and
 * no slug can drift - the same trick `constants/disciplines.ts` uses.
 */
export const servicePages: Record<DisciplineKey, ServicePageContent> = {
  "web-development": webDevelopment,
  "ui-ux-design": uiUxDesign,
  "mobile-app-development": mobileAppDevelopment,
  "seo-geo": seoGeo,
  branding,
  "social-media": socialMedia,
};

export type { ServicePageContent } from "./types";
