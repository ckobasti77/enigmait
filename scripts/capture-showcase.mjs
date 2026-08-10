#!/usr/bin/env node

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

const CONFIG_PATH = resolve("showcase", "showcase.config.json");
const OUTPUT_ROOT = resolve("showcase", "captures");

const NAV_TIMEOUT = 45000;
const CONTENT_TIMEOUT = 20000;
const SCROLL_TOLERANCE = 2;
const MIN_FRAME_STDDEV = 3;
const AUTO_STOP_HOLD_MS = 350;
const CONTENT_CHAR_LIMIT = 8000;

function parseArgs(argv) {
  const args = { project: null, all: false };

  for (const arg of argv) {
    if (arg === "--all") args.all = true;
    else if (arg.startsWith("--project=")) args.project = arg.slice("--project=".length);
  }

  return args;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function loadConfig() {
  let raw;
  try {
    raw = readFileSync(CONFIG_PATH, "utf8");
  } catch {
    throw new Error(`Config not found at ${CONFIG_PATH}`);
  }

  const config = JSON.parse(raw);
  if (!config.defaults || !Array.isArray(config.projects)) {
    throw new Error("Config is missing 'defaults' or 'projects'");
  }

  return config;
}

/**
 * Resolves stops to absolute scroll offsets inside the page, then expands them into one
 * scroll offset per frame: holdFrames sitting still at each stop (the dwell), and the
 * remaining budget spent travelling between them on an easeInOutCubic curve.
 */
function buildScrollTrack(stopsPx, holdsMs, totalFrames, fps) {
  const holdFrames = holdsMs.map((ms) => Math.round((ms / 1000) * fps));
  const totalHold = holdFrames.reduce((sum, n) => sum + n, 0);
  const segments = stopsPx.length - 1;
  const travelFrames = totalFrames - totalHold;

  if (segments < 1) return new Array(totalFrames).fill(stopsPx[0] ?? 0);

  if (travelFrames < segments) {
    throw new Error(
      `holdMs values total ${totalHold} frames of a ${totalFrames} frame budget, leaving ` +
        `${travelFrames} for ${segments} scroll segments. Shorten the holds or raise the duration.`
    );
  }

  // Frames per segment are proportional to distance travelled, so scroll speed stays even
  // instead of crawling through long segments and racing through short ones.
  const distances = [];
  for (let i = 0; i < segments; i++) distances.push(Math.abs(stopsPx[i + 1] - stopsPx[i]));
  const totalDistance = distances.reduce((sum, d) => sum + d, 0);

  const segmentFrames = [];
  let assigned = 0;
  for (let i = 0; i < segments; i++) {
    const share =
      totalDistance > 0 ? (distances[i] / totalDistance) * travelFrames : travelFrames / segments;
    // Carry the rounding remainder so the frames always add up to exactly travelFrames.
    const n = i === segments - 1 ? travelFrames - assigned : Math.max(1, Math.round(share));
    segmentFrames.push(n);
    assigned += n;
  }

  const track = [];
  for (let i = 0; i < stopsPx.length; i++) {
    for (let h = 0; h < holdFrames[i]; h++) track.push(stopsPx[i]);

    if (i < segments) {
      const from = stopsPx[i];
      const to = stopsPx[i + 1];
      const n = segmentFrames[i];
      for (let f = 1; f <= n; f++) {
        track.push(from + (to - from) * easeInOutCubic(f / n));
      }
    }
  }

  while (track.length < totalFrames) track.push(stopsPx[stopsPx.length - 1]);
  return track.slice(0, totalFrames);
}

/**
 * The journey window is the slice of the page a clip is allowed to travel across, as a
 * fraction of maxScroll. It exists because one duration cannot serve a 1948px page and an
 * 18067px one: without it, "at" spreads the same frame budget over whatever the page
 * happens to be tall, and long sites blur past. Defaults to the whole page.
 */
function resolveJourney(project, variantName) {
  const base = project.journey ?? {};
  const override = base[variantName] ?? {};
  return {
    from: override.from ?? base.from ?? 0,
    to: override.to ?? base.to ?? 1,
  };
}

async function resolveStops(page, stops, journey) {
  return page.evaluate(
    ({ stops, autoHoldMs, journey }) => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // "at" is a fraction of the journey window, not of the page.
      const span = journey.to - journey.from;
      const atToPx = (at) => (journey.from + at * span) * maxScroll;

      if (!stops) {
        return {
          maxScroll,
          resolved: [0, 1 / 3, 2 / 3, 1].map((at) => ({
            px: Math.round(atToPx(at)),
            holdMs: autoHoldMs,
            from: `auto ${at.toFixed(2)}`,
          })),
        };
      }

      const resolved = stops.map((stop) => {
        let px;
        let from;

        if (typeof stop.selector === "string") {
          // Selector stops name a real element, so the window does not apply to them —
          // scaling an element's own offset would just point somewhere else.
          const el = document.querySelector(stop.selector);
          if (!el) throw new Error(`Stop selector not found in page: ${stop.selector}`);
          px = el.getBoundingClientRect().top + window.scrollY;
          from = `selector ${stop.selector}`;
        } else {
          px = atToPx(stop.at ?? 0);
          from = `at ${stop.at}`;
        }

        return {
          px: Math.round(Math.min(Math.max(px, 0), maxScroll)),
          holdMs: stop.holdMs ?? 0,
          from,
        };
      });

      return { maxScroll, resolved };
    },
    { stops, autoHoldMs: AUTO_STOP_HOLD_MS, journey }
  );
}

