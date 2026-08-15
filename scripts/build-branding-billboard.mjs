#!/usr/bin/env node

/**
 * The face of the `branding` billboard.
 *
 *   npm run branding-billboard
 *
 * Run once, commit the output. The panel is 3:1 (measured off the GLB: 1.995 wide by 0.665
 * tall in object space), so the texture is authored at that ratio and the UVs need no help.
 *
 * WHAT IT IS. The site's own navbar lockup, with the identity taken out of it: the emblem
 * becomes a neutral geometric mark, "ENIGMA" becomes "VAŠ", and "IT" - the half that carries
 * the cyan-to-violet gradient - becomes "BREND". Same face, same tracking, same accent ramp, so
 * it reads as this studio's work applied to somebody else's name, which is the argument the
 * branding discipline is making.
 *
 * WHY PLAYWRIGHT. The wordmark has to be Microgramma, which exists here only as
 * `public/assets/fonts/microgramma-d-extended-bold.otf`. Fontconfig will not find a font at an
 * arbitrary path on Windows; a base64 `@font-face` in headless Chromium will. Same reasoning as
 * `build-lens-logo-atlas.mjs`.
 */

import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const FONT_PATH = resolve(
  "public",
  "assets",
  "fonts",
  "microgramma-d-extended-bold.otf"
);
const OUTPUT_PATH = resolve(
  "public",
  "assets",
  "screens",
  "disciplines",
  "branding-billboard.webp"
);

/** 3:1, the panel's measured aspect. */
const WIDTH = 1536;
const HEIGHT = 512;

/** The navbar's own ramp (`EnigmaLogo`, dark variant) and the section's ink. */
const ACCENT_FROM = "#58c4ff";
const ACCENT_TO = "#7d5bff";
/**
 * Near-black, and deliberately darker than the site's own surface. The screen material this
 * lands on carries a clearcoat and a 0.95 environment reflection - it is glass over an image -
 * so whatever is painted here gets a grey wash added on top. Authored at the site's `#0a1120`
 * the panel came back mid-grey and the gradient came back pale lilac. Starting lower gives the
 * reflection something to lift instead of something to flatten.
 */
const PANEL = "#05080f";
const INK = "#ffffff";

/**
 * The stand-in mark. A hexagon with a diamond in it - deliberately the most anonymous shape
 * language available, because its whole job is to occupy the place a real mark would go without
 * suggesting a particular one. It carries the same gradient as the wordmark's accent half so
 * the lockup still reads as one object.
 */
const MARK = `
<svg viewBox="0 0 100 100" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="markRamp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ACCENT_FROM}" />
      <stop offset="1" stop-color="${ACCENT_TO}" />
    </linearGradient>
  </defs>
  <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z"
        fill="none" stroke="url(#markRamp)" stroke-width="7" stroke-linejoin="round" />
  <path d="M50 32 L68 50 L50 68 L32 50 Z" fill="url(#markRamp)" />
</svg>`;

function buildHtml(fontBase64) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Microgramma";
    src: url(data:font/otf;base64,${fontBase64}) format("opentype");
    font-weight: 700;
    font-style: normal;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    background: ${PANEL};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  /* One soft pool of light behind the lockup. The panel is a lit sign, not a flat swatch -
     but the glow stays low so the mark keeps its edge. */
  .glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(58% 120% at 50% 50%, rgba(88, 196, 255, 0.20), transparent 70%),
      radial-gradient(40% 90% at 72% 50%, rgba(125, 91, 255, 0.17), transparent 72%);
  }
  .lockup {
    position: relative;
    display: flex;
    align-items: center;
    gap: 52px;
  }
  .mark { display: block; line-height: 0; }
  .word {
    font-family: "Microgramma", sans-serif;
    font-weight: 700;
    font-size: 116px;
    letter-spacing: 0.16em;
    line-height: 1;
    white-space: nowrap;
    color: ${INK};
    /* The tracking adds a trailing gap after the last letter; pull it back so the lockup is
       optically centred rather than mathematically centred. */
    margin-right: -0.16em;
  }
  .accent {
    background: linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO});
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="lockup">
    <span class="mark">${MARK}</span>
    <span class="word">VAŠ <span class="accent">BREND</span></span>
  </div>
</body>
</html>`;
}

async function main() {
  const fontBase64 = readFileSync(FONT_PATH).toString("base64");

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  await page.setContent(buildHtml(fontBase64), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  const png = await page.screenshot({ type: "png" });
  await browser.close();

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const out = await sharp(png).webp({ quality: 92, effort: 6 }).toBuffer();
  await sharp(out).toFile(OUTPUT_PATH);

  console.log(
    `branding-billboard.webp  ${WIDTH}x${HEIGHT}  ${(out.length / 1024).toFixed(1)} KB`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
