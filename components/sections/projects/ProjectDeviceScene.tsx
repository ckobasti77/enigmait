"use client";

import { Suspense, useEffect, useMemo } from "react";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import {
  ClampToEdgeWrapping,
  SRGBColorSpace,
  Vector3,
  VideoTexture,
  type Mesh,
  type MeshStandardMaterial,
  type ShaderMaterial,
  type Texture,
} from "three";

import {
  SLIDE_DURATION,
  SLIDE_EASE_PATH,
} from "@/components/sections/disciplines/disciplinesTiming";
import type { ProjectMockupSize } from "@/constants/projectMockups";
import {
  DEVICE_GEOMETRY,
  DEVICE_ORDER,
  GLB_DEVICES,
  LAPTOP_HINGE,
  LIGHTS,
  MOCKUP_ASPECT,
  VIDEO_FADE_IN,
  VIDEO_FADE_OUT,
  screenAspect,
  screenSize,
  screenZ,
  type GlbDevice as GlbDeviceSpec,
  type ShowcaseLayout,
} from "@/constants/projectShowcase3D";

import {
  createScreenSlideMaterial,
  getCasingMaterial,
  type ShowcaseTheme,
} from "./deviceMaterials";
import {
  loadProject,
  peekProject,
  setScreenAnisotropy,
  type ScreenSet,
} from "./projectScreenTextures";
import type { Move } from "./useProjectIndex";

gsap.registerPlugin(CustomEase);
/**
 * Ista kriva kao slajd usluga i disciplina, pod svojim imenom. Deljenje ID-a sa
 * `disciplineSlide` bi značilo da dva modula registruju istu stavku - radi, ali
 * je tiho preklapanje koje niko ne očekuje.
 */
const SLIDE_EASE = CustomEase.create("projectSlide", SLIDE_EASE_PATH);

// Isti URL-ovi koje vrti sekcija disciplina, pa je ovo najčešće pogodak u
// drei-jev keš a ne nov prenos.
for (const spec of Object.values(GLB_DEVICES)) useGLTF.preload(spec.url);

type ScreenMaterials = Record<ProjectMockupSize, ShaderMaterial>;

/* ---------------------------------------------------------------------------
   Upisi u uniforme, oprani kroz modulske funkcije.

   React Compiler ne dozvoljava da se menja vrednost koja je prošla kroz hook, a
   `materials` dolazi iz `useMemo` i putuje kroz zavisnosti efekata. `materials.ts`
   u disciplinama rešava isti problem na isti način i pod istim imenom - upis se
   propušta kroz pomoćnu funkciju izvan komponente. Nije zaobilaženje pravila:
   ove funkcije su i jedino mesto na kojem se uniforme uopšte pišu, pa su i mesto
   na koje se gleda kad nešto na ekranu ne odgovara stanju.
   --------------------------------------------------------------------------- */

const writeScreens = (
  materials: ScreenMaterials,
  curr: ScreenSet,
  next: ScreenSet
) => {
  for (const size of DEVICE_ORDER) {
    const uniforms = materials[size].uniforms;
    uniforms.uCurr.value = curr[size];
    uniforms.uNext.value = next[size];
  }
};

const writeProgress = (materials: ScreenMaterials, value: number) => {
  for (const size of DEVICE_ORDER) {
    materials[size].uniforms.uProgress.value = value;
  }
};

const writeDirection = (materials: ScreenMaterials, direction: number) => {
  for (const size of DEVICE_ORDER) {
    materials[size].uniforms.uDir.value = direction;
  }
};

const writeVideoTexture = (materials: ScreenMaterials, texture: Texture) => {
  const uniform = materials.laptop.uniforms.uVideo;
  if (uniform) uniform.value = texture;
};

const writeVideoAspect = (materials: ScreenMaterials, aspect: number) => {
  const uniform = materials.laptop.uniforms.uVideoAspect;
  if (uniform) uniform.value = aspect;
};

type ProjectDeviceSceneProps = {
  /** Potvrđen projekat. Menja se na settle-u. */
  index: number;
  /** Ne-null dok slajd traje. */
  move: Move | null;
  layout: ShowcaseLayout;
  theme: ShowcaseTheme;
  videoElement: HTMLVideoElement | null;
  videoPlaying: boolean;
};

/**
 * Uređaj iz gotovog GLB-a: monitor i telefon.
 *
 * Renderuju se GEOMETRIJE iz `nodes`, ne kloniran scene graph - isti postupak
 * koji `DisciplineModel` koristi na početnoj, i jedini koji dopušta da se
 * materijali zamene bez diranja onoga što drei-jev keš deli sa ostatkom sajta.
 * Otuda i `dispose={null}`: geometrija pripada tom kešu i ne sme da je oslobodi
 * odjava ove komponente.
 *
 * Skalira se po VISINI TELA, jer je to jedina mera koju layout zna. Model dolazi
 * normalizovan na 2.0 po najdužoj osi, ali kod monitora ta osa nije ista kao kod
 * telefona, pa je fiksan faktor bio pogađanje.
 */
