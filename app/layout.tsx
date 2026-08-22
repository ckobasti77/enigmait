import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "./_components/MetaPixel";
import "./globals.css";
import Navbar from "./_components/Navbar";
import ScrollToTopButton from "./_components/ScrollToTopButton";
import SocialDropdown from "./_components/SocialDropdown";
import Footer from "./_components/Footer";
import VideoBackgroundGlobal from "./_components/VideoBackgroundGlobal";
import localFont from "next/font/local";
import { ThemeProvider } from "./_components/ThemeProvider";
import { CookieConsentProvider } from "./_components/CookieConsentProvider";
import CookieConsentBanner from "./_components/CookieConsentBanner";
import { LanguageProvider } from "./_components/LanguageProvider";
import SmoothScrollProvider from "./_components/SmoothScrollProvider";
import TextRevealGlobal from "./_components/TextRevealGlobal";
import { GlassFilter } from "@/components/ui/liquid-glass-button";
import {
  TEXT_REVEAL_ARM_SCRIPT,
  buildTextRevealCss,
} from "@/constants/textRevealConfig";
import { EID_CAPTURE_SCRIPT } from "@/constants/metaPixelConfig";

const deltha = localFont({
  src: [
    {
      path: "../public/assets/fonts/Deltha/Deltha.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-deltha",
});

const terminal = localFont({
  src: [
    {
      path: "../public/assets/fonts/terminal-grotesque/terminal-grotesque.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-terminal",
});

const aeonik = localFont({
  src: [
    {
      path: "../public/assets/fonts/aeonik/aeonik-light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/aeonik/aeonik-light-italic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/aeonik/aeonik-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/aeonik/aeonik-regular-italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/aeonik/aeonik-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/aeonik/aeonik-bold-italic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-aeonik",
});

const brokenConsole = localFont({
  src: [
    {
      path: "../public/assets/fonts/broken-console/broken-console.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/broken-console/broken-console-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-broken-console",
});

const microgramma = localFont({
  src: [
    {
      path: "../public/assets/fonts/microgramma-d-extended-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-microgramma",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enigma Digital",
  description: "Digitalni proizvodi koji pretvaraju radoznalost u lojalne klijente.",
};

// viewport-fit=cover is what makes every env(safe-area-inset-*) in the app
// resolve to a real value - without it the navbar's inset padding and the
// site-gutter safe-area terms all compute to 0. No themeColor on purpose:
// the theme switches by class, and the meta only follows the OS scheme.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr-Latn-RS" suppressHydrationWarning>
      <head>
        {/* Shortlinks append ?eid=<id> - the event_id the server already sent
            via the Conversions API. This must run before the Pixel/GA4
            afterInteractive scripts so it can stash the id on window and
            strip it from the URL before either of them reads location. */}
        <script
          id="eid-capture"
          dangerouslySetInnerHTML={{ __html: EID_CAPTURE_SCRIPT }}
        />
      </head>
      <body
        className={`${deltha.variable} ${terminal.variable} ${aeonik.variable} ${brokenConsole.variable} ${microgramma.variable} font-aeonik antialiased`}
      >
        {/* Site-wide text reveal, armed before the copy below it parses.
            The stylesheet hides revealable copy and the script is what turns
            that rule on, so a client without JS - or one where the controller
            never mounts - gets plain, visible text. See
            constants/textRevealConfig.ts. */}
        <style dangerouslySetInnerHTML={{ __html: buildTextRevealCss() }} />
        <script dangerouslySetInnerHTML={{ __html: TEXT_REVEAL_ARM_SCRIPT }} />

        {/* One <defs> for every liquid glass CTA on the page. */}
        <GlassFilter />
        <CookieConsentProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SmoothScrollProvider>
                <div className="app-shell relative isolate min-h-screen">
                  <TextRevealGlobal />
                  <VideoBackgroundGlobal />
                  <div className="relative z-10">
                    <Navbar />
                    <div className="h-full w-full">{children}</div>
                    <Footer />
                    <ScrollToTopButton />
                    {/* Always-on social launcher, anchored bottom-left as the
                        mirror of the bottom-right scroll button. Chrome, so it
                        opts out of the site-wide reveal; its panel unfurls up
                        into the page rather than off the bottom edge. */}
                    <div
                      className="fixed bottom-6 left-6 z-40"
                      data-reveal="off"
                    >
                      <SocialDropdown menuPlacement="up-left" />
                    </div>
                  </div>
                </div>
              </SmoothScrollProvider>
              <CookieConsentBanner />
            </ThemeProvider>
          </LanguageProvider>
        </CookieConsentProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        {(process.env.NEXT_PUBLIC_META_PIXEL_ID ||
          process.env.META_PIXEL_ID) && (
          <MetaPixel
            pixelId={
              (process.env.NEXT_PUBLIC_META_PIXEL_ID ||
                process.env.META_PIXEL_ID)!
            }
          />
        )}
      </body>
    </html>
  );
}
