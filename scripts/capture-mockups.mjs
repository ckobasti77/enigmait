#!/usr/bin/env node

/**
 * Screenshots the live URL of every enabled project in showcase.config.json at four
 * viewports and writes optimised webp mockups to public/mockups/<id>/<size>.webp, plus a
 * manifest at constants/projectMockups.ts that step 11 reads.
 *
 * Reuses the showcase capture pipeline's approach (scripts/capture-showcase.mjs) for
 * cookie/widget handling rather than re-deriving it, but this is a single still frame per
 * viewport, not a scroll-driven clip, so the scroll-track machinery is left out.
 */

import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const CONFIG_PATH = resolve("showcase", "showcase.config.json");
const OUTPUT_ROOT = resolve("public", "mockups");
const MANIFEST_PATH = resolve("constants", "projectMockups.ts");
const REPORT_PATH = resolve("showcase", "redesign-round2", "REPORT-10.md");

const NAV_TIMEOUT = 60000;
const CONTENT_TIMEOUT = 15000;
const WEBP_QUALITY = 72;

/** Each screenshot is the viewport itself, sized to ~1.5 screens tall, never a full-page shot. */
const SIZES = [
  { key: "desktop", width: 1920, height: 1620, cap: 1600, isMobile: false, hasTouch: false },
  { key: "laptop", width: 1440, height: 1350, cap: 1440, isMobile: false, hasTouch: false },
  { key: "tablet", width: 834, height: 1791, cap: 800, isMobile: false, hasTouch: true },
  { key: "mobile", width: 390, height: 1266, cap: 400, isMobile: true, hasTouch: true },
];

function loadConfig() {
  const raw = readFileSync(CONFIG_PATH, "utf8");
  const config = JSON.parse(raw);
  if (!config.defaults || !Array.isArray(config.projects)) {
    throw new Error("Config is missing 'defaults' or 'projects'");
  }
  return config;
}

async function dismissCookies(page, project, defaults) {
  for (const selector of project.dismissSelectors ?? []) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
      await locator.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      return;
    }
  }

  for (const text of defaults.cookieAcceptText ?? []) {
    for (const frame of page.frames()) {
      const locator = frame
        .locator('button, [role="button"], a')
        .filter({ hasText: new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i") })
        .first();

      if ((await locator.count()) === 0) continue;
      if (!(await locator.isVisible().catch(() => false))) continue;

      await locator.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      return;
    }
  }
}

async function hideWidgets(page, project) {
  const selectors = project.hideSelectors ?? [];
  if (selectors.length === 0) return;
  await page.addStyleTag({ content: `${selectors.join(",")}{display:none !important}` });
}

async function disableSmoothScroll(page) {
  await page.evaluate(() => {
    if (window.lenis && typeof window.lenis.destroy === "function") window.lenis.destroy();
    document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped");
    window.ScrollSmoother?.get?.()?.kill?.();
    const style = document.createElement("style");
    style.textContent = "html,body{scroll-behavior:auto !important}";
    document.head.appendChild(style);
  });
}

async function pauseVideos(page) {
  await page.evaluate(() => {
    for (const video of document.querySelectorAll("video")) {
      try {
        video.pause();
        video.autoplay = false;
        video.loop = false;
        const target = Math.min(1.5, (video.duration || 0) - 0.05);
        if (Number.isFinite(target) && target > 0) video.currentTime = target;
      } catch {
        /* cross-origin or not ready */
      }
    }
  });
}

async function addMediaGuard(context) {
  await context.addInitScript(() => {
    HTMLMediaElement.prototype.play = function play() {
      return Promise.resolve();
    };
  });
}

async function preparePage(page, project, defaults) {
  const response = await page.goto(project.url, { waitUntil: "load", timeout: NAV_TIMEOUT });
  if (response && response.status() >= 400) {
    throw new Error(`${project.url} returned HTTP ${response.status()}`);
  }

  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});

  if (project.waitForSelector) {
    await page.waitForSelector(project.waitForSelector, { timeout: CONTENT_TIMEOUT }).catch(() => {});
  }

  await page
    .waitForFunction(
      () => document.body && (document.body.innerText.trim().length > 200 || document.body.childElementCount > 5),
      { timeout: CONTENT_TIMEOUT }
    )
    .catch(() => {});

  await page.evaluate(() => document.fonts.ready).catch(() => {});

  await hideWidgets(page, project);
  await dismissCookies(page, project, defaults);
  await disableSmoothScroll(page);
  if (defaults.pauseVideos) await pauseVideos(page);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  if (defaults.pauseVideos) await pauseVideos(page);
  await page.waitForTimeout(200);
}

