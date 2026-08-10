#!/usr/bin/env node

import { rmSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const OUTPUT_ROOT = resolve("showcase", "captures");

const args = process.argv.slice(2);
const all = args.includes("--all");
const project = args.find((a) => a.startsWith("--project="))?.slice("--project=".length) ?? null;

if (!all && !project) {
  console.error("Usage: node scripts/clean-captures.mjs --project=<id> | --all");
  process.exit(1);
}

const target = all ? OUTPUT_ROOT : join(OUTPUT_ROOT, project);

if (!existsSync(target)) {
  console.log(`Nothing to clean at ${target}`);
  process.exit(0);
}

rmSync(target, { recursive: true, force: true });
console.log(`Removed ${target}`);