async function dismissCookies(page, project, defaults) {
  for (const selector of project.dismissSelectors ?? []) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
      await locator.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      console.log(`  cookie: clicked configured selector ${selector}`);
      return { source: "dismissSelectors", selector };
    }
  }

  // Cookiebot/OneTrust style banners live in an iframe, so every frame gets searched.
  for (const text of defaults.cookieAcceptText ?? []) {
    for (const frame of page.frames()) {
      const locator = frame
        .locator('button, [role="button"], a')
        .filter({ hasText: new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i") })
        .first();

      if ((await locator.count()) === 0) continue;
      if (!(await locator.isVisible().catch(() => false))) continue;

      const info = await locator.evaluate((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: typeof el.className === "string" ? el.className : null,
      }));

      await locator.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);

      const suggested = info.id
        ? `#${info.id}`
        : info.className
          ? `${info.tag}.${info.className.trim().split(/\s+/).join(".")}`
          : info.tag;

      console.log(`  cookie: matched text "${text}" -> <${info.tag}> in ${frame.url()}`);
      console.log(`  cookie: suggested dismissSelectors entry -> ${JSON.stringify(suggested)}`);
      return { source: "cookieAcceptText", text, selector: suggested, frame: frame.url() };
    }
  }

  console.log("  cookie: no banner matched (dismissSelectors empty, no accept text found)");
  return null;
}

/**
 * Chat bubbles, back-to-top buttons and privacy pills sit in every single frame. A
 * stylesheet rather than removal, so the site's own scripts keep finding their nodes.
 */
async function hideWidgets(page, project) {
  const selectors = project.hideSelectors ?? [];
  if (selectors.length === 0) return;

  await page.addStyleTag({ content: `${selectors.join(",")}{display:none !important}` });
}

// Counted after the page has settled, not at injection time — the selector may target a
// widget that only mounts later. Zero matches then means the selector is genuinely stale.
async function countHidden(page, project) {
  const selectors = project.hideSelectors ?? [];
  if (selectors.length === 0) return [];

  const counts = await page.evaluate(
    (list) => list.map((selector) => document.querySelectorAll(selector).length),
    selectors
  );

  const hidden = selectors.map((selector, i) => ({ selector, matched: counts[i] }));

  for (const { selector, matched } of hidden) {
    if (matched === 0) {
      console.log(`  hide: !! ${selector} matched 0 elements — selector may be stale`);
    } else {
      console.log(`  hide: ${selector} (${matched})`);
    }
  }

  return hidden;
}

