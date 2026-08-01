import {
  CanvasTexture,
  Color,
  EquirectangularReflectionMapping,
  LinearFilter,
  PMREMGenerator,
  SRGBColorSpace,
  type Texture,
  type WebGLRenderer,
} from "three";

export type EnvironmentColors = {
  /** `--background` - the darkest value in the palette, the floor of the gradient. */
  background: string;
  /** `--surface-section` - one step up, the sky end of the gradient. */
  surface: string;
  /** `--primary` - the cyan kicker in dark, and whatever the palette makes it elsewhere. */
  primary: string;
};

const FALLBACKS: Record<"dark" | "light", EnvironmentColors> = {
  dark: { background: "#070d19", surface: "#0e1729", primary: "#58c4ff" },
  light: { background: "#f4f7fb", surface: "#e9f0fb", primary: "#1f2c3d" },
};

/**
 * Read outside `<Canvas>` and passed in as props. R3F's reconciler is not assumed to carry
 * React context across, and there is no need for an answer to that question: `HeroCube`
 * already takes the same route with `staticFrame`.
 *
 * All three variables exist in every palette (`:root` light, `.dark`, `html[data-mood]`),
 * so light/dark inversion arrives without a single branch in JSX. `theme` is passed in
 * rather than inferred: it is what decides which palette `getComputedStyle` will report,
 * so it is the real input, and it doubles as the key for the no-document fallback.
 *
 * Returns `null` on the server, where there is nothing to compute a style against.
 */
export function readEnvironmentColors(
  theme: "dark" | "light"
): EnvironmentColors | null {
  if (typeof document === "undefined") return null;

  const styles = getComputedStyle(document.documentElement);
  const fallback = FALLBACKS[theme];
  const read = (name: string, value: string) =>
    styles.getPropertyValue(name).trim() || value;

  return {
    background: read("--background", fallback.background),
    surface: read("--surface-section", fallback.surface),
    primary: read("--primary", fallback.primary),
  };
}

/** Equirect resolution. 256x128 is plenty: PMREM blurs everything above the mirror level. */
const ENV_WIDTH = 256;
const ENV_HEIGHT = 128;

/**
 * Where the sky stops and the floor starts, in equirect V. The horizon is the single most
 * load-bearing feature in here: a metal surface reads as metal because it reflects a bright
 * half and a dark half with a line between them. A smooth wash top to bottom, however
 * prettily tinted, renders as grey plastic - which is exactly what the first pass of this
 * environment did.
 */
const HORIZON = 0.54;
/**
 * Floor luminance as a fraction of the palette's `--background`. Low on purpose, and in
 * light mode especially: a light palette makes a near-white dome, and a near-white dome
 * reflected off metal is a flat grey card. The floor is where the contrast comes from.
 */
const FLOOR_GAIN = 0.18;
/** Sky luminance as a multiple of `--surface-section`, at the top of the dome. */
const SKY_GAIN = 1.9;

/**
 * Emissive quads, in equirect UV.
 *
 * POSITIONS ARE NOT FREE. Three's equirect mapping is `u = atan2(z, x) / 2pi + 0.5`, so
 * u = 0.75 is +Z (towards the camera), u = 0.25 is -Z (behind the model), and canvas row 0
 * is straight up. The camera sits front-left-above at (-1.86, 1.4, 3.72), which puts its
 * key at u ~ 0.87 and its rim at u ~ 0.28. Reading "top-left" as canvas top-left instead
 * lands the key behind the model, where it lights the back of the casing and nothing the
 * viewer can see.
 *
 * Four rather than SECTION_SPEC's "two or three": key, cool fill at a quarter of it, rim,
 * cyan kicker. The rim is the addition, and it is the QA rig's third light - without it a
 * dark anodised body on the dark palette has no edge and merges into the page.
 *
 * The key is deliberately small and hard-centred: a softbox, not a wash. That is what puts
 * a highlight on the clearcoat over the screen and a specular line on every bevelled edge.
 */
const LIGHT_QUADS = [
  // Key: front-upper-left, from the camera's side.
  { x: 0.87, y: 0.26, radius: 0.3, core: 0.4, alpha: 1, color: "key" },
  // Cool fill: screen-right, near the horizon, a quarter of the key.
  { x: 0.61, y: 0.44, radius: 0.34, core: 0.1, alpha: 0.25, color: "fill" },
  // Rim: behind and above, so the silhouette separates from the background.
  { x: 0.28, y: 0.12, radius: 0.26, core: 0.3, alpha: 0.85, color: "fill" },
  // Cyan kicker: below the horizon, screen-left.
  { x: 0.08, y: 0.76, radius: 0.24, core: 0.1, alpha: 0.5, color: "kicker" },
] as const;

const KEY_COLOR = "#fffaf2";
const FILL_COLOR = "#bfd6f2";

/** Scales a palette colour's luminance. Parsing and output both go through sRGB, the
 *  multiply happens in linear - which is the only place a brightness scale means anything. */
const scaled = (css: string, gain: number) =>
  new Color().setStyle(css, SRGBColorSpace).multiplyScalar(gain).getStyle();

const drawEquirect = (colors: EnvironmentColors) => {
  const canvas = document.createElement("canvas");
  canvas.width = ENV_WIDTH;
  canvas.height = ENV_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const horizonY = HORIZON * ENV_HEIGHT;

  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, scaled(colors.surface, SKY_GAIN));
  sky.addColorStop(1, colors.surface);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, ENV_WIDTH, horizonY);

  const floor = ctx.createLinearGradient(0, horizonY, 0, ENV_HEIGHT);
  floor.addColorStop(0, scaled(colors.background, FLOOR_GAIN * 1.6));
  floor.addColorStop(1, scaled(colors.background, FLOOR_GAIN));
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizonY, ENV_WIDTH, ENV_HEIGHT - horizonY);

  // Radial stops do the softening, so no `ctx.filter` blur is needed - one less thing that
  // depends on a browser supporting canvas filters.
  ctx.globalCompositeOperation = "lighter";
  for (const quad of LIGHT_QUADS) {
    const cx = quad.x * ENV_WIDTH;
    const cy = quad.y * ENV_HEIGHT;
    const r = quad.radius * ENV_WIDTH;
    const tone =
      quad.color === "key"
        ? KEY_COLOR
        : quad.color === "fill"
          ? FILL_COLOR
          : colors.primary;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    glow.addColorStop(0, tone);
    glow.addColorStop(quad.core, tone);
    glow.addColorStop(1, "transparent");
    ctx.globalAlpha = quad.alpha;
    ctx.fillStyle = glow;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  return canvas;
};

/**
 * Built in code rather than loaded from an `.hdr`, so it re-tunes with the theme for free.
 *
 * The generator and the source canvas texture are disposed the moment the render target
 * exists - only the target is worth keeping, and holding the other two is how a section
 * leaks a few MB per theme toggle. Rebuild happens on a theme change and on nothing else.
 */
export function createDisciplineEnvironment(
  renderer: WebGLRenderer,
  colors: EnvironmentColors
): { texture: Texture; dispose: () => void } | null {
  const canvas = drawEquirect(colors);
  if (!canvas) return null;

  const source = new CanvasTexture(canvas);
  source.mapping = EquirectangularReflectionMapping;
  source.colorSpace = SRGBColorSpace;
  source.minFilter = LinearFilter;
  source.magFilter = LinearFilter;
  source.needsUpdate = true;

  const generator = new PMREMGenerator(renderer);
  const target = generator.fromEquirectangular(source);

  source.dispose();
  generator.dispose();

  return {
    texture: target.texture,
    dispose: () => target.dispose(),
  };
}
