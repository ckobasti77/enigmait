#!/usr/bin/env node

/**
 * The pointing hand that offers the magnifier's handle.
 *
 *   npm run lens-hint
 *
 * Run once, commit the output. An SVG rasterised by sharp rather than rendered in a browser:
 * there is no text in it, so librsvg needs no fonts and the Playwright round-trip the logo
 * atlas needs (`build-lens-logo-atlas.mjs`) buys nothing here.
 *
 * It points LEFT because it stands to the right of the handle. Drawn as a silhouette rather
 * than line art: it is shown at roughly a centimetre on screen, over a dark field, and a
 * hairline outline at that size reads as a smudge.
 */

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const OUTPUT_PATH = resolve(
  "public",
  "assets",
  "screens",
  "disciplines",
  "lens-grab-hint.webp"
);

const SIZE = 512;

/** `--primary` from the dark palette, the section's own cyan. */
const ACCENT = "#58c4ff";
const INK = "#eaf6ff";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${SIZE}" height="${SIZE}">
  <g transform="translate(20 0)">
    <!--
      A hand reduced to the two shapes that carry the meaning: one finger out, one fist behind
      it. Anything more (knuckle creases, a cuff) turns to noise at the size this is shown.
    -->
    <g fill="${INK}">
      <!-- index finger, pointing left -->
      <rect x="52" y="228" width="188" height="56" rx="28" />
      <!-- fist -->
      <rect x="212" y="188" width="176" height="180" rx="62" />
      <!-- thumb, cocked up off the fist -->
      <rect x="236" y="140" width="56" height="92" rx="28"
            transform="rotate(-20 264 186)" />
    </g>
    <!--
      Two motion ticks off the fingertip. They are the difference between a hand sitting there
      and a hand nudging at something - the component fades them with the rest, so the gesture
      reads even in a still frame.
    -->
    <g fill="none" stroke="${ACCENT}" stroke-width="18" stroke-linecap="round" opacity="0.9">
      <path d="M28 256 H4" />
    </g>
    <g fill="none" stroke="${ACCENT}" stroke-width="14" stroke-linecap="round" opacity="0.55">
      <path d="M60 196 L36 172" />
      <path d="M60 316 L36 340" />
    </g>
  </g>
</svg>`;

async function main() {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toBuffer();
  await sharp(buffer).toFile(OUTPUT_PATH);
  console.log(
    `lens-grab-hint.webp  ${SIZE}x${SIZE}  ${(buffer.length / 1024).toFixed(1)} KB`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
