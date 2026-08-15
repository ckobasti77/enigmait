#!/usr/bin/env node

/**
 * The logo atlas that sits BEHIND the `seo-geo` lens.
 *
 * Three brand cards - Google, ChatGPT, Claude - baked into one texture, so the
 * backdrop is one mesh and one draw call. Run once, commit the output:
 *
 *   npm run lens-logos
 *
 * WHY PLAYWRIGHT AND NOT SVG/sharp COMPOSITING. The wordmark has to be Aeonik, and
 * Aeonik exists in this repo only as `public/assets/fonts/aeonik/*.otf`. librsvg (what
 * sharp would use for `<text>`) resolves fonts through fontconfig, which on Windows will
 * not pick a font up from an arbitrary path. A headless Chromium takes a base64
 * `@font-face` without argument, and the repo already carries playwright for capture.
 *
 * WHY EACH CELL IS A FULL CARD RATHER THAN A FLOATING MARK. The atlas is seen two ways at
 * once: directly around the lens rim, composited over the PAGE (dark in dark theme, light
 * in light), and magnified through the glass, where three.js clears the transmission
 * buffer to WHITE. No single text colour survives both. Giving every cell its own opaque
 * brand-coloured card means the wordmark always has its own background and reads in either
 * theme, on either side of the glass.
 *
 * WHY THE ALPHA IS HARD. The backdrop material is `transparent: false` + `alphaTest` - it
 * has to be, because three.js renders only the OPAQUE list into the transmission buffer
 * (`WebGLRenderLists.push`), so a blended quad would be drawn over the lens instead of
 * through it. Cutout alpha means the rounded corners want crisp edges, not a long ramp.
 */

import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const SOURCE_DIR = resolve("public", "lens-logos");
const FONT_PATH = resolve("public", "assets", "fonts", "aeonik", "aeonik-bold.otf");
const OUTPUT_PATH = resolve(
  "public",
  "assets",
  "screens",
  "disciplines",
  "seo-geo-logos.webp"
);

/** One cell per brand, laid out left to right. `lensBackdrop.ts` reads the same order. */
const CELL_W = 512;
const CELL_H = 620;

/**
 * Card colours are MEASURED off the source art, not picked: the ChatGPT and Claude files
 * are already full-bleed tiles, so the card behind them has to be the exact same value or
 * the tile edge shows as a seam. Google ships as a bare mark, so it gets the white card its
 * own app icon uses, plus a hairline so a white card still has an edge in light theme.
 */
const BRANDS = [
  {
    id: "google",
    file: "google.avif",
    label: "Google",
    card: "#ffffff",
    ink: "#1f1f1f",
    border: "rgba(0, 0, 0, 0.08)",
    /** A bare mark needs room around it; the two tiles are already padded internally. */
    markScale: 0.52,
    /** Source is opaque white outside the tile - flood it away. See `keyOutWhite`. */
    keyWhite: false,
  },
  {
    id: "chatgpt",
    file: "chatgpt.avif",
    label: "ChatGPT",
    card: "#74aa9c",
    ink: "#ffffff",
    border: "rgba(0, 0, 0, 0.10)",
    markScale: 0.78,
    keyWhite: false,
  },
  {
    id: "claude",
    file: "claude.avif",
    label: "Claude",
    card: "#d77654",
    ink: "#fcf3ee",
    border: "rgba(0, 0, 0, 0.10)",
    markScale: 0.78,
    keyWhite: true,
  },
];

/**
 * Corner radius shared by all three, so the set reads as one family, plus a transparent margin
 * inside each cell.
 *
 * The inset is what keeps the three reading as three separate objects floating at three
 * depths rather than as one mosaic: the backdrop quads sit edge to edge, so this margin is the
 * air between the cards.
 */
const CARD_RADIUS = 96;
const CARD_INSET = 18;

/**
 * `claude.avif` ships with no alpha channel: an orange rounded tile holding a cream mark,
 * sitting on a white square. Only the WHITE has to go.
 *
 * Flood fill from the border rather than keying the whole image, and that distinction is
 * the whole safety argument: the cream mark (252,243,238) is within any tolerance loose
 * enough to catch anti-aliased white, but it is enclosed by orange, so a fill that can only
 * travel through connected near-white pixels can never reach it. A global key would eat it.
 *
 * The tolerance is deliberately generous (per-channel, 100) to swallow the anti-aliased
 * ramp between white and orange - the brand orange is 171 away on the green channel, so it
 * still cannot be crossed.
 */