function runFfmpeg(args, input) {
  const result = spawnSync(ffmpegPath, args, { input, maxBuffer: 1024 * 1024 * 64 });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${result.stderr?.toString() ?? "unknown error"}`);
  }
}

function toWebp(pngBuffer, outPath, capWidth) {
  mkdirSync(resolve(outPath, ".."), { recursive: true });
  runFfmpeg(
    [
      "-y",
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "-i",
      "pipe:0",
      "-vf",
      `scale='min(iw,${capWidth})':-1:flags=lanczos`,
      "-c:v",
      "libwebp",
      "-quality",
      String(WEBP_QUALITY),
      outPath,
    ],
    pngBuffer
  );
}

function makePlaceholder(outPath, width, height) {
  mkdirSync(resolve(outPath, ".."), { recursive: true });
  runFfmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=0x14161c:s=${width}x${height}`,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    String(WEBP_QUALITY),
    outPath,
  ]);
}

async function captureSize(browser, project, defaults, size) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
    isMobile: size.isMobile,
    hasTouch: size.hasTouch,
  });
  if (defaults.pauseVideos) await addMediaGuard(context);

  const page = await context.newPage();
  page.setDefaultTimeout(CONTENT_TIMEOUT);

  try {
    await preparePage(page, project, defaults);
    const buffer = await page.screenshot({ type: "png" });
    const outPath = join(OUTPUT_ROOT, project.id, `${size.key}.webp`);
    toWebp(buffer, outPath, size.cap);
    return { ok: true, path: outPath };
  } finally {
    await context.close();
  }
}

async function captureProject(browser, project, defaults, results) {
  console.log(`\n[${project.id}] ${project.url}`);
  for (const size of SIZES) {
    try {
      const res = await captureSize(browser, project, defaults, size);
      console.log(`  ${size.key}: ok -> ${res.path}`);
      results.push({ id: project.id, size: size.key, ok: true });
    } catch (error) {
      console.error(`  ${size.key}: FAILED (${error.message})`);
      const outPath = join(OUTPUT_ROOT, project.id, `${size.key}.webp`);
      try {
        makePlaceholder(outPath, size.cap, Math.round((size.cap / size.width) * size.height));
        console.log(`  ${size.key}: placeholder written -> ${outPath}`);
      } catch (placeholderError) {
        console.error(`  ${size.key}: placeholder also failed (${placeholderError.message})`);
      }
      results.push({ id: project.id, size: size.key, ok: false, error: error.message });
    }
  }
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function totalWeight() {
  let total = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else total += statSync(full).size;
    }
  };
  if (existsSync(OUTPUT_ROOT)) walk(OUTPUT_ROOT);
  return total;
}

function writeManifest(config, results) {
  const byProject = new Map();
  for (const r of results) {
    if (!byProject.has(r.id)) byProject.set(r.id, {});
    byProject.get(r.id)[r.size] = r.ok;
  }

  const lines = [];
  lines.push("/**");
  lines.push(" * projectId -> the four static mockup images captured off each project's live URL by");
  lines.push(" * `scripts/capture-mockups.mjs`. Written by that script - do not hand-edit the paths, only");
  lines.push(" * re-run the capture.");
  lines.push(" *");
  lines.push(" * `laptopUsesVideo` mirrors whether `constants/projects.ts` has real `media` for this id: the");
  lines.push(" * laptop mockup in the device frame plays `ShowcaseVideo` there and this image is only the");
  lines.push(" * poster/fallback frame, never the primary surface.");
  lines.push(" *");
  lines.push(" * `placeholders` lists sizes whose live capture failed (timeout, non-200, blank render); those");
  lines.push(" * paths point at a flat placeholder frame instead of a real screenshot. See");
  lines.push(" * `showcase/redesign-round2/REPORT-10.md` for which sites/sizes failed and why.");
  lines.push(" */");
  lines.push("");
  lines.push('export type ProjectMockupSize = "desktop" | "laptop" | "tablet" | "mobile";');
  lines.push("");
  lines.push("export type ProjectMockup = {");
  lines.push("  desktop: string;");
  lines.push("  laptop: string;");
  lines.push("  tablet: string;");
  lines.push("  mobile: string;");
  lines.push("  laptopUsesVideo: boolean;");
  lines.push("  placeholders: ProjectMockupSize[];");
  lines.push("};");
  lines.push("");
  lines.push("export const PROJECT_MOCKUPS: Record<string, ProjectMockup> = {");

  for (const project of config.projects) {
    if (project.enabled === false) continue;
    const sizes = byProject.get(project.id) ?? {};
    const placeholders = SIZES.map((s) => s.key).filter((key) => sizes[key] === false);

    lines.push(`  "${project.id}": {`);
    for (const size of SIZES) {
      lines.push(`    ${size.key}: "/mockups/${project.id}/${size.key}.webp",`);
    }
    lines.push("    laptopUsesVideo: true,");
    lines.push(`    placeholders: [${placeholders.map((p) => `"${p}"`).join(", ")}],`);
    lines.push("  },");
  }

  lines.push("};");
  lines.push("");
  lines.push("export default PROJECT_MOCKUPS;");
  lines.push("");

  writeFileSync(MANIFEST_PATH, lines.join("\n"), "utf8");
}

