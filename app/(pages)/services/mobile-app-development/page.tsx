import type { Metadata } from "next";

import ServicePageTemplate from "../_components/ServicePageTemplate";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
} from "@/constants/services/seo";

export const metadata: Metadata = buildServiceMetadata(
  "mobile-app-development"
);

export default function MobileAppDevelopmentPage() {
  return (
    <>
      <ServicePageTemplate slug="mobile-app-development" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildServiceJsonLd("mobile-app-development"),
        }}
      />
    </>
  );
}
