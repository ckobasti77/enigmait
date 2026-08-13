/**
 * projectId -> the four static mockup images captured off each project's live URL by
 * `scripts/capture-mockups.mjs`. Written by that script - do not hand-edit the paths, only
 * re-run the capture.
 *
 * `laptopUsesVideo` mirrors whether `constants/projects.ts` has real `media` for this id: the
 * laptop mockup in the device frame plays `ShowcaseVideo` there and this image is only the
 * poster/fallback frame, never the primary surface.
 *
 * `placeholders` lists sizes whose live capture failed (timeout, non-200, blank render); those
 * paths point at a flat placeholder frame instead of a real screenshot. See
 * `showcase/redesign-round2/REPORT-10.md` for which sites/sizes failed and why.
 */

export type ProjectMockupSize = "desktop" | "laptop" | "tablet" | "mobile";

export type ProjectMockup = {
  desktop: string;
  laptop: string;
  tablet: string;
  mobile: string;
  laptopUsesVideo: boolean;
  placeholders: ProjectMockupSize[];
};

export const PROJECT_MOCKUPS: Record<string, ProjectMockup> = {
  "lady-gaga-studio": {
    desktop: "/mockups/lady-gaga-studio/desktop.webp",
    laptop: "/mockups/lady-gaga-studio/laptop.webp",
    tablet: "/mockups/lady-gaga-studio/tablet.webp",
    mobile: "/mockups/lady-gaga-studio/mobile.webp",
    laptopUsesVideo: true,
    placeholders: [],
  },
  "ablux-travel": {
    desktop: "/mockups/ablux-travel/desktop.webp",
    laptop: "/mockups/ablux-travel/laptop.webp",
    tablet: "/mockups/ablux-travel/tablet.webp",
    mobile: "/mockups/ablux-travel/mobile.webp",
    laptopUsesVideo: true,
    placeholders: [],
  },
  "gbmt": {
    desktop: "/mockups/gbmt/desktop.webp",
    laptop: "/mockups/gbmt/laptop.webp",
    tablet: "/mockups/gbmt/tablet.webp",
    mobile: "/mockups/gbmt/mobile.webp",
    laptopUsesVideo: true,
    placeholders: [],
  },
  "the-original-way": {
    desktop: "/mockups/the-original-way/desktop.webp",
    laptop: "/mockups/the-original-way/laptop.webp",
    tablet: "/mockups/the-original-way/tablet.webp",
    mobile: "/mockups/the-original-way/mobile.webp",
    laptopUsesVideo: true,
    placeholders: [],
  },
  "fides-gradnja": {
    desktop: "/mockups/fides-gradnja/desktop.webp",
    laptop: "/mockups/fides-gradnja/laptop.webp",
    tablet: "/mockups/fides-gradnja/tablet.webp",
    mobile: "/mockups/fides-gradnja/mobile.webp",
    laptopUsesVideo: true,
    placeholders: [],
  },
  "digist": {
    desktop: "/mockups/digist/desktop.webp",
    laptop: "/mockups/digist/laptop.webp",
    tablet: "/mockups/digist/tablet.webp",
    mobile: "/mockups/digist/mobile.webp",
    laptopUsesVideo: true,
    placeholders: [],
  },
};

export default PROJECT_MOCKUPS;
