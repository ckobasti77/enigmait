import { TextureLoader, type Texture } from "three";

import {
  PROJECT_MOCKUPS,
  type ProjectMockup,
  type ProjectMockupSize,
} from "@/constants/projectMockups";
import { projects } from "@/constants/projects";
import { DEVICE_ORDER, TEXTURE_WINDOW } from "@/constants/projectShowcase3D";

import { prepareMockupTexture } from "./deviceMaterials";

/**
 * Snimci projekata kao GPU teksture, sa prozorom rezidentnosti.
 *
 * Isti ugovor kao `disciplinePrefetch.ts`, sa OBRNUTIM TEŽIŠTEM. Tamo je skupa
 * polovina bila `preload` - GLB modeli preko mreže. Ovde je mreža nebitna (24
 * webp-a, ukupno ispod 1.5 MB) a `release` je cela poenta: tekstura na GPU živi
 * dekompresovana, ~32 MB po projektu sa mipovima, pa bi svih šest bilo ~190 MB.
 *
 * Pravilo ostaje doslovno isto i ono je jedino zbog čega ovaj fajl postoji kao
 * fajl: DISPOSE PA OBRIŠI UNOS. Unos u kešu je jedini preostali handle na objekat
 * koji drži GPU alokaciju - obriši ga prvi i upload je nedostižan i trajan.
 *
 * IMPERATIVNI LOADER, NE `useTexture` - i to je svesno odstupanje od kućnog
 * defaulta. `useTexture` suspenduje; u `DisciplineModel` je fallback prihvatljiv
 * frejm, ovde nije: uređaj koji suspenduje usred slajda ostavlja kućište sa rupom
 * tamo gde je bio ekran, na četiri uređaja koji JESU cela funkcija. Skok na
 * udaljenu tačku slajdera je baš taj slučaj.
 */

export type ScreenSet = Record<ProjectMockupSize, Texture>;

const cache = new Map<string, Texture>();
const inFlight = new Map<string, Promise<Texture>>();

let loader: TextureLoader | null = null;
/**
 * Postavlja ga scena iz `gl.capabilities.getMaxAnisotropy()`. Snimci se gledaju
 * pod nagibom i bez anizotropije sitan tekst se raspada u kašu.
 */
let anisotropy = 1;

export function setScreenAnisotropy(value: number) {
  const next = Math.max(1, value);
  if (next === anisotropy) return;
  anisotropy = next;

  // Prava vrednost se zna tek kad postoji renderer, a prvi snimci mogu da krenu
  // pre toga. Zato se već učitane teksture doteraju umesto da ostanu na 1 - to bi
  // bio jedan projekat sa mutnim tekstom pod nagibom, i to baš prvi.
  for (const texture of cache.values()) {
    texture.anisotropy = next;
    texture.needsUpdate = true;
  }
}

const wrap = (index: number) =>
  ((index % projects.length) + projects.length) % projects.length;

const mockupFor = (index: number): ProjectMockup | undefined => {
  const project = projects[wrap(index)];
  return project ? PROJECT_MOCKUPS[project.id] : undefined;
};

const urlsFor = (index: number): string[] => {
  const mockup = mockupFor(index);
  if (!mockup) return [];
  return DEVICE_ORDER.map((size) => mockup[size]);
};

const loadUrl = (url: string): Promise<Texture> => {
  const cached = cache.get(url);
  if (cached) return Promise.resolve(cached);

  const running = inFlight.get(url);
  if (running) return running;

  loader ??= new TextureLoader();

  const promise = new Promise<Texture>((resolve, reject) => {
    loader!.load(
      url,
      (texture) => {
        // Priprema ide OVDE, pre nego što tekstura ikad dođe do materijala - što
        // usput zaobilazi i zabranu React Compiler-a da se mutira vrednost iz
        // hooka, jer ovde ništa ne dolazi iz hooka.
        prepareMockupTexture(texture, anisotropy);
        cache.set(url, texture);
        inFlight.delete(url);
        resolve(texture);
      },
      undefined,
      (error) => {
        inFlight.delete(url);
        reject(error);
      }
    );
  });

  inFlight.set(url, promise);
  return promise;
};

/** Sinhrono čitanje. `null` kad projekat nije rezidentan. */
export function peekProject(index: number): ScreenSet | null {
  const mockup = mockupFor(index);
  if (!mockup) return null;

  const set = {} as ScreenSet;
  for (const size of DEVICE_ORDER) {
    const texture = cache.get(mockup[size]);
    if (!texture) return null;
    set[size] = texture;
  }
  return set;
}

/**
 * Sva četiri snimka jednog projekta. Rešava se u istom mikrotasku kad je projekat
 * već rezidentan, što je slučaj za strelicu i swipe jer prefetch drži susede
 * toplim. Korak se gejtuje na ovo - tween ne sme da krene pre nego što sve četiri
 * ulazne teksture postoje.
 */
export async function loadProject(index: number): Promise<ScreenSet | null> {
  const mockup = mockupFor(index);
  if (!mockup) return null;

  try {
    const textures = await Promise.all(
      DEVICE_ORDER.map((size) => loadUrl(mockup[size]))
    );

    const set = {} as ScreenSet;
    DEVICE_ORDER.forEach((size, position) => {
      set[size] = textures[position];
    });
    return set;
  } catch {
    // Snimak koji ne stigne ne sme da obori slajder - ekran zadrži prethodnu
    // teksturu, što je uvek bolje od rupe u kućištu.
    return null;
  }
}

function releaseProject(index: number, keep: Set<string>) {
  for (const url of urlsFor(index)) {
    if (keep.has(url)) continue;

    const texture = cache.get(url);
    if (!texture) continue;

    // Dispose PRVI, brisanje unosa DRUGO. Obrnut redosled je kako se cure
    // teksture: `disciplinePrefetch.ts` je već platio tu lekciju.
    texture.dispose();
    cache.delete(url);
  }
}

type IdleHandle = { cancel: () => void };

const onIdle = (run: () => void, timeout = 2000): IdleHandle => {
  if (typeof window === "undefined") return { cancel: () => {} };

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout });
    return { cancel: () => window.cancelIdleCallback(id) };
  }

  const id = window.setTimeout(run, 200);
  return { cancel: () => window.clearTimeout(id) };
};

/**
 * Drži trenutni projekat i po jednog suseda sa svake strane, i baca sve ostalo.
 * Kružna razdaljina, jer se lista vrti - sused indeksa 0 je i indeks 5.
 */
export function prefetchNeighbours(index: number): IdleHandle {
  return onIdle(() => {
    const length = projects.length;

    const keep = new Set<string>();
    for (let offset = -TEXTURE_WINDOW; offset <= TEXTURE_WINDOW; offset += 1) {
      for (const url of urlsFor(index + offset)) keep.add(url);
    }

    for (let offset = 1; offset <= TEXTURE_WINDOW; offset += 1) {
      void loadProject(wrap(index + offset));
      void loadProject(wrap(index - offset));
    }

    for (let position = 0; position < length; position += 1) {
      const gap = Math.abs(position - wrap(index));
      if (Math.min(gap, length - gap) <= TEXTURE_WINDOW) continue;
      releaseProject(position, keep);
    }
  });
}

/** Vitrina je otišla sa strane: ništa od ovoga više nema ko da semplira. */
export function releaseAllProjects() {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
  inFlight.clear();
}
