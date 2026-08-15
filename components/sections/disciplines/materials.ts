import {
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type BufferGeometry,
  type Texture,
} from "three";

import type { Vec3 } from "@/constants/disciplines";

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
 * What the second primitive of a model actually is. Five of the six are `"display"`; the
 * magnifier's is glass. See `screenKind` in `constants/disciplines.ts` - the field exists so
 * that difference does not cost a third primitive or a second export contract.
 */
export type ScreenKind = "display" | "lens";

/**
 * The lens on `seo-geo`. The only transmission element on the whole section, and the single
 * reason that model is allowed a fourth draw call (SECTION_SPEC section 3).
 *
 * THICKNESS IS AN OPTICAL SETTING, NOT A MEASUREMENT - and it used to be the other way round.
 *
 * The physical figure is 0.104: the lens is biconvex with 0.055 W of sag per side, so 0.11 W
 * thick, which is 0.104 after the bbox normalisation. That is honest and it magnified nothing.
 * three.js does not march a ray through the volume - it refracts ONCE at the front face and
 * then travels a straight `thickness * modelScale` before projecting back to screen space
 * (`getVolumeTransmissionRay`). For a convex face the rays converge, so the backdrop is
 * magnified by
 *
 *     m = 1 - (1 - 1/ior) * thickness * S / R          magnification M = 1 / m
 *
 * where `S` is the world scale (`displayScale`, 1.06) and `R` is the radius of curvature of
 * the FRONT face - `(r^2 + s^2) / 2s` for r = 0.5 W and s = 0.055 W, i.e. 2.30 W, 2.18
 * normalised. At the measured thickness that gives m = 0.983, M = 1.017: seventeen thousandths,
 * invisible. The glass was real and did nothing, which is the worst of both.
 *
 * ~3.0 puts M near 2, which is what makes it read as a magnifier. It is roughly thirty times
 * the physical value and that is fine - the number is the knob three.js actually exposes, not
 * a distance light travels. Keep it well under ~6.2: that is where m reaches 0 and the image
 * first goes flat and then INVERTS.
 *
 * `attenuationDistance` is left at its default (Infinity), so a large thickness costs no
 * darkening - `volumeAttenuation` returns 1 and the glass stays clear.
 *
 * `ior` 1.5 is crown glass. `roughness` has to be near zero, and now for a second reason
 * beyond taste: it picks the mip the transmission sample is read from
 * (`lod = log2(width) * roughness`), so 0.04 was pulling almost half the sample out of a
 * half-resolution mip and softening the very detail the lens exists to enlarge.
 */
const LENS_SPECS: Record<
  DisciplineTheme,
  {
    color: string;
    ior: number;
    thickness: number;
    roughness: number;
    envMapIntensity: number;
  }
> = {
  /**
   * COLOURLESS, both themes. It used to be a pale blue-white per palette, back when the glass
   * had nothing behind it and needed a tint of its own to be visible at all.
   *
   * With transmission at 1 the diffuse colour IS the transmittance: every pixel the lens shows
   * gets multiplied by it. A 0.9-ish tint was therefore dimming and cooling the brand colours
   * behind the glass, so the magnified Google card did not match the one beside it. A magnifier
   * magnifies; it does not grade. White is the only value that leaves the cards alone.
   */
  /**
   * `envMapIntensity` is low - down from 1.4 and 0.9 - but be careful what you credit it with.
   *
   * It was the obvious suspect for the wash through the glass and it was measured NOT to be:
   * taking it to 0 outright left the darkest pixel inside the lens at (42, 44, 51), the same to
   * the count as at 0.22. What actually flattened the view was tone mapping (see
   * `createLensMaterial`). This is kept low because a mirror-sharp reflection at `roughness:
   * 0.01` competes with the cards for no gain, not because it was the bug.
   *
   * Not zero either. The bevel and the rim still need something to catch, or the glass stops
   * reading as a physical object and the model looks like a ring with a hole in it.
   */
  dark: {
    color: "#ffffff",
    ior: 1.5,
    thickness: 2.2,
    roughness: 0.01,
    envMapIntensity: 0.22,
  },
  light: {
    color: "#ffffff",
    ior: 1.5,
    thickness: 2.2,
    roughness: 0.01,
    envMapIntensity: 0.18,
  },
};