async function disableSmoothScroll(page) {
  const found = await page.evaluate(() => {
    const hits = [];

    if (window.lenis && typeof window.lenis.destroy === "function") {
      window.lenis.destroy();
      hits.push("window.lenis (destroyed)");
    }
    if (document.documentElement.classList.contains("lenis")) {
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped"
      );
      hits.push("html.lenis (classes removed)");
    }
    if (document.querySelector("[data-lenis]")) hits.push("[data-lenis] element");

    const smoother = window.ScrollSmoother?.get?.();
    if (smoother) {
      smoother.kill();
      hits.push("ScrollSmoother (killed)");
    }
    if (document.querySelector("[data-scroll-container]")) hits.push("locomotive container");

    const style = document.createElement("style");
    style.textContent = "html,body{scroll-behavior:auto !important}";
    document.head.appendChild(style);

    return hits;
  });

  if (found.length > 0) console.log(`  smooth-scroll: ${found.join(", ")}`);
  return found;
}

async function pauseVideos(page) {
  const result = await page.evaluate(() => {
    const videos = [...document.querySelectorAll("video")];
    let seeked = 0;

    for (const video of videos) {
      try {
        video.pause();
        video.autoplay = false;
        video.loop = false;
        const target = Math.min(1.5, (video.duration || 0) - 0.05);
        if (Number.isFinite(target) && target > 0) {
          video.currentTime = target;
          seeked++;
        }
      } catch {
        /* cross-origin or not ready */
      }
    }

    return { found: videos.length, seeked };
  });

  if (result.found > 0) await page.waitForTimeout(300);
  return result;
}

/**
 * Decodes the frame inside the browser we already have open and returns the luminance
 * standard deviation. A blank or single-colour page lands near 0; real content is well above.
 */
async function frameStdDev(page, buffer) {
  return page.evaluate(async (base64) => {
    // atob rather than fetch("data:...") — a strict connect-src CSP would block the fetch.
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/jpeg" }));
    const canvas = new OffscreenCanvas(160, 100);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, 160, 100);

    const { data } = ctx.getImageData(0, 0, 160, 100);
    const count = 160 * 100;
    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += luminance;
      sumSquares += luminance * luminance;
    }

    return Math.sqrt(sumSquares / count - (sum / count) ** 2);
  }, buffer.toString("base64"));
}

async function preparePage(page, project, defaults) {
  const response = await page.goto(project.url, {
    waitUntil: "load",
    timeout: NAV_TIMEOUT,
  });

  if (response && response.status() >= 400) {
    throw new Error(`${project.url} returned HTTP ${response.status()}`);
  }

  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {
    console.log("  warn: page never reached network idle, continuing");
  });

  if (project.waitForSelector) {
    await page.waitForSelector(project.waitForSelector, { timeout: CONTENT_TIMEOUT });
  }

  // Content gate — CSR sites ship an empty shell, so 'load' means nothing there.
  await page
    .waitForFunction(
      () =>
        document.body &&
        (document.body.innerText.trim().length > 200 || document.body.childElementCount > 5),
      { timeout: CONTENT_TIMEOUT }
    )
    .catch(() => {
      console.log("  warn: page still looks empty after content wait");
    });

  await page.evaluate(() => document.fonts.ready);

  // Injected before the banner is dismissed, not after: a stylesheet keeps applying to
  // nodes that mount later, and the privacy pill only exists once consent is answered.
  await hideWidgets(page, project);

  const cookie = await dismissCookies(page, project, defaults);
  const smoothScroll = await disableSmoothScroll(page);

  let videos = { found: 0, seeked: 0 };
  if (defaults.pauseVideos) videos = await pauseVideos(page);

  // Warm-up pass: walk to the bottom and back so lazy images and scroll-reveal have fired
  // before frame 1, then let it settle.
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    for (let i = 1; i <= 12; i++) {
      window.scrollTo(0, (max * i) / 12);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  if (defaults.pauseVideos) {
    const after = await pauseVideos(page);
    videos = { found: Math.max(videos.found, after.found), seeked: Math.max(videos.seeked, after.seeked) };
  }

  if (videos.found > 0) {
    console.log(
      `  video: paused ${videos.found}, seeked ${videos.seeked} to 1.5s` +
        (videos.seeked < videos.found ? ` (${videos.found - videos.seeked} not seekable)` : "")
    );
  }

  const hidden = await countHidden(page, project);

  return { cookie, hidden, smoothScroll, videos };
}

