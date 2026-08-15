import {
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  MeshStandardMaterial,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
} from "three";

import {
  SCREEN_SHEEN,
  SCREEN_SHEEN_COLOR,
} from "@/constants/projectShowcase3D";
import {
  screenSlideFragmentShader,
  screenSlideVertexShader,
} from "./screenSlide.shaders";

export type ShowcaseTheme = "dark" | "light";

/* ---------------------------------------------------------------------------
   Kućišta.

   Deljena i keširana, isti razlog i isti oblik kao `materials.ts` u
   disciplinama: osam mesheva troši šest materijala, koji su jeftini da se drže i
   skupi da se prekompajliraju. Ne dispose-uju se - jedino što bi vredelo baciti
   je paleta koja je izgubila, a to je jedan `MeshStandardMaterial`.
   --------------------------------------------------------------------------- */

export type CasingKind = "shell" | "deck" | "stand" | "island";

type CasingSpec = {
  color: string;
  metalness: number;
  roughness: number;
};

const CASING: Record<ShowcaseTheme, Record<CasingKind, CasingSpec>> = {
  dark: {
    shell: { color: "#1b2230", metalness: 0.55, roughness: 0.42 },
    deck: { color: "#232b3a", metalness: 0.5, roughness: 0.5 },
    stand: { color: "#151b26", metalness: 0.7, roughness: 0.3 },
    // Ostrvo kamere nije metal i ne sme da hvata odsjaj - ono je rupa u staklu.
    island: { color: "#05070c", metalness: 0, roughness: 0.9 },
  },
  light: {
    shell: { color: "#cfd4dc", metalness: 0.6, roughness: 0.32 },
    deck: { color: "#dde1e7", metalness: 0.52, roughness: 0.42 },
    stand: { color: "#b8bec7", metalness: 0.72, roughness: 0.26 },
    island: { color: "#0b0e14", metalness: 0, roughness: 0.9 },
  },
};

/** Svetla paleta pravi skoro belu kupolu, pa joj odsjaj treba prigušiti. */
const ENV_INTENSITY: Record<ShowcaseTheme, number> = { dark: 0.95, light: 0.7 };

const casingCache = new Map<string, MeshStandardMaterial>();

export function getCasingMaterial(theme: ShowcaseTheme, kind: CasingKind) {
  const key = `${theme}:${kind}`;
  const cached = casingCache.get(key);
  if (cached) return cached;

  const spec = CASING[theme][kind];
  const material = new MeshStandardMaterial({
    color: new Color(spec.color),
    metalness: spec.metalness,
    roughness: spec.roughness,
    envMapIntensity: ENV_INTENSITY[theme],
  });

  casingCache.set(key, material);
  return material;
}

/* ---------------------------------------------------------------------------
   Teksture snimaka.
   --------------------------------------------------------------------------- */

/**
 * 1x1 crna, da uniforme imaju šta da drže pre prve prave teksture.
 *
 * Materijal se pravi pre nego što se snimci učitaju, a `sampler2D` bez vrednosti
 * je nevezan uzorak - u najboljem slučaju upozorenje, u najgorem smeće na ekranu
 * u prvom frejmu.
 */
let blank: DataTexture | null = null;

export function blankTexture(): Texture {
  if (blank) return blank;
  blank = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  return blank;
}

/**
 * Snimak spreman za ravan ekrana.
 *
 * `flipY = false` je ovde ODLUKA, ne prepis iz `prepareScreenTexture`. Te
 * teksture idu na glTF geometriju, ove na `PlaneGeometry` napravljenu u kodu -
 * ista vrednost, drugi razlog. `PlaneGeometry` daje gornjem vrhu `uv.v = 1`, a
 * snimak ima red 0 na vrhu; isključen `flipY` znači da u šejderu postoji tačno
 * jedan flip i da je `object-position: top` bukvalno `o.y = 0.0`.
 *
 * `ClampToEdgeWrapping` je default, ali stoji eksplicitno jer je nosivo:
 * `RepeatWrapping` bi pustio suprotnu ivicu snimka da procuri u šav.
 *
 * Mipmapovi ostaju uključeni - snimak od 1600px crta se u ~450 uređajskih
 * piksela, i bez mipova treperi tačno tokom slajda, kad svi gledaju.
 */
export function prepareMockupTexture(texture: Texture, anisotropy: number) {
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;

  if (process.env.NODE_ENV !== "production" && texture.flipY) {
    console.error(
      "[projects] flipY je ostao uključen na snimku - cover-fit će se usidriti za dno."
    );
  }

  return texture;
}

/* ---------------------------------------------------------------------------
   Materijal ekrana.
   --------------------------------------------------------------------------- */

export type ScreenUniforms = {
  uCurr: { value: Texture };
  uNext: { value: Texture };
  uCurrAspect: { value: number };
  uNextAspect: { value: number };
  uPlaneAspect: { value: number };
  uProgress: { value: number };
  uDir: { value: number };
  uSheen: { value: number };
  uSheenColor: { value: Color };
  uFlipV: { value: number };
  uVideo?: { value: Texture };
  uVideoAspect?: { value: number };
  uVideoMix?: { value: number };
};

/**
 * Jedan materijal po uređaju - `uCurr`/`uNext` su različiti na sva četiri, pa
 * deljenje nije opcija. `uProgress`/`uDir` jesu isti, i to je tačno ono što
 * `ProjectDeviceScene` upisuje iz JEDNOG tween-a: sinhronizacija onda važi po
 * konstrukciji, a ne po tome što su četiri tween-a slučajno u koraku.
 *
 * `toneMapped: false` je nosiv i mora da stoji pri konstrukciji: canvas ostaje na
 * AgX zbog kućišta, a AgX bi klijentovu brend-boju vratio kao ugašenu ciglu.
 * `dithering` ubija trakanje na gradijentu odsjaja i ne košta ništa.
 */
export function createScreenSlideMaterial(
  planeAspect: number,
  hasVideo: boolean,
  /** 1 za `PlaneGeometry` pravljenu u kodu, 0 za ekran iz glTF-a. */
  flipV: number
) {
  const empty = blankTexture();

  const uniforms: ScreenUniforms = {
    uCurr: { value: empty },
    uNext: { value: empty },
    uCurrAspect: { value: 1 },
    uNextAspect: { value: 1 },
    uPlaneAspect: { value: planeAspect },
    uProgress: { value: 0 },
    uDir: { value: 1 },
    uSheen: { value: SCREEN_SHEEN },
    uSheenColor: { value: new Color(...SCREEN_SHEEN_COLOR) },
    uFlipV: { value: flipV },
  };

  if (hasVideo) {
    uniforms.uVideo = { value: empty };
    uniforms.uVideoAspect = { value: 16 / 10 };
    uniforms.uVideoMix = { value: 0 };
  }

  const material = new ShaderMaterial({
    vertexShader: screenSlideVertexShader,
    fragmentShader: screenSlideFragmentShader,
    // `#define` umesto `if (uVideoMix > 0.0)`: drži dohvat teksture potpuno van
    // kontrole toka (izvodi unutar grananja su mina u specifikaciji) i štedi
    // ostalim trima uređajima jedan lažan uzorak.
    defines: hasVideo ? { HAS_VIDEO: "" } : {},
    uniforms,
    toneMapped: false,
    dithering: true,
    transparent: false,
    depthWrite: true,
  });

  return material;
}