const LENS_TRANSMISSION = 1;

/**
 * The transmission budget, as a FRACTION OF THE DRAWING BUFFER.
 *
 * This used to be a single `256`, read as a pixel height and converted against the live buffer
 * by the render layer. The unit changed because the meaning did: three.js takes
 * `WebGLRenderer.transmissionResolutionScale` as a fraction, and now that the lens magnifies
 * ~2x there is a second multiplier on it - effective sharpness through the glass is
 * `scale / magnification`. At the old 256 against a ~840-tall buffer that worked out at 0.28,
 * so the magnified card was being read at about a seventh of native and the wordmark was mush.
 *
 * Wide screens therefore sample the buffer at full size. The cost is real - the scene is
 * re-rendered into that target every frame - but this scene is 13k triangles and four
 * materials, so it is a cheap frame to pay twice.
 *
 * Narrow screens keep a low fraction. The lens is no longer switched off there (see
 * `supportsLensTransmission`), so this is where the phone's share of the bill is set: if the
 * frame rate suffers on a real device, drop this first, before touching the glass itself.
 */
export const LENS_TRANSMISSION_SAMPLES = 4;
export const LENS_TRANSMISSION_SCALE_WIDE = 1;
export const LENS_TRANSMISSION_SCALE_NARROW = 0.4;

/**
 * The line between the two budgets above - and, until this change, the line at which the lens
 * stopped being glass at all.
 *
 * It no longer gates transmission, because there is now something behind the glass worth
 * seeing and a phone that renders an opaque steel disc where the logos should be is not a
 * cheaper version of the section, it is a broken one. The opaque branch stays in
 * `createLensMaterial` for the case where that trade has to be made again.
 *
 * A side effect worth naming: with the gate gone, the material no longer depends on device
 * class at all, so the latent bug where a window dragged across this width kept its old lens
 * material - the memo key is `[theme]` - cannot happen.
 */
export const LENS_TRANSMISSION_MIN_WIDTH = 768;

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
export function createScreenMaterial(
  theme: DisciplineTheme,
  texture: Texture,
  kind: ScreenKind = "display"
) {
  if (kind === "lens") return createLensMaterial(theme);

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
 * Whether this device should pay for transmission - and the answer is now always yes.
 *
 * It used to be a width test. That was the right call while the glass had nothing behind it:
 * an empty lens costs the most expensive material in three.js to show a slightly brighter
 * disc, and a phone was the last place to spend that. Now there are three brand cards behind
 * it and the glass is the only thing that magnifies them, so a device that skipped
 * transmission would not get a cheaper version of the model - it would get a steel plate where
 * the content is. The phone's share of the cost is taken out of
 * `LENS_TRANSMISSION_SCALE_NARROW` instead, which is a dial rather than a switch.
 *
 * Kept as a function, and still reading `window` at call time rather than at module scope, so
 * the opaque path stays one edit away: this module is imported by a client component whose
 * `useMemo` can in principle run where there is no `window`, and a media query evaluated once
 * at import would freeze at whatever the first environment answered.
 */
export function supportsLensTransmission() {
  return true;
}

/**
 * How much of the drawing buffer the transmission pass gets on this device. The same 768px
 * line as the DPR budgets in `DisciplineStage`, and live rather than sampled for the same
 * reason - a window dragged across it should re-answer.
 */
export function lensTransmissionScale() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return LENS_TRANSMISSION_SCALE_NARROW;
  }
  return window.matchMedia(`(min-width: ${LENS_TRANSMISSION_MIN_WIDTH}px)`).matches
    ? LENS_TRANSMISSION_SCALE_WIDE
    : LENS_TRANSMISSION_SCALE_NARROW;
}