/**
 * Reports the fastest single-frame jump in the built track. Anything above the threshold is
 * scroll the eye cannot follow, so the caller shortens the journey and recaptures — never
 * silently: the measurement, the threshold and the applied window all land in meta.json.
 *
 * The suggestion is exact rather than a guess — scaling the journey window scales every
 * frame-to-frame delta by the same factor, because the per-segment frame split depends on
 * the *ratio* of the distances, which the scaling leaves untouched.
 */
function measureScrollSpeed(track, threshold, journey) {
  let measured = 0;
  let moving = 0;
  let travelled = 0;

  for (let i = 1; i < track.length; i++) {
    const delta = Math.abs(track[i] - track[i - 1]);
    measured = Math.max(measured, delta);
    if (delta > 0.5) {
      moving++;
      travelled += delta;
    }
  }

  measured = Math.round(measured);
  const average = moving > 0 ? travelled / moving : 0;
  const exceeded = threshold != null && measured > threshold;

  const suggestedTo = exceeded
    ? Number((journey.from + (journey.to - journey.from) * (threshold / measured)).toFixed(3))
    : null;

  if (exceeded) {
    console.log(
      `  !! TOO FAST: ${measured}px between frames, threshold is ${threshold}px ` +
        `(${(measured / average).toFixed(1)}x the ${Math.round(average)}px average — easing peaks mid-segment).\n` +
        `     journey.to ${journey.to} -> ${suggestedTo} would fit.`
    );
  } else {
    console.log(`  speed: peak ${measured}px/frame, average ${Math.round(average)}px/frame`);
  }

  return { maxPxPerFrame: measured, averagePxPerFrame: Math.round(average), threshold, exceeded, suggestedTo };
}

const JOURNEY_STEP = 0.05;

/**
 * Rounds the fitted end of the window DOWN to a 0.05 step, so the applied value is a number
 * a human can read in a config rather than 0.412. Down, never up: up would land back over
 * the threshold. Below one step there is nothing left to round to — a 0.03 window is still a
 * real clip, while 0 is no clip at all — so the exact fitted value is used instead.
 */
function fitJourneyTo(journey, suggestedTo) {
  const stepped = Number((Math.floor(suggestedTo / JOURNEY_STEP) * JOURNEY_STEP).toFixed(2));
  if (stepped > journey.from) return stepped;
  return Number(suggestedTo.toFixed(3));
}

/**
 * The one thing every card description is written from. Taken on desktop only, after the page
 * has settled and the widgets are gone, so it is the copy a reader would actually see.
 */
async function extractContent(page, project) {
  const content = await page.evaluate((limit) => {
    const text = document.body.innerText
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      title: document.title ?? "",
      description: document.querySelector('meta[name="description"]')?.content ?? "",
      body: text.slice(0, limit),
      bodyLength: text.length,
    };
  }, CONTENT_CHAR_LIMIT);

  const file = [
    `# ${project.name}`,
    `url: ${project.url}`,
    ``,
    `## title`,
    content.title,
    ``,
    `## meta description`,
    content.description || "(none)",
    ``,
    `## body text${content.bodyLength > CONTENT_CHAR_LIMIT ? ` (truncated from ${content.bodyLength} chars)` : ""}`,
    content.body,
    ``,
  ].join("\n");

  mkdirSync(join(OUTPUT_ROOT, project.id), { recursive: true });
  writeFileSync(join(OUTPUT_ROOT, project.id, "content.txt"), file, "utf8");

  console.log(
    `  content: title ${content.title.length} chars, description ${content.description.length}, ` +
      `body ${Math.min(content.bodyLength, CONTENT_CHAR_LIMIT)}/${content.bodyLength} -> content.txt`
  );

  return {
    title: content.title,
    description: content.description,
    bodyLength: content.bodyLength,
    truncated: content.bodyLength > CONTENT_CHAR_LIMIT,
  };
}

