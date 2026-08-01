"use client";

import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";
import { DOT_FIELD } from "@/constants/dotFieldConfig";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/* ---------------------------------------------------------------------------
   Theme tokens

   Every colour comes from CSS custom properties so the field follows all three
   palettes (:root light, .dark, html[data-mood="alt"]) without a single branch
   in here. `--field-blend` is handed straight to globalCompositeOperation,
   which is how the light theme inverts: "source-over" paints ink dots on a
   light page, "lighter" paints additive glow on a dark one.
   --------------------------------------------------------------------------- */

type RGBA = [number, number, number, number];

type FieldTokens = {
  dot: RGBA;
  accent: RGBA;
  core: RGBA;
  blend: GlobalCompositeOperation;
  rest: number;
};

const FALLBACK: FieldTokens = {
  dot: [124, 58, 237, 0.55],
  accent: [88, 196, 255, 1],
  core: [205, 238, 255, 1],
  blend: "lighter",
  rest: 0.38,
};

function parseColor(input: string, fallback: RGBA): RGBA {
  const value = input.trim();
  if (!value) return fallback;

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expand = (c: string) => parseInt(c.length === 1 ? c + c : c, 16);
    if (hex.length === 3 || hex.length === 4) {
      return [
        expand(hex[0]),
        expand(hex[1]),
        expand(hex[2]),
        hex.length === 4 ? expand(hex[3]) / 255 : 1,
      ];
    }
    if (hex.length === 6 || hex.length === 8) {
      return [
        expand(hex.slice(0, 2)),
        expand(hex.slice(2, 4)),
        expand(hex.slice(4, 6)),
        hex.length === 8 ? expand(hex.slice(6, 8)) / 255 : 1,
      ];
    }
    return fallback;
  }

  const parts = value.match(/-?[\d.]+/g);
  if (!parts || parts.length < 3) return fallback;
  return [
    Number(parts[0]),
    Number(parts[1]),
    Number(parts[2]),
    parts.length > 3 ? Number(parts[3]) : 1,
  ];
}

function readTokens(): FieldTokens {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  const blend = read("--field-blend") || FALLBACK.blend;
  const rest = Number.parseFloat(read("--field-rest"));

  return {
    dot: parseColor(read("--field-dot"), FALLBACK.dot),
    accent: parseColor(read("--field-accent"), FALLBACK.accent),
    core: parseColor(read("--field-core"), FALLBACK.core),
    blend: blend as GlobalCompositeOperation,
    rest: Number.isFinite(rest) ? rest : FALLBACK.rest,
  };
}

/* --------------------------------------------------------------------------- */

