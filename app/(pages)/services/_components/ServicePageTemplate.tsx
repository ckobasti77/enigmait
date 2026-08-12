import type { DisciplineKey } from "@/constants/disciplines";
import ServiceCarousel from "./ServiceCarousel";

/**
 * One fixed template for all six service pages. The page files are server
 * components that own metadata and JSON-LD; everything visible renders from
 * `servicePages[slug]` through here.
 *
 * It used to stack eight sections. It now hands the route's slug to the
 * carousel, which renders one compact panel for it and lets the reader step
 * sideways through the other five - the sections that were cut are listed in
 * REPORT-04, and their components are still on disk, simply not mounted.
 *
 * No `"use client"`: there is nothing client-side left in here, and the
 * boundary belongs on `ServiceCarousel` where the state actually lives.
 */
export default function ServicePageTemplate({ slug }: { slug: DisciplineKey }) {
  return <ServiceCarousel initialSlug={slug} />;
}
