import type { Metadata } from "next";

import ServicePageTemplate from "../_components/ServicePageTemplate";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
} from "@/constants/services/seo";

export const metadata: Metadata = buildServiceMetadata("branding");

export default function BrandingPage() {
  return (
    <>
      <ServicePageTemplate slug="branding" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildServiceJsonLd("branding") }}
      />
    </>
  );
}