/**
 * The magnifier's lens, and the one place on the section where glass is real rather than
 * suggested by a clearcoat layer.
 *
 * The opaque-steel fallback is no longer reached by default - see `supportsLensTransmission`,
 * which now answers yes everywhere because there are cards behind the glass that only the
 * glass magnifies. It is kept, and kept correct, because it is one argument away: pass
 * `false` and the model drops to three draw calls, which is the trade SECTION_SPEC section 3
 * originally committed to.
 *
 * TWO THINGS THE FALLBACK IS NOT.
 *
 * It is not `getBodyMaterial(theme, "steel")`. That one is shared and cached for the session,
 * and the caller disposes whatever this function returns when the model unmounts - handing it
 * the cached instance would take the casing material of every model down with it. The fallback
 * therefore borrows the steel NUMBERS and owns its instance.
 *
 * And it is not `vertexColors: true`, even though the material it is copied from is. The lens
 * primitive ships without `COLOR_0` - it never gets the AO bake, on purpose, because ambient
 * occlusion painted onto glass is occlusion of the wrong thing. Leaving the flag on would ask
 * the shader for an attribute the geometry does not have.
 */
export function createLensMaterial(
  theme: DisciplineTheme,
  transmission: boolean = supportsLensTransmission()
) {
  if (!transmission) {
    const steel = BODY_SPECS[theme].steel;
    const opaque = new MeshStandardMaterial({
      color: new Color(steel.color),
      metalness: steel.metalness,
      roughness: steel.roughness,
      vertexColors: false,
      envMapIntensity: BODY_ENV_INTENSITY[theme],
    });
    opaque.name = `DISC_LENS_OPAQUE_${theme}`;
    return opaque;
  }

  const spec = LENS_SPECS[theme];
  const material = new MeshPhysicalMaterial({
    color: new Color(spec.color),
    metalness: 0,
    roughness: spec.roughness,
    transmission: LENS_TRANSMISSION,
    thickness: spec.thickness,
    ior: spec.ior,
    envMapIntensity: spec.envMapIntensity,
    /**
     * THE GLASS HAS TO BE BLENDABLE, or its alpha is thrown away.
     *
     * `WebGLState.setMaterial` reads `material.blending === NormalBlending && transparent ===
     * false ? NoBlending : ...`, so a transmissive material left at the default writes its
     * colour to the canvas OPAQUELY. Every alpha the transmission shader computes -
     * `1 - (1 - sampled.a) * transmittanceFactor`, the one term that says "there was nothing
     * behind me" - was being discarded, which is why the lens could only ever paint SOME
     * colour and never show the page through itself.
     *
     * With this on, the alpha survives, and the empty space around the cards (stamped to
     * alpha 0 by `LensBackdropFill`) makes the glass genuinely see-through there.
     */
    transparent: true,
    /**
     * THE LENS IS NOT GRADED, and this is the line that makes the magnified image match the
     * un-magnified one beside it.
     *
     * The canvas tone maps with AgX, whose toe lifts and desaturates shadows. The backdrop
     * cards are already exempt (`toneMapped: false`, so brand colours survive), but the light
     * they transmit leaves through THIS material's fragment - so with the default on, every
     * pixel the lens showed got AgX applied on top and the same card came out lighter and
     * flatter inside the glass than immediately outside it, which is the one comparison a
     * magnifier cannot afford to lose.
     *
     * Measured, darkest pixel inside the lens: (64, 67, 74) before, (42, 44, 51) after, against
     * a real page background of (10, 15, 27). So this is the single biggest term and it is not
     * the only one - a neutral lift of roughly thirty counts survives it, and it is NOT the
     * environment reflection (zeroing `envMapIntensity` moved nothing) and NOT the fill colour
     * (the fill was proved to reach the lens with a magenta probe, and darkening it moved
     * almost nothing). Something in the transmission path still floors the blacks. Left as is:
     * the pale wash the section was actually suffering from is gone, and the remainder reads as
     * glass haze rather than as a grade.
     */
    toneMapped: false,
  });
  material.name = `DISC_LENS_${theme}`;
  return material;
}

