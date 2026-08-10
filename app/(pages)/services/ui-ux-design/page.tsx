import type { Metadata } from "next";

import ServicePageTemplate from "../_components/ServicePageTemplate";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
} from "@/constants/services/seo";

export const metadata: Metadata = buildServiceMetadata("ui-ux-design");

export default function UiUxDesignPage() {
  return (
    <>
      <ServicePageTemplate slug="ui-ux-design" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildServiceJsonLd("ui-ux-design") }}
      />
    </>
  );
}
