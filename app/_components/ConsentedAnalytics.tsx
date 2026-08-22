"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "./MetaPixel";
import { useConsent } from "./ConsentProvider";

/**
 * Renders GA4 only after analytics consent and the Pixel only after marketing
 * consent. The env decision stays server-side (see layout.tsx) and is passed in
 * as props - so the non-public META_PIXEL_ID fallback is still honoured - while
 * the consent decision happens here, on the client.
 */
export default function ConsentedAnalytics({
  gaId,
  pixelId,
}: {
  gaId?: string;
  pixelId?: string;
}) {
  const { consent } = useConsent();

  return (
    <>
      {gaId && consent.analytics && <GoogleAnalytics gaId={gaId} />}
      {pixelId && consent.marketing && <MetaPixel pixelId={pixelId} />}
    </>
  );
}
