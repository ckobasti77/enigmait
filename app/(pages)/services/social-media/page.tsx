import type { Metadata } from "next";

import ServicePageTemplate from "../_components/ServicePageTemplate";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
} from "@/constants/services/seo";

export const metadata: Metadata = buildServiceMetadata("social-media");

export default function SocialMediaPage() {
  return (
    <>
      <ServicePageTemplate slug="social-media" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildServiceJsonLd("social-media") }}
      />
    </>
  );
}
