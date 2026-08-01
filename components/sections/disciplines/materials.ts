import {
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Texture,
} from "three";

export type DisciplineTheme = "dark" | "light";
export type BodyMaterialKind = "anodized" | "steel";

/**
 * The material language: three shared materials across all six models, two skins each.
 *
 * WHY metalness is never 1.0. On a fully metallic surface there is no diffuse term for
 * `COLOR_0` to multiply, so the AO baked into the vertex colours in Faza A would be
 * invisible. 0.78-0.9 is the window where the metal still reads as metal and the AO still
 * has something to darken. Raising it "for realism" deletes that work.
 *
 * The values themselves are SECTION_SPEC section 3, "Materijalni jezik", taken literally.
 */
const BODY_SPECS: Record<
  DisciplineTheme,
  Record<BodyMaterialKind, { color: string; metalness: number; roughness: number }>
> = {
  dark: {
    // Dark anodised metal. Lifted off near-black on purpose: at 0.82 metalness the tint is
    // the reflectance, and a truly dark one on the dark palette leaves no casing to see.
    anodized: { color: "#59616e", metalness: 0.82, roughness: 0.34 },
    // Cold neutral metal.
    steel: { color: "#8d97a4", metalness: 0.9, roughness: 0.18 },
  },
  light: {
    // Light brushed aluminium.
    anodized: { color: "#c3cbd6", metalness: 0.78, roughness: 0.3 },
    steel: { color: "#9aa4b1", metalness: 0.9, roughness: 0.22 },
  },
};

/**
 * Cyan accent. `#58C4FF` is not a free choice - it is `--primary` from the dark palette
 * (globals.css). Light mode needs a darker, more saturated cyan to survive on paper, and
 * a higher intensity to survive the same tone map.
 */
const EMISSIVE_SPECS: Record<
  DisciplineTheme,
  { color: string; intensity: number }
> = {
  dark: { color: "#58c4ff", intensity: 1 },
  light: { color: "#0e8fd6", intensity: 1.6 },
};

/**
 * The screen. This material sits OUTSIDE the three above: those describe the casing, this
 * is glass with an image behind it - a different kind of surface, one extra shared
 * material, and it does not open the door to a fourth metal skin.
 *
 * The recipe is SECTION_SPEC Faza E, "Materijal ekrana", verbatim, and the two lines that
 * matter most are the last two. Without the clearcoat layer the image reads as printed on
 * plastic; `clearcoat: 1` + `clearcoatRoughness: 0.05` is what puts it behind glass. The
 * screen mesh is modelled recessed 0.0156 behind the front plane of the frame for the same
 * reason - the glass needs somewhere to be.
 *
 * `emissiveMap` is the same image at low intensity: a display lights itself. Without it
 * the screen is a sticker waiting for someone to point a lamp at it; too much of it and
 * the screen becomes a lamp. Hence "low", as a named number.
 */
const SCREEN_SPECS: Record<
  DisciplineTheme,
  { emissive: string; emissiveIntensity: number; envMapIntensity: number }
> = {
  // `envMapIntensity` is lower here than on the casing, and lower again in light mode. The
  // panel is glossy and tilted back, so it reflects the brightest part of the dome straight
  // at the camera; left at the casing's value the reflection wins and the image behind the
  // glass disappears under a grey wash. Glass you can see through, not a mirror.
  dark: { emissive: "#ffffff", emissiveIntensity: 0.62, envMapIntensity: 0.95 },
  light: { emissive: "#ffffff", emissiveIntensity: 0.5, envMapIntensity: 0.6 },
};

const SCREEN_ROUGHNESS = 0.15;
const SCREEN_CLEARCOAT = 1;
const SCREEN_CLEARCOAT_ROUGHNESS = 0.05;

/**
 * The environment is drawn on an 8-bit canvas, so its brightest value is 1.0 while a real
 * key light is several times that. These carry the make-up gain: above 1.0 on purpose, so
 * metal reads as metal instead of as grey plastic. It is a small correction, not a rescue
 * for a badly drawn environment.
 */
const BODY_ENV_INTENSITY: Record<DisciplineTheme, number> = {
  dark: 2.2,
  light: 1.2,
};

/**
 * One instance per (theme, kind), shared by every model that asks for it. Materials are
 * cheap to keep and expensive to recompile, and the section only ever has two models in
 * the scene, so the cache is held for the session and only the losing theme is disposed.
 */
const bodyCache = new Map<string, MeshStandardMaterial>();
const accentCache = new Map<DisciplineTheme, MeshStandardMaterial>();

export function getBodyMaterial(theme: DisciplineTheme, kind: BodyMaterialKind) {
  const cacheKey = `${theme}:${kind}`;
  const cached = bodyCache.get(cacheKey);
  if (cached) return cached;

  const spec = BODY_SPECS[theme][kind];
  const material = new MeshStandardMaterial({
    color: new Color(spec.color),
    metalness: spec.metalness,
    roughness: spec.roughness,
    // COLOR_0 carries the AO baked in Blender. Without this flag the whole of Faza A is
    // sitting in the file doing nothing.
    vertexColors: true,
    envMapIntensity: BODY_ENV_INTENSITY[theme],
  });
  material.name = `DISC_${kind.toUpperCase()}_${theme}`;
  bodyCache.set(cacheKey, material);
  return material;
}

export function getAccentMaterial(theme: DisciplineTheme) {
  const cached = accentCache.get(theme);
  if (cached) return cached;

  const spec = EMISSIVE_SPECS[theme];
  const material = new MeshStandardMaterial({
    color: new Color("#0a0e14"),
    emissive: new Color(spec.color),
    // Held at full here. The swap timeline ramps 0 -> this value in Faza D; the ceiling is
    // the constant, the ramp is the animation.
    emissiveIntensity: spec.intensity,
    metalness: 0.1,
    roughness: 0.25,
    // Exempt from the tone map. AgX desaturates bright values hard on its way to white, so
    // a cyan at full emissive comes out as a pale dot - the one colour on the section that
    // is a brand value gets rendered as the brand value. Same reason HeroCube runs its whole
    // canvas on NoToneMapping.
    toneMapped: false,
  });
  material.name = `DISC_EMISSIVE_${theme}`;
  accentCache.set(theme, material);
  return material;
}

/**
 * The screen material is per model rather than per theme, because a material holds one
 * `map` and the swap window has two models on screen at once. The recipe is shared - that
 * is the part SECTION_SPEC pins down - so all six screens are the same surface with a
 * different image, and every one of them is built here.
 */
export function createScreenMaterial(theme: DisciplineTheme, texture: Texture) {
  const spec = SCREEN_SPECS[theme];
  const material = new MeshPhysicalMaterial({
    map: texture,
    emissive: new Color(spec.emissive),
    emissiveMap: texture,
    emissiveIntensity: spec.emissiveIntensity,
    metalness: 0,
    roughness: SCREEN_ROUGHNESS,
    clearcoat: SCREEN_CLEARCOAT,
    clearcoatRoughness: SCREEN_CLEARCOAT_ROUGHNESS,
    envMapIntensity: spec.envMapIntensity,
  });
  material.name = `DISC_SCREEN_${theme}`;
  return material;
}

/**
 * The image is sRGB and the UVs come from glTF, whose origin is the top-left corner.
 * `TextureLoader` defaults to `flipY: true`, which is the DOM convention and the opposite
 * one - leave it and the screen renders upside down. `GLTFLoader` does this for textures it
 * loads itself; we load ours, so we do it ourselves.
 */
export function prepareScreenTexture(texture: Texture, anisotropy: number) {
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}