function writeReport(config, results, weightBytes, startedAt) {
  const byProject = new Map();
  for (const r of results) {
    if (!byProject.has(r.id)) byProject.set(r.id, []);
    byProject.get(r.id).push(r);
  }

  const failed = results.filter((r) => !r.ok);
  const lines = [];
  lines.push("# REPORT-10 — Auto-capture screenshotova sajtova (4 veličine) za mockape");
  lines.push("");
  lines.push("Krug 2, korak 10/12. Grana `feat/redesign-round2`.");
  lines.push("");
  lines.push(
    `Snimljeno ${new Date(startedAt).toISOString()}. Playwright, po projektu 4 konteksta (desktop 1920×1620,` +
      " laptop 1440×1350, tablet 834×1791 hasTouch, mobile 390×1266 isMobile+hasTouch), viewport-only screenshot" +
      " (gornji ~1.5 ekrana, ne full-page), konvertovano u webp preko ffmpeg-a (kvalitet 72, cap širine" +
      " 1600/1440/800/400)."
  );
  lines.push("");
  lines.push("## Rezultat po projektu");
  lines.push("");
  lines.push("| projekat | desktop | laptop | tablet | mobile |");
  lines.push("|---|---|---|---|---|");
  for (const project of config.projects) {
    if (project.enabled === false) continue;
    const rows = byProject.get(project.id) ?? [];
    const cell = (key) => {
      const r = rows.find((x) => x.size === key);
      if (!r) return "?";
      return r.ok ? "OK" : "placeholder";
    };
    lines.push(`| ${project.id} | ${cell("desktop")} | ${cell("laptop")} | ${cell("tablet")} | ${cell("mobile")} |`);
  }
  lines.push("");

  if (failed.length > 0) {
    lines.push("## Padovi");
    lines.push("");
    for (const f of failed) {
      lines.push(`- **${f.id} / ${f.size}**: ${f.error}`);
    }
    lines.push("");
  } else {
    lines.push("Svi sajtovi uslikani bez padova.");
    lines.push("");
  }

  lines.push("## Ukupna težina");
  lines.push("");
  lines.push(`\`public/mockups/\` ukupno: ${fmtKB(weightBytes)} (${(weightBytes / 1024 / 1024).toFixed(2)} MB).`);
  lines.push("");
  lines.push("## Manifest");
  lines.push("");
  lines.push("`constants/projectMockups.ts` — `PROJECT_MOCKUPS: Record<string, ProjectMockup>`, generisan ovim");
  lines.push("skriptom (`scripts/capture-mockups.mjs`). Korak 11 ga čita za mockup slike po projektu/veličini.");
  lines.push("");

  mkdirSync(resolve("showcase", "redesign-round2"), { recursive: true });
  writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
}

async function main() {
  const config = loadConfig();
  const queue = config.projects.filter((p) => p.enabled !== false);
  const startedAt = Date.now();

  mkdirSync(OUTPUT_ROOT, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  try {
    for (const project of queue) {
      await captureProject(browser, project, config.defaults, results);
    }
  } finally {
    await browser.close();
  }

  writeManifest(config, results);
  const weight = totalWeight();
  writeReport(config, results, weight, startedAt);

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nDone: ${results.length - failed}/${results.length} captures ok, total weight ${fmtKB(weight)}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