const TAU = Math.PI * 2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = clamp01((v - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const mix = (a: RGBA, b: RGBA, t: number): RGBA => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
  a[3] + (b[3] - a[3]) * t,
];

const css = (c: RGBA, alphaScale = 1) =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${c[3] * alphaScale})`;

/** Deterministic PRNG so the filament layout is identical on every mount. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One radial sprite per step of the base → accent ramp. Pre-rendering these is
 * what keeps the frame cheap: the hot path is drawImage only, never
 * createRadialGradient.
 *
 * The profile tightens or widens along the ramp to match the reference: at rest
 * a dot is a ~1.5px point with a hard falloff, at full energy it is a ~4px blob
 * with a flat, blown-out core.
 */
function buildRamp(tokens: FieldTokens, dpr: number): HTMLCanvasElement[] {
  const { rampSteps, glowRadius, growth } = DOT_FIELD;
  const sizeCss = glowRadius * 2 * (1 + growth);
  // Rendered at 2x the drawn size so the hot end stays crisp.
  const sizePx = Math.ceil(sizeCss * dpr * 2);
  const ramp: HTMLCanvasElement[] = [];

  for (let k = 0; k < rampSteps; k++) {
    const t = k / Math.max(1, rampSteps - 1);
    // Deliberately a short transition. A linear base → accent blend spends most
    // of the ramp halfway between magenta and azure, which is grey — the growth
    // then reads dusty instead of saturated. Snapping across early leaves the
    // interior fully accent-coloured and only a thin ring of in-between dots,
    // which is how the reference looks.
    const body = mix(tokens.dot, tokens.accent, smoothstep(0.04, 0.42, t));
    // Only the very hottest dots lift toward the core colour, and only slightly:
    // in the reference a grown dot is a flat azure disc, not a white-hot point.
    const centre = mix(body, tokens.core, smoothstep(0.88, 1, t));

    const canvas = document.createElement("canvas");
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const r = sizePx / 2;
    // Kept tight on purpose: a wide shoulder makes neighbouring hot dots merge
    // into a continuous wash, and the reference keeps dark gaps between them.
    const plateau = 0.12 + 0.24 * t;
    const shoulder = plateau + 0.16;
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, css(centre));
    gradient.addColorStop(plateau, css(centre, 0.92));
    gradient.addColorStop(shoulder, css(body, 0.34));
    gradient.addColorStop(Math.min(0.98, shoulder + 0.22), css(body, 0.06));
    gradient.addColorStop(1, css(body, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sizePx, sizePx);

    ramp.push(canvas);
  }

  return ramp;
}

type Lattice = {
  x: Float32Array;
  y: Float32Array;
  angle: Float32Array;
  /** World-space edge noise, -1..1. Ragged-edge term of the growth mask. */
  grain: Float32Array;
  /** Slow brightness modulation, so the lattice reads as a field and not as print. */
  level: Float32Array;
  /**
   * When each dot was last touched, in the loop's own clock. This is what makes
   * the trail behave like drawing rather than like a decaying blur: the stroke
   * holds unchanged, then erases oldest-first because every dot carries its own
   * age. A single shared decay factor cannot express that.
   */
  stamp: Float32Array;
  /** Mask strength at that touch — how bright this dot draws while held. */
  power: Float32Array;
  cols: number;
  rows: number;
  gapX: number;
  gapY: number;
};

/** Dots never touched must read as infinitely old, not as touched at t=0. */
const NEVER = -1e9;

export function DotField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const noise = createNoise2D(mulberry32(0x5eed));
    const {
      gap: gapConfig,
      dotAspect,
      jitter,
      maxDots,
      glowRadius,
      growth,
      hotAlpha,
      stretch,
      levelVariance,
      levelFrequency,
      influenceRadius,
      holdMs,
      fadeMs,
      filament,
      flowFrequency,
      autoDrift,
      fps,
      rampSteps,
      interaction,
    } = DOT_FIELD;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const frameBudget = 1000 / fps;

    const autoMode =
      interaction === "auto" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let tokens = readTokens();
    let ramp = buildRamp(tokens, dpr);
    let base: HTMLCanvasElement | null = null;
    let lattice: Lattice | null = null;
    let width = 0;
    let height = 0;
    let radius: number = influenceRadius.desktop;

    let raf = 0;
    let running = false;
    let lastFrame = 0;
    let elapsed = 0;
    /** Newest stamp in the field — lets the loop know when everything has erased. */
    let newest = NEVER;
    const lifetime = holdMs + fadeMs;

    // Smoothed emitter position plus the previous frame's position, so a fast
    // sweep injects along the whole segment instead of leaving gaps.
    const emitter = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, tx: -1e4, ty: -1e4, seen: false };

    /* ---------------- geometry ---------------- */

    /** Two-octave plain noise in world space, -1..1. Never ridged: ridges are
     *  thin lines with gaps between them, which is exactly the hole pattern we
     *  do not want inside a growth. */
    const grainAt = (x: number, y: number, time: number) => {
      const f = filament.frequency;
      const drift = filament.drift * time * 0.001;
      const a = noise(x * f + drift, y * f);
      const b = noise(x * f * filament.octave2 - drift, y * f * filament.octave2);
      return a * 0.7 + b * 0.3;
    };

    const buildLattice = () => {
      const isMobile = width < 768;
      // The cell carries the same aspect as the dot, so an elliptical dot sits in
      // an elliptical cell and the field stays evenly spaced in both axes.
      let gapY: number = isMobile ? gapConfig.mobile : gapConfig.desktop;
      let gapX: number = gapY * dotAspect;
      radius = isMobile ? influenceRadius.mobile : influenceRadius.desktop;

      // Keep the dot count bounded on very large viewports.
      const estimate = () => (Math.ceil(width / gapX) + 1) * (Math.ceil(height / gapY) + 1);
      if (estimate() > maxDots) {
        const k = Math.sqrt(estimate() / maxDots);
        gapX *= k;
        gapY *= k;
      }

      const cols = Math.ceil(width / gapX) + 1;
      const rows = Math.ceil(height / gapY) + 1;
      const count = cols * rows;

      const x = new Float32Array(count);
      const y = new Float32Array(count);
      const angle = new Float32Array(count);
      const grain = new Float32Array(count);
      const level = new Float32Array(count);
      const stamp = new Float32Array(count).fill(NEVER);
      const rand = mulberry32(0xa11ce);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const jx = (rand() - 0.5) * 2 * jitter * gapX;
          const jy = (rand() - 0.5) * 2 * jitter * gapY;
          const px = c * gapX + jx;
          const py = r * gapY + jy;
          x[i] = px;
          y[i] = py;
          angle[i] = noise(px * flowFrequency, py * flowFrequency) * TAU;
          grain[i] = grainAt(px, py, 0);
          const n = noise(px * levelFrequency + 91.7, py * levelFrequency - 43.1);
          level[i] = 1 - levelVariance * (0.5 - n * 0.5);
        }
      }

      newest = NEVER;
      lattice = {
        x, y, angle, grain, level, stamp,
        power: new Float32Array(count),
        cols, rows, gapX, gapY,
      };
    };

    /**
     * Energy of one dot right now: flat while held, then a linear wipe. Because
     * the ramp starts from each dot's own stamp, a stroke erases from its oldest
     * end instead of dimming all at once.
     */
    const energyAt = (i: number, now: number) => {
      if (!lattice) return 0;
      const age = now - lattice.stamp[i];
      if (age >= lifetime) return 0;
      return age <= holdMs ? lattice.power[i] : lattice.power[i] * (1 - (age - holdMs) / fadeMs);
    };

    /** Every dot at rest, rendered once and blitted as a single draw per frame. */
    const buildBase = () => {
      if (!lattice) return;
      const layer = document.createElement("canvas");
      layer.width = Math.max(1, Math.round(width * dpr));
      layer.height = Math.max(1, Math.round(height * dpr));
      const bctx = layer.getContext("2d");
      if (!bctx) return;

      bctx.scale(dpr, dpr);
      bctx.globalCompositeOperation = tokens.blend;
      const h = glowRadius * 2;
      const w = h * dotAspect;
      const halfW = w / 2;
      const halfH = h / 2;
      const sprite = ramp[0];
      if (sprite) {
        const { x, y, level } = lattice;
        for (let i = 0; i < x.length; i++) {
          bctx.globalAlpha = tokens.rest * level[i];
          // Drawing the round sprite into a non-square box is what makes the
          // ellipse — no separate elliptical sprite needed.
          bctx.drawImage(sprite, x[i] - halfW, y[i] - halfH, w, h);
        }
      }
      base = layer;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      buildLattice();
      buildBase();
      draw(elapsed);
    };

    /* ---------------- energy ---------------- */

    /**
     * The growth mask.
     *
     * Built as a *radial* function whose boundary wanders, never as a noise
     * threshold: a threshold on noise leaves holes wherever the field dips
     * below it, and holes inside a growth are exactly what we don't want. Here
     * the inner `coreRatio` of the reach is filled unconditionally, and the
     * noise only pushes the outer boundary in and out — irregular outline,
     * solid interior.
     */
    const inject = (cx: number, cy: number, time: number) => {
      if (!lattice) return;
      const { x, y, grain, stamp, power, cols, rows, gapX, gapY } = lattice;
      const reach = radius * (1 + filament.armDepth + filament.grainDepth);
      const c0 = Math.max(0, Math.floor((cx - reach) / gapX) - 1);
      const c1 = Math.min(cols - 1, Math.ceil((cx + reach) / gapX) + 1);
      const r0 = Math.max(0, Math.floor((cy - reach) / gapY) - 1);
      const r1 = Math.min(rows - 1, Math.ceil((cy + reach) / gapY) + 1);
      const live = filament.drift > 0;

      // Arms are anchored to where the cursor is, so they reshape slowly as it
      // travels instead of spinning around it.
      const armSeedX = cx * 0.004;
      const armSeedY = cy * 0.004;
      const core = radius * filament.coreRatio;

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const i = r * cols + c;
          const dx = x[i] - cx;
          const dy = y[i] - cy;
          const distSq = dx * dx + dy * dy;
          if (distSq > reach * reach) continue;
          const dist = Math.sqrt(distSq);

          // Solid core — this term alone guarantees no interior holes.
          let mask = smoothstep(core, core * 0.55, dist);

          if (mask < 1) {
            // Sampling noise on a unit circle keeps the lobe function seamless
            // at the 0/2π wrap, so arms never show a seam.
            const inv = dist > 0.001 ? 1 / dist : 0;
            const arm = noise(dx * inv * filament.armCount + armSeedX, dy * inv * filament.armCount + armSeedY);
            const g = live ? grainAt(x[i], y[i], time) : grain[i];
            const edge = radius * (1 + arm * filament.armDepth + g * filament.grainDepth);
            mask = Math.max(mask, smoothstep(edge, edge * 0.6, dist));
          }

          if (mask <= 0) continue;

          // Re-touching a dot restarts its hold. A dot that had already erased
          // starts over from this stroke's strength rather than keeping a stale
          // brighter value from a pass that has long since wiped.
          const expired = time - stamp[i] >= lifetime;
          power[i] = expired ? mask : Math.max(power[i], mask);
          stamp[i] = time;
        }
      }
      if (time > newest) newest = time;
    };

    /**
     * Auto mode drives a virtual cursor along a noise-perturbed Lissajous path,
     * then feeds it through the exact same injection as a real pointer.
     */
    const autoTarget = (time: number) => {
      const phase = (time % autoDrift.periodMs) / autoDrift.periodMs;
      const span = Math.min(width, height) * autoDrift.radiusRatio;
      const wobble = noise(phase * 6.4, 11.3) * 0.45;
      return {
        x: width / 2 + Math.cos(phase * TAU + wobble) * span * 1.5,
        y: height / 2 + Math.sin(phase * TAU * 2 + wobble * 2) * span,
      };
    };

    /* ---------------- render ---------------- */

    const draw = (now: number) => {
      if (!lattice || !base) return;
      const { x, y, angle, level, stamp } = lattice;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);

      // Deliberately source-over, not tokens.blend: in the reference a growth
      // *replaces* the base dot rather than adding to it. Adding cyan on top of
      // the violet base washes both out to near-white lavender; replacing it
      // keeps the accent saturated, and the sprite's soft edge produces exactly
      // the in-between colours that ring every growth.
      ctx.globalCompositeOperation = "source-over";
      const last = rampSteps - 1;

      // A hot dot is the same dot, just wider and further along the colour ramp.
      // The rotate/stretch path only exists for when someone dials `stretch` up.
      const stretched = stretch > 0.001;
      if (!stretched) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (let i = 0; i < stamp.length; i++) {
        if (now - stamp[i] >= lifetime) continue;
        const e = energyAt(i, now);
        if (e < 0.02) continue;

        const sprite = ramp[Math.min(last, Math.round(e * last))];
        if (!sprite) continue;

        const h = glowRadius * 2 * (1 + e * growth);
        const w = h * dotAspect;
        const half = h / 2;
        const halfW = w / 2;
        ctx.globalAlpha = (tokens.rest * (1 - e) + hotAlpha * e) * level[i];

        if (!stretched) {
          ctx.drawImage(sprite, x[i] - halfW, y[i] - half, w, h);
          continue;
        }

        const sx = 1 + e * stretch;
        const a = angle[i];
        const cos = Math.cos(a);
        const sin = Math.sin(a);

        // translate(x, y) · rotate(a) · scale(sx, 1), folded into one matrix
        // and pre-multiplied by the device-pixel scale.
        ctx.setTransform(
          dpr * cos * sx,
          dpr * sin * sx,
          -dpr * sin,
          dpr * cos,
          dpr * x[i],
          dpr * y[i],
        );
        ctx.drawImage(sprite, -halfW, -half, w, h);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.visibilityState === "hidden") {
        lastFrame = now;
        return;
      }

      const delta = now - lastFrame;
      if (delta < frameBudget) return;
      lastFrame = now;
      elapsed += delta;

      if (!lattice) return;

      if (autoMode) {
        const target = autoTarget(elapsed);
        emitter.tx = target.x;
        emitter.ty = target.y;
        emitter.seen = true;
      }

      if (emitter.seen) {
        emitter.px = emitter.x;
        emitter.py = emitter.y;
        // Tighter than a decaying trail wants, because a drawing stroke has to
        // land where the cursor actually is.
        emitter.x += (emitter.tx - emitter.x) * 0.4;
        emitter.y += (emitter.ty - emitter.y) * 0.4;

        const dx = emitter.x - emitter.px;
        const dy = emitter.y - emitter.py;
        const travelled = Math.sqrt(dx * dx + dy * dy);
        // Stamp along the whole segment so a fast sweep draws one unbroken
        // stroke rather than a dotted line of separate blobs.
        const steps = Math.max(1, Math.min(20, Math.ceil(travelled / (radius * 0.4))));

        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          inject(emitter.px + dx * t, emitter.py + dy * t, elapsed);
        }
      }

      draw(elapsed);

      // Everything has erased and nobody is drawing — stop burning frames.
      if (!autoMode && elapsed - newest >= lifetime) stop();
    };

    const start = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    /* ---------------- wiring ---------------- */

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      emitter.tx = event.clientX - rect.left;
      emitter.ty = event.clientY - rect.top;
      if (!emitter.seen) {
        emitter.seen = true;
        emitter.x = emitter.tx;
        emitter.y = emitter.ty;
        emitter.px = emitter.tx;
        emitter.py = emitter.ty;
      }
      start();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && (autoMode || emitter.seen)) start();
    };

    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (autoMode) start();
      }, 120);
    });

    // Provider-agnostic on purpose: this component sits outside MoodProvider,
    // and useMood() throws there. Watching <html> catches theme *and* mood.
    let themeTimer = 0;
    const themeObserver = new MutationObserver(() => {
      window.clearTimeout(themeTimer);
      // ThemeProvider runs an animated radial transition; wait for it to settle.
      themeTimer = window.setTimeout(() => {
        tokens = readTokens();
        ramp = buildRamp(tokens, dpr);
        buildBase();
        draw(elapsed);
      }, 60);
    });

    resize();

    if (prefersReducedMotion) {
      // Static field only: no loop, no listeners beyond theme/resize.
      resizeObserver.observe(container);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "data-mood"],
      });
      return () => {
        window.clearTimeout(resizeTimer);
        window.clearTimeout(themeTimer);
        resizeObserver.disconnect();
        themeObserver.disconnect();
      };
    }

    resizeObserver.observe(container);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mood"],
    });
    document.addEventListener("visibilitychange", onVisibility);
    if (!autoMode) {
      // Window-scoped: the wrapper is pointer-events:none, so element
      // listeners would never fire.
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    } else {
      start();
    }

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.clearTimeout(themeTimer);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