async function captureVariant(context, project, defaults, variant, viewport) {
  const fps = defaults.fps;
  const durationSec = defaults.durations[project.variant];
  if (!durationSec) {
    throw new Error(`No duration configured for variant "${project.variant}"`);
  }

  const totalFrames = Math.round(fps * durationSec);
  const outputDir = join(OUTPUT_ROOT, project.id, variant);

  console.log(`\n[${project.id}] ${variant} ${viewport.width}x${viewport.height} — ${totalFrames} frames`);

  const page = await context.newPage();
  page.setDefaultTimeout(CONTENT_TIMEOUT);
  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  try {
    const prep = await preparePage(page, project, defaults);

    const content = variant === "desktop" ? await extractContent(page, project) : null;

    const journey = resolveJourney(project, variant);
    let { maxScroll, resolved } = await resolveStops(page, project.stops, journey);
    if (!project.stops) console.log("  stops: null in config, using auto 4-point split");
    console.log(
      `  scroll range: 0 - ${maxScroll}px, journey ${journey.from}-${journey.to} ` +
        `(${Math.round((journey.to - journey.from) * maxScroll)}px), ` +
        `stops at ${resolved.map((s) => s.px).join(", ")}`
    );

    const buildTrack = (stops) =>
      buildScrollTrack(
        stops.map((s) => s.px),
        stops.map((s) => s.holdMs),
        totalFrames,
        fps
      );

    let track = buildTrack(resolved);
    let scrollSpeed = measureScrollSpeed(track, defaults.maxPxPerFrame, journey);
    let journeyAdjusted = null;

    // Shortening the window is allowed, going quiet about it is not: the applied value is
    // logged here, stored in meta.json below, and carried into the report.
    if (scrollSpeed.exceeded) {
      const requestedTo = journey.to;
      journey.to = fitJourneyTo(journey, scrollSpeed.suggestedTo);

      ({ resolved } = await resolveStops(page, project.stops, journey));
      track = buildTrack(resolved);
      const after = measureScrollSpeed(track, defaults.maxPxPerFrame, journey);

      journeyAdjusted = {
        measuredPxPerFrame: scrollSpeed.maxPxPerFrame,
        threshold: defaults.maxPxPerFrame,
        requestedTo,
        appliedTo: journey.to,
        pxPerFrameAfter: after.maxPxPerFrame,
      };
      scrollSpeed = after;

      console.log(
        `  !! JOURNEY SHORTENED: to ${requestedTo} -> ${journey.to} ` +
          `(${journeyAdjusted.measuredPxPerFrame}px/frame -> ${after.maxPxPerFrame}px/frame, ` +
          `threshold ${defaults.maxPxPerFrame}px). Recorded as journeyAdjusted in meta.json.\n` +
          `     window is now ${Math.round((journey.to - journey.from) * maxScroll)}px, ` +
          `stops at ${resolved.map((s) => s.px).join(", ")}`
      );
    }

    rmSync(outputDir, { recursive: true, force: true });
    mkdirSync(outputDir, { recursive: true });

    let scrollMismatchWarned = false;

    for (let i = 0; i < track.length; i++) {
      const target = Math.round(track[i]);

      let actual = await page.evaluate((y) => {
        window.scrollTo(0, y);
        return window.scrollY;
      }, target);

      // A smooth-scroll library that survived the neutralisation shows up here as the page
      // refusing to land where it was put.
      if (Math.abs(actual - target) > SCROLL_TOLERANCE) {
        actual = await page.evaluate((y) => {
          window.scrollTo(0, y);
          return window.scrollY;
        }, target);

        if (Math.abs(actual - target) > SCROLL_TOLERANCE && !scrollMismatchWarned) {
          scrollMismatchWarned = true;
          console.log(
            `  !! SCROLL HIJACK: asked for ${target}px, page sits at ${Math.round(actual)}px. ` +
              `A smooth-scroll library is fighting scrollTo. Frames may not move. Capturing anyway.`
          );
        }
      }

      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      );
      await page.waitForTimeout(16);

      const buffer = await page.screenshot({ type: "jpeg", quality: defaults.jpegQuality ?? 80 });

      if (i === 0) {
        const stdDev = await frameStdDev(page, buffer);
        if (stdDev < MIN_FRAME_STDDEV) {
          const textLength = await page.evaluate(() => document.body.innerText.trim().length);
          throw new Error(
            `first frame is practically blank (luminance stdDev ${stdDev.toFixed(2)}, ` +
              `body text ${textLength} chars). Aborting instead of writing ${totalFrames} empty frames. ` +
              `Likely the app never rendered — try a waitForSelector in the config.`
          );
        }
        console.log(`  sanity: first frame stdDev ${stdDev.toFixed(1)} — has content`);
      }

      writeFileSync(join(outputDir, `${String(i + 1).padStart(4, "0")}.jpg`), buffer);

      if ((i + 1) % 30 === 0) console.log(`  ${i + 1}/${totalFrames} frames`);
    }

    return {
      dir: `showcase/captures/${project.id}/${variant}`,
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      frames: track.length,
      fps,
      durationSec,
      maxScroll,
      journey,
      journeyAdjusted,
      scrollSpeed,
      stops: resolved,
      scrollHijack: scrollMismatchWarned,
      content,
      ...prep,
    };
  } finally {
    await page.close();
  }
}