/**
 * Give the lens back the normals the file could not carry.
 *
 * The GLB is meshopt-compressed, which stores NORMAL octahedrally in a BYTE - roughly a degree
 * of angular resolution. On every other model that is invisible: a normal feeds a lighting term
 * and a degree of error is a fraction of a shade. On this one it feeds `refract()`, and the
 * refracted ray then travels `thickness * scale` before it is projected back to screen space to
 * pick a pixel. At the thickness this lens now runs, a degree of quantisation lands several
 * percent of a card away from where it should - so the magnified wordmark came out doubled and
 * the marks smeared, worst at the rim where the normals turn fastest.
 *
 * Nothing is wrong with the geometry: the front face is a sphere cap and its normal is exactly
 * `normalize(v - sphereCentre)`. Since the rim circle is the widest part of a symmetric
 * biconvex lens, that centre sits on the axis at `sqrt(R^2 - r^2)` behind the mid-plane, which
 * needs no sag term and no measurement beyond the two already recorded on the discipline.
 *
 * Recomputing it here rather than re-exporting from Blender keeps the fix where its cause is -
 * the compression, not the model - and costs one pass over 1,840 vertices, once, guarded by a
 * flag on the geometry because drei hands every consumer the same instance.
 *
 * Both caps are done even though the material is `FrontSide` and only the front is ever shaded:
 * a half-corrected normal buffer is a trap for whoever next turns the glass double-sided.
 */
export function refineLensNormals(
  geometry: BufferGeometry,
  centre: Vec3,
  axis: Vec3,
  aperture: number,
  curvature: number
) {
  if (geometry.userData.lensNormalsRefined) return geometry;

  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  if (!position || !normal) return geometry;

  // Beyond the aperture there is no sphere to speak of, and a curvature that cannot reach its
  // own rim would put the centre in an imaginary place. Leave such a lens alone.
  const offset = curvature * curvature - aperture * aperture;
  if (offset <= 0) return geometry;
  const axial = Math.sqrt(offset);

  const n = new Vector3(...axis).normalize();
  const mid = new Vector3(...centre);
  const front = mid.clone().addScaledVector(n, -axial);
  const back = mid.clone().addScaledVector(n, axial);

  const vertex = new Vector3();
  const corrected = new Vector3();

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    // Which cap a vertex belongs to is decided by which side of the mid-plane it sits on, not
    // by its stored normal - the stored normal is the thing being replaced, and at the rim it
    // is an average of the two caps and belongs to neither.
    // Each cap's own sphere centre already puts the normal on the outside of that cap - the
    // back cap's centre sits in front of it, so `vertex - centre` points backwards, which is
    // exactly the outward direction there. No sign correction is needed on either side.
    const front_ = corrected.subVectors(vertex, mid).dot(n) >= 0;
    corrected.subVectors(vertex, front_ ? front : back).normalize();
    normal.setXYZ(i, corrected.x, corrected.y, corrected.z);
  }

  normal.needsUpdate = true;
  geometry.userData.lensNormalsRefined = true;
  return geometry;
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

/**
 * The same preparation for the lens backdrop atlas, minus the one line that matters.
 *
 * `flipY` is LEFT ALONE here, and that is the entire difference. The rule above is about
 * glTF's UV origin, and it applies to textures mapped onto authored primitives. The backdrop
 * quads are built in code (`lensBackdrop.ts`) with the DOM convention the loader already
 * hands over, so flipping would stand the cards on their heads.
 *
 * It is a separate function rather than a flag on the one above because it is also where the
 * texture mutation is allowed to live: the React Compiler forbids a component mutating a value
 * a hook returned, so both callers launder the same write through a helper here - which is the
 * pattern `prepareScreenTexture` was already establishing.
 */
export function prepareBackdropTexture(texture: Texture, anisotropy: number) {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}
