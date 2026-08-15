#!/usr/bin/env node

/**
 * The three phone screens on the `social-media` model.
 *
 * `social-media_screen` is ONE mesh carrying three plates, and its UVs sit in three
 * thirds of a single texture - left, middle, right, in that order (see the row in
 * `constants/disciplines.ts`). This bakes that texture: one white brand mark centred on
 * each platform's own background colour, left to right TikTok, Instagram, Facebook. Run
 * once, commit the output:
 *
 *   npm run social-logos
 *
 * WHY PLAYWRIGHT AND NOT SVG/sharp COMPOSITING - the same reason the lens atlas uses it
 * (`build-lens-logo-atlas.mjs`): a headless Chromium renders CSS gradients and inline SVG
 * glyphs the way a browser would, so the Instagram gradient and the three marks land
 * exactly as designed with no font/rsvg quirks. sharp only does the final WebP encode.
 *
 * THE TILE SIZE IS NOT FREE. The panel geometry derives its 0.94 x 1.6707 screen from a
 * 512 x 910 tile, so each cell is 512 x 910 and the atlas is 1536 x 910. Changing it
 * stretches the screen.
 *
 * Marks are solid white on purpose - the brief is white logos on each platform's colour,
 * so there is one ink value and the platform reads from its background. A faint drop
 * shadow is the only concession, so the white note does not vanish in the bright corner
 * of the Instagram gradient.
 */

import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const OUTPUT_PATH = resolve(
  "public",
  "assets",
  "screens",
  "disciplines",
  "social-media-logos.webp"
);

/** Tile ratio the screen geometry is cut from. Do not change without the mesh. */
const CELL_W = 512;
const CELL_H = 910;

/**
 * One cell per platform, laid out left to right - the order `social-media_screen`'s UVs
 * read (left third, middle third, right third).
 *
 * `bg` is each platform's signature backdrop: TikTok black, the Instagram gradient, and
 * Facebook blue (#1877F2). `mark` is a white glyph, sized in % of the tile width and
 * hand-balanced so the three read at one optical size despite different aspects - the
 * Facebook "f" is tall and narrow, the note and camera near square.
 */
const CELLS = [
  {
    id: "tiktok",
    bg: "#000000",
    markWidth: 40,
    // TikTok note. simple-icons path, viewBox 0 0 24 24.
    viewBox: "0 0 24 24",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    id: "instagram",
    // The Instagram gradient, the widely used CSS approximation: warm corner at
    // bottom-left rolling up through magenta into blue.
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
    markWidth: 42,
    // Instagram camera. simple-icons path, viewBox 0 0 24 24.
    viewBox: "0 0 24 24",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    id: "facebook",
    bg: "#1877f2",
    markWidth: 30,
    // Facebook "f". Font Awesome facebook-f path, viewBox 0 0 320 512 - tall and narrow,
    // which is why its % width is smaller than the two near-square marks above.
    viewBox: "0 0 320 512",
    path: "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z",
  },
];

function buildHtml() {
  const cells = CELLS.map(
    (cell) => `
      <div class="cell" style="background:${cell.bg};">
        <svg class="mark" viewBox="${cell.viewBox}" style="width:${cell.markWidth}%;"
             xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
          <path d="${cell.path}" />
        </svg>
      </div>`
  ).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: #000;
    width: ${CELL_W * CELLS.length}px;
    height: ${CELL_H}px;
  }
  body { display: flex; }
  .cell {
    width: ${CELL_W}px;
    height: ${CELL_H}px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mark {
    height: auto;
    /* Only concession to legibility: keeps the white mark off the bright Instagram corner. */
    filter: drop-shadow(0 2px 16px rgba(0, 0, 0, 0.18));
  }
</style>
</head>
<body>${cells}</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CELL_W * CELLS.length, height: CELL_H },
    deviceScaleFactor: 1,
  });

  await page.setContent(buildHtml(), { waitUntil: "load" });

  const png = await page.screenshot({ type: "png" });
  await browser.close();

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const out = await sharp(png)
    .webp({ quality: 92, effort: 6 })
    .toBuffer();

  await sharp(out).toFile(OUTPUT_PATH);

  const kb = (out.length / 1024).toFixed(1);
  console.log(
    `social-media-logos.webp  ${CELL_W * CELLS.length}x${CELL_H}  ${kb} KB  (${CELLS
      .map((c) => c.id)
      .join(", ")})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
