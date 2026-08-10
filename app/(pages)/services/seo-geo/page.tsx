import type { Metadata } from "next";

import ServicePageTemplate from "../_components/ServicePageTemplate";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
} from "@/constants/services/seo";

export const metadata: Metadata = buildServiceMetadata("seo-geo");

export default function SeoGeoPage() {
  return (
    <>
      <ServicePageTemplate slug="seo-geo" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildServiceJsonLd("seo-geo") }}
      />
    </>
  );
}