function keyOutWhite(data, width, height, tolerance = 100) {
  const near = (o) =>
    255 - data[o] <= tolerance &&
    255 - data[o + 1] <= tolerance &&
    255 - data[o + 2] <= tolerance;

  const seen = new Uint8Array(width * height);
  const stack = [];

  for (let x = 0; x < width; x++) {
    stack.push(x, x + (height - 1) * width);
  }
  for (let y = 0; y < height; y++) {
    stack.push(y * width, width - 1 + y * width);
  }

  while (stack.length > 0) {
    const index = stack.pop();
    if (seen[index]) continue;
    const offset = index * 4;
    if (!near(offset)) continue;

    seen[index] = 1;
    data[offset + 3] = 0;

    const x = index % width;
    const y = (index - x) / width;
    if (x > 0) stack.push(index - 1);
    if (x < width - 1) stack.push(index + 1);
    if (y > 0) stack.push(index - width);
    if (y < height - 1) stack.push(index + width);
  }

  return data;
}

async function loadMark(brand) {
  const input = sharp(resolve(SOURCE_DIR, brand.file)).ensureAlpha();

  if (!brand.keyWhite) {
    return (await input.png().toBuffer()).toString("base64");
  }

  const { data, info } = await input
    .raw()
    .toBuffer({ resolveWithObject: true });
  keyOutWhite(data, info.width, info.height);

  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  return png.toString("base64");
}

function buildHtml(marks, fontBase64) {
  const cells = BRANDS.map(
    (brand, index) => `
      <div class="cell">
        <div class="card" style="
          background:${brand.card};
          box-shadow: inset 0 0 0 2px ${brand.border};
        ">
          <div class="mark">
            <img src="data:image/png;base64,${marks[index]}" alt="" style="
              width:${Math.round(brand.markScale * 100)}%;
            " />
          </div>
          <div class="label" style="color:${brand.ink};">${brand.label}</div>
        </div>
      </div>`
  ).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Aeonik";
    src: url(data:font/otf;base64,${fontBase64}) format("opentype");
    font-weight: 700;
    font-style: normal;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: transparent;
    width: ${CELL_W * BRANDS.length}px;
    height: ${CELL_H}px;
  }
  body { display: flex; }
  .cell {
    width: ${CELL_W}px;
    height: ${CELL_H}px;
    padding: ${CARD_INSET}px;
  }
  /*
    The mark box takes the slack and the label box is a fixed height, so all three
    wordmarks land on ONE baseline. Centring the whole stack instead lets each card
    settle at its own height - the three marks have different aspects and different
    scales - and three labels at three heights reads as a mistake rather than a set.
  */
  .card {
    width: 100%;
    height: 100%;
    border-radius: ${CARD_RADIUS}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }
  .mark {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mark img { display: block; height: auto; }
  .label {
    height: 150px;
    display: flex;
    align-items: center;
    font-family: "Aeonik", sans-serif;
    font-weight: 700;
    font-size: 68px;
    letter-spacing: -0.01em;
    line-height: 1;
    white-space: nowrap;
  }
</style>
</head>
<body>${cells}</body>
</html>`;
}

async function main() {
  const fontBase64 = readFileSync(FONT_PATH).toString("base64");
  const marks = [];
  for (const brand of BRANDS) {
    marks.push(await loadMark(brand));
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CELL_W * BRANDS.length, height: CELL_H },
    deviceScaleFactor: 1,
  });

  await page.setContent(buildHtml(marks, fontBase64), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  const png = await page.screenshot({ omitBackground: true, type: "png" });
  await browser.close();

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const out = await sharp(png)
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toBuffer();

  await sharp(out).toFile(OUTPUT_PATH);

  const kb = (out.length / 1024).toFixed(1);
  console.log(
    `seo-geo-logos.webp  ${CELL_W * BRANDS.length}x${CELL_H}  ${kb} KB  (${BRANDS
      .map((b) => b.id)
      .join(", ")})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
