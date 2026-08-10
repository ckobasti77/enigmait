#!/usr/bin/env node

import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const CONFIG_PATH = resolve("showcase", "showcase.config.json");
const CAPTURES_ROOT = resolve("showcase", "captures");
const OUTPUT_ROOT = resolve("public", "showcase");

const FPS = 30;
const CARD_SIZE = { width: 1440, height: 900 };
const SM_SIZE = { width: 720, height: 450 };
const MAX_CRF_BUMPS = 2;
const CRF_STEP = 3;
const BUDGETS = {
  "card.mp4": 1.5 * 1024 * 1024,
  "card-sm.mp4": 500 * 1024,
};

function parseArgs(argv) {
  const args = { project: null, all: false };
  for (const arg of argv) {
    if (arg === "--all") args.all = true;
    else if (arg.startsWith("--project=")) args.project = arg.slice("--project=".length);
  }
  return args;
}

function loadConfig() {
  const raw = readFileSync(CONFIG_PATH, "utf8");
  const config = JSON.parse(raw);
  if (!config.defaults || !Array.isArray(config.projects)) {
    throw new Error("Config is missing 'defaults' or 'projects'");
  }
  return config;
}

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    throw new Error(
      `ffmpeg failed (${args.join(" ")})\n${result.stderr?.toString() ?? ""}`
    );
  }
  return result;
}

function fileSize(path) {
  return statSync(path).size;
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// Encodes one output with a crf, and if it comes in over budget, bumps crf and re-encodes
// (up to MAX_CRF_BUMPS times) rather than silently accepting or silently degrading forever.
function encodeWithBudget({ budgetKey, baseArgs, crfFlagIndex, startCrf, outPath }) {
  let crf = startCrf;
  let attempt = 0;
  const budget = BUDGETS[budgetKey];

  while (true) {
    const args = [...baseArgs];
    args[crfFlagIndex] = String(crf);
    run(args);
    const size = fileSize(outPath);

    if (!budget || size <= budget || attempt >= MAX_CRF_BUMPS) {
      const over = budget && size > budget;
      return { size, crf, over };
    }

    attempt += 1;
    crf += CRF_STEP;
  }
}

function encodeProject(id, framesDir) {
  const outDir = join(OUTPUT_ROOT, id);
  mkdirSync(outDir, { recursive: true });

  const inputPattern = join(framesDir, "%04d.jpg");
  const report = { id, outputs: [] };

  // card.mp4 — H.264, 1440x900
  {
    const outPath = join(outDir, "card.mp4");
    const baseArgs = [
      "-y",
      "-framerate", String(FPS),
      "-i", inputPattern,
      "-vf", `scale=${CARD_SIZE.width}:${CARD_SIZE.height}:flags=lanczos`,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "23", // overwritten by encodeWithBudget
      "-preset", "slow",
      "-movflags", "+faststart",
      "-an",
      outPath,
    ];
    const crfFlagIndex = baseArgs.indexOf("-crf") + 1;
    const res = encodeWithBudget({
      budgetKey: "card.mp4",
      baseArgs,
      crfFlagIndex,
      startCrf: 23,
      outPath,
    });
    report.outputs.push({ file: "card.mp4", ...res });
  }

  // card.webm — VP9, 1440x900
  {
    const outPath = join(outDir, "card.webm");
    const baseArgs = [
      "-y",
      "-framerate", String(FPS),
      "-i", inputPattern,
      "-vf", `scale=${CARD_SIZE.width}:${CARD_SIZE.height}:flags=lanczos`,
      "-c:v", "libvpx-vp9",
      "-crf", "34",
      "-b:v", "0",
      "-row-mt", "1",
      "-an",
      outPath,
    ];
    run(baseArgs);
    report.outputs.push({ file: "card.webm", size: fileSize(outPath) });
  }

  // card-sm.mp4 — H.264, 720x450
  {
    const outPath = join(outDir, "card-sm.mp4");
    const baseArgs = [
      "-y",
      "-framerate", String(FPS),
      "-i", inputPattern,
      "-vf", `scale=${SM_SIZE.width}:${SM_SIZE.height}:flags=lanczos`,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "23",
      "-preset", "slow",
      "-movflags", "+faststart",
      "-an",
      outPath,
    ];
    const crfFlagIndex = baseArgs.indexOf("-crf") + 1;
    const res = encodeWithBudget({
      budgetKey: "card-sm.mp4",
      baseArgs,
      crfFlagIndex,
      startCrf: 23,
      outPath,
    });
    report.outputs.push({ file: "card-sm.mp4", ...res });
  }

  // card-sm.webm — VP9, 720x450
  {
    const outPath = join(outDir, "card-sm.webm");
    const baseArgs = [
      "-y",
      "-framerate", String(FPS),
      "-i", inputPattern,
      "-vf", `scale=${SM_SIZE.width}:${SM_SIZE.height}:flags=lanczos`,
      "-c:v", "libvpx-vp9",
      "-crf", "34",
      "-b:v", "0",
      "-row-mt", "1",
      "-an",
      outPath,
    ];
    run(baseArgs);
    report.outputs.push({ file: "card-sm.webm", size: fileSize(outPath) });
  }

  // poster.webp — first frame, width 1440, quality 82
  {
    const firstFrame = join(framesDir, "0001.jpg");
    const outPath = join(outDir, "poster.webp");
    run([
      "-y",
      "-i", firstFrame,
      "-vf", `scale=${CARD_SIZE.width}:-1:flags=lanczos`,
      "-c:v", "libwebp",
      "-quality", "82",
      outPath,
    ]);
    report.outputs.push({ file: "poster.webp", size: fileSize(outPath) });
  }

  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project && !args.all) {
    console.error("Usage: node scripts/encode-showcase.mjs --project=<id> | --all");
    process.exit(1);
  }

  const config = loadConfig();
  const targets = args.all
    ? config.projects
    : config.projects.filter((p) => p.id === args.project);

  if (targets.length === 0) {
    console.error(`No project found matching '${args.project}'`);
    process.exit(1);
  }

  mkdirSync(OUTPUT_ROOT, { recursive: true });

  const reports = [];
  for (const project of targets) {
    const framesDir = join(CAPTURES_ROOT, project.id, "desktop");

    if (!project.enabled) {
      console.log(`[skip] ${project.id} — disabled in config`);
      continue;
    }
    if (!existsSync(framesDir)) {
      console.log(`[skip] ${project.id} — no desktop capture at ${framesDir}`);
      continue;
    }
    const frameCount = readdirSync(framesDir).filter((f) => f.endsWith(".jpg")).length;
    if (frameCount === 0) {
      console.log(`[skip] ${project.id} — desktop capture dir is empty`);
      continue;
    }

    console.log(`[encode] ${project.id} (${frameCount} frames)`);
    const report = encodeProject(project.id, framesDir);
    for (const out of report.outputs) {
      const flag = out.over ? " OVER BUDGET" : "";
      const crfNote = out.crf !== undefined ? ` crf=${out.crf}` : "";
      console.log(`  ${out.file}: ${fmtKB(out.size)}${crfNote}${flag}`);
    }
    reports.push(report);
  }

  console.log(JSON.stringify(reports, null, 2));
}

main();
