import type { Metadata } from "next";

import ServicePageTemplate from "../_components/ServicePageTemplate";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
} from "@/constants/services/seo";

export const metadata: Metadata = buildServiceMetadata("web-development");

export default function WebDevelopmentPage() {
  return (
    <>
      <ServicePageTemplate slug="web-development" />
      {/* Plain <script>, not next/script: a server component renders it into
          the served HTML, which is the whole point of structured data. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildServiceJsonLd("web-development"),
        }}
      />
    </>
  );
}