function GlbDevice({
  spec,
  screenMaterial,
  casing,
}: {
  spec: GlbDeviceSpec;
  screenMaterial: ShaderMaterial;
  casing: MeshStandardMaterial;
}) {
  const { nodes } = useGLTF(spec.url);

  const body = (nodes[spec.mesh] as Mesh | undefined)?.geometry;
  const screen = (nodes[spec.screen] as Mesh | undefined)?.geometry;

  const fit = useMemo(() => {
    if (!body) return { scale: 1, offset: [0, 0, 0] as [number, number, number] };

    body.computeBoundingBox();
    const box = body.boundingBox;
    if (!box) return { scale: 1, offset: [0, 0, 0] as [number, number, number] };

    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());

    return {
      scale: spec.height / Math.max(size.y, 1e-6),
      offset: [-centre.x, -centre.y, -centre.z] as [number, number, number],
    };
  }, [body, spec.height]);

  if (!body || !screen) return null;

  return (
    <group scale={fit.scale}>
      <group position={fit.offset}>
        <mesh geometry={body} material={casing} dispose={null} />
        <mesh geometry={screen} material={screenMaterial} dispose={null} />
      </group>
    </group>
  );
}

/** Ravan snimka. Uža od kućišta - razlika je bezel, i zato nije nacrtan posebno. */
function ScreenPlane({
  size,
  material,
}: {
  size: ProjectMockupSize;
  material: ShaderMaterial;
}) {
  const [width, height] = screenSize(size);

  return (
    <mesh position={[0, 0, screenZ(size)]} material={material}>
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

/**
 * Četiri uređaja i jedan sat.
 *
 * SINHRONIZACIJA NIJE SREĆA. `uCurr`/`uNext` su različiti na sva četiri ekrana,
 * pa su i materijali četiri - ali `uProgress` i `uDir` su isti, i piše ih JEDAN
 * tween nad jednim `{ v: 0 }` objektom. Četiri tween-a bi radila isto dok se ne bi
 * razišla, a "istovremeno na sva četiri ekrana" je ceo zahtev.
 */
export default function ProjectDeviceScene({
  index,
  move,
  layout,
  theme,
  videoElement,
  videoPlaying,
}: ProjectDeviceSceneProps) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const materials = useMemo(() => {
    const built = {} as ScreenMaterials;
    for (const size of DEVICE_ORDER) {
      const glb = GLB_DEVICES[size];
      built[size] = createScreenSlideMaterial(
        glb ? glb.screenAspect : screenAspect(size),
        size === "laptop",
        // Ekran iz glTF-a ima `v = 0` na vrhu, `PlaneGeometry` iz koda `v = 1`.
        glb ? 0 : 1
      );
      built[size].uniforms.uCurrAspect.value = MOCKUP_ASPECT[size];
      built[size].uniforms.uNextAspect.value = MOCKUP_ASPECT[size];
    }
    return built;
  }, []);

  useEffect(() => {
    return () => {
      for (const size of DEVICE_ORDER) materials[size].dispose();
    };
  }, [materials]);

  useEffect(() => {
    setScreenAnisotropy(gl.capabilities.getMaxAnisotropy());
  }, [gl]);

  /* --- Snimci -------------------------------------------------------------- */

  useEffect(() => {
    let alive = true;
    const target = move ? move.target : index;

    const apply = () => {
      if (!alive) return;

      const curr = peekProject(index);
      if (!curr) return;
      // U MIRU `uNext` MORA DA BUDE JEDNAK `uCurr`. Ta invarijanta je ono što šav
      // čini tačnim na p=0, i ono zbog čega frejm između kraja tween-a i React
      // commit-a već izgleda ispravno - pa settle nema blic.
      const next = peekProject(target) ?? curr;

      writeScreens(materials, curr, next);
      invalidate();
    };

    apply();
    void Promise.all([loadProject(index), loadProject(target)]).then(apply);

    return () => {
      alive = false;
    };
  }, [index, move, materials, invalidate]);

  /* --- Slajd --------------------------------------------------------------- */

  useEffect(() => {
    if (!move) {
      writeProgress(materials, 0);
      invalidate();
      return;
    }

    writeDirection(materials, move.direction);
    writeProgress(materials, 0);

    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: 1,
      duration: SLIDE_DURATION,
      ease: SLIDE_EASE,
      onUpdate: () => {
        writeProgress(materials, proxy.v);
        invalidate();
      },
    });

    // `kill()`, ne `revert()`. Ovaj cleanup je i ono što sprečava da poslednji
    // `onUpdate` upiše p≈0.99 preko VEĆ zamenjenih tekstura: React prvo pokrene
    // cleanup, pa telo efekta sa `move === null`, koje vrati p na nulu.
    return () => {
      tween.kill();
    };
  }, [move, materials, invalidate]);

  /* --- Video na laptopu ---------------------------------------------------- */

  const videoTexture = useMemo(() => {
    if (!videoElement) return null;

    const texture = new VideoTexture(videoElement);
    texture.colorSpace = SRGBColorSpace;
    // ISTA ORIJENTACIJA KAO SNIMCI, i to se ne podrazumeva: `VideoTexture` kreće
    // od `flipY = true`, a šejder pravi tačno jedan flip u DOM prostor i računa
    // da su mu svi izvori isti. Ostavljeno na defaultu, laptop pušta klip naopako
    // - jedini ekran od četiri, što je i način na koji se ovo primeti.
    texture.flipY = false;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    return texture;
  }, [videoElement]);

  useEffect(() => {
    if (!videoTexture) return;

    writeVideoTexture(materials, videoTexture);

    // `dispose()` je ovde najskuplji propust u fajlu: on i otkazuje
    // `requestVideoFrameCallback` registraciju. Bez njega se callback sam
    // registruje ponovo do kraja života taba, držeći mrtvu teksturu i element.
    return () => {
      videoTexture.dispose();
    };
  }, [videoTexture, materials]);

  useEffect(() => {
    if (!videoElement) return;

    const sync = () => {
      const { videoWidth, videoHeight } = videoElement;
      if (!videoWidth || !videoHeight) return;
      // Meri se, ne pogađa: `-sm` varijanta ima drugu prirodnu veličinu od pune.
      writeVideoAspect(materials, videoWidth / videoHeight);
      invalidate();
    };

    sync();
    videoElement.addEventListener("loadedmetadata", sync);
    videoElement.addEventListener("resize", sync);

    return () => {
      videoElement.removeEventListener("loadedmetadata", sync);
      videoElement.removeEventListener("resize", sync);
    };
  }, [videoElement, materials, invalidate]);

  const showVideo = Boolean(videoTexture) && videoPlaying && !move;

  useEffect(() => {
    const uniform = materials.laptop.uniforms.uVideoMix;
    if (!uniform) return;

    const tween = gsap.to(uniform, {
      value: showVideo ? 1 : 0,
      duration: showVideo ? VIDEO_FADE_IN : VIDEO_FADE_OUT,
      ease: showVideo ? "power1.out" : "power2.out",
      onUpdate: invalidate,
    });

    return () => {
      tween.kill();
    };
  }, [showVideo, materials, invalidate]);

  /* --- Kućišta ------------------------------------------------------------- */

  const shell = getCasingMaterial(theme, "shell");
  const deck = getCasingMaterial(theme, "deck");

  const place = layout.devices;
  const lid = DEVICE_GEOMETRY.laptop;
  const tablet = DEVICE_GEOMETRY.tablet;

  return (
    <>
      <ambientLight intensity={LIGHTS.ambient} />
      <directionalLight
        position={LIGHTS.key.position}
        intensity={LIGHTS.key.intensity}
      />
      <directionalLight
        position={LIGHTS.fill.position}
        intensity={LIGHTS.fill.intensity}
      />

      {/* Monitor i telefon dolaze iz kolekcije disciplina - modelovani uređaji sa
          stalkom, dugmadima i pravim proporcijama. Svaki ima svoj `Suspense`, a ne
          jedan zajednički: suspenzija oko cele scene bi na svako učitavanje
          sklonila i tablet i laptop, koji ne čekaju ništa. */}
      <group
        position={place.desktop.position}
        rotation={place.desktop.rotation}
        scale={place.desktop.scale}
      >
        <Suspense fallback={<group />}>
          <GlbDevice
            spec={GLB_DEVICES.desktop!}
            screenMaterial={materials.desktop}
            casing={shell}
          />
        </Suspense>
      </group>

      {/* Laptop. Poklopac se okreće oko donje ivice, pa mu treba zaseban pivot -
          nagni celu grupu i palmrest bi se nagnuo sa njim. */}
      <group
        position={place.laptop.position}
        rotation={place.laptop.rotation}
        scale={place.laptop.scale}
      >
        <group position={LAPTOP_HINGE.pivot} rotation-x={LAPTOP_HINGE.lean}>
          <group position={[0, lid.body[1] / 2, 0]}>
            <RoundedBox
              args={lid.body}
              radius={lid.bodyRadius}
              smoothness={3}
              bevelSegments={2}
              material={shell}
            />
            <ScreenPlane size="laptop" material={materials.laptop} />
          </group>
        </group>
        <RoundedBox
          args={LAPTOP_HINGE.deck.size}
          radius={LAPTOP_HINGE.deck.radius}
          smoothness={2}
          bevelSegments={1}
          position={LAPTOP_HINGE.deck.position}
          material={deck}
        />
      </group>

      <group
        position={place.tablet.position}
        rotation={place.tablet.rotation}
        scale={place.tablet.scale}
      >
        <RoundedBox
          args={tablet.body}
          radius={tablet.bodyRadius}
          smoothness={3}
          bevelSegments={2}
          material={shell}
        />
        <ScreenPlane size="tablet" material={materials.tablet} />
      </group>

      <group
        position={place.mobile.position}
        rotation={place.mobile.rotation}
        scale={place.mobile.scale}
      >
        <Suspense fallback={<group />}>
          <GlbDevice
            spec={GLB_DEVICES.mobile!}
            screenMaterial={materials.mobile}
            casing={shell}
          />
        </Suspense>
      </group>
    </>
  );
}