// A card renders ~600px wide, so 1440 native already covers a 2x display; a case study runs
// near full width and does not. The config decides — throwing beats guessing a default,
// because a missing entry is a config bug and silently picking 1 would hide it.
function resolveDeviceScaleFactor(defaults, variantName) {
  const dsf = defaults.deviceScaleFactorByVariant?.[variantName];
  if (!dsf) {
    throw new Error(
      `No defaults.deviceScaleFactorByVariant entry for variant "${variantName}"`
    );
  }
  return dsf;
}

async function captureProject(browser, project, defaults) {
  const variants = {};
  const deviceScaleFactor = resolveDeviceScaleFactor(defaults, project.variant);

  const desktop = { ...defaults.desktop, deviceScaleFactor };
  const mobile = { ...defaults.mobile, deviceScaleFactor };

  const desktopContext = await browser.newContext({
    viewport: { width: desktop.width, height: desktop.height },
    deviceScaleFactor,
  });
  if (defaults.pauseVideos) await addMediaGuard(desktopContext);

  try {
    variants.desktop = await captureVariant(desktopContext, project, defaults, "desktop", desktop);
  } finally {
    await desktopContext.close();
  }

  if (project.captureMobile) {
    const mobileContext = await browser.newContext({
      viewport: { width: mobile.width, height: mobile.height },
      deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
    });
    if (defaults.pauseVideos) await addMediaGuard(mobileContext);

    try {
      variants.mobile = await captureVariant(mobileContext, project, defaults, "mobile", mobile);
    } finally {
      await mobileContext.close();
    }
  }

  const meta = {
    id: project.id,
    name: project.name,
    url: project.url,
    variant: project.variant,
    capturedAt: new Date().toISOString(),
    variants,
  };

  mkdirSync(join(OUTPUT_ROOT, project.id), { recursive: true });
  writeFileSync(join(OUTPUT_ROOT, project.id, "meta.json"), JSON.stringify(meta, null, 2), "utf8");

  return meta;
}

// Capture is not real time, so a video that starts playing mid-run smears across frames.
// Neutralising play() catches the ones that mount after the initial pause pass.
async function addMediaGuard(context) {
  await context.addInitScript(() => {
    HTMLMediaElement.prototype.play = function play() {
      return Promise.resolve();
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();

  if (!args.all && !args.project) {
    console.error("Usage: node scripts/capture-showcase.mjs --project=<id> | --all");
    process.exit(1);
  }

  let queue;
  if (args.all) {
    queue = config.projects.filter((p) => p.enabled !== false);
    const skipped = config.projects.length - queue.length;
    if (skipped > 0) console.log(`Skipping ${skipped} disabled project(s)`);
  } else {
    const project = config.projects.find((p) => p.id === args.project);
    if (!project) {
      console.error(`Unknown project "${args.project}". Available ids:`);
      for (const p of config.projects) {
        console.error(`  ${p.id}${p.enabled === false ? " (disabled)" : ""}`);
      }
      process.exit(1);
    }
    queue = [project];
  }

  const browser = await chromium.launch();
  const failures = [];

  try {
    for (const project of queue) {
      try {
        await captureProject(browser, project, config.defaults);
      } catch (error) {
        console.error(`\nFAILED [${project.id}]: ${error.message}`);
        failures.push(project.id);
      }
    }
  } finally {
    await browser.close();
  }

  const done = queue.length - failures.length;
  console.log(`\nCaptured ${done}/${queue.length} project(s) into ${OUTPUT_ROOT}`);

  if (failures.length > 0) {
    console.error(`Failed: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
