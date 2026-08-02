# SECTION_SPEC — specifikacija nove sekcije „Izaberite disciplinu"

**Ovo je autoritet za ceo posao. Poštuj doslovno.**

Šest disciplina već postoje kao podaci i kao rute — `constants/navLinks.ts`, folderi pod
`app/(pages)/services/`, `ServiceFloatingKey`. Ovaj posao ne izmišlja nove discipline,
nego menja **kako se biraju**: umesto grida od šest kartica, jedna sekcija sa
jednim 3D modelom u fokusu.

Cilj je lista u sekciji „Definicija „gotovo"". Radi dok sve stavke ne prođu.
Ne pitaj gde šta ide — mapa fajlova je ispod.

Tri stvari traže moju odluku pre Faze E i stoje u „Otvorena pitanja". Sve ostalo je odlučeno.

---

## 0. Šta pravimo

Zamenjujemo **kompletnu** sekciju „Izaberite disciplinu". Levo: 3D kolona, jedan model u
fokusu. Desno: naslov + podnaslov + CTA koji se menjaju sinhrono sa modelom. Između njih:
stepper — strelica iznad i ispod, tačke između njih.

**Postojeći grid od šest kartica se uklanja u potpunosti.** Ne spašavaj kartice, ne gradi
novo pored starog, ne pravi feature flag.

Živi lanac: `app/page.tsx` → **`app/_components/ServiceCards.tsx`** (124 linije, poslednja
sekcija pre footera).

Stari grid pročitaj **samo da bi mapirao zavisnosti**. Dve stvari koje ćeš naći i koje
moraš da razrešiš:

1. `navLinks.find((link) => link.text === "Usluge")?.dropdownLinks` — čitanje šest usluga
   preko srpskog stringa. Isti obrazac postoji i u `app/(pages)/services/page.tsx:6`.
   Nova sekcija **ne sme** da nasledi to; ona čita svoj ugovor podataka (sekcija 4).
2. `TIMELINE_SENTINEL_ID = "timeline-end-sentinel"` (`ServiceCards.tsx:11`) čita
   `<div id="timeline-end-sentinel">` iz `app/_components/Timeline.tsx:97` da bi paljio
   glow orb. Kad obrišeš `ServiceCards.tsx`, taj div ostaje siroče **koje pravi tvoja izmena**,
   pa po `AGENTS.md` pravilu 3 ide u istom commit-u. Ostatak `Timeline.tsx` ne diraj.

Sekcija **ostaje poslednja** pre footera. Redosled na početnoj se ne menja.

---

## 1. Kontekst repoa — pročitaj pre svega

Repo: `C:\Users\admin\Desktop\Web Dev Projects\enigma-digital`

Obavezno: `.claude/CLAUDE.md`, `.claude/rules/patterns.md` (GSAP, R3F, theme, `"use client"`),
`.claude/rules/architecture.md`, `.claude/rules/conventions.md`, `.claude/rules/styling.md`,
`AGENTS.md`, i `HERO_SPEC.md` — ne zbog sadržaja, nego zbog toga kako je hero rešio iste
probleme (jedan izvor vremena, providan canvas, pauza van ekrana, reduced-motion kadar).

### Skill-ovi — koristi ih, u projektu su sa razlogom

U `.claude/skills/` stoje gotovi skill-ovi za baš ovaj stack. **Nisu opcioni.**
Učitaj relevantan skill PRE nego što napišeš kod za tu oblast, ne posle prve greške:

| Pre nego što radiš | Učitaj |
|---|---|
| bilo koji GSAP u komponenti, cleanup, `useGSAP` | **`gsap-react`, `gsap-performance`** ← najvažniji ovde |
| wheel capture, tastatura, swipe nad modelom | **`threejs-interaction`** |
| trajanja, easing, koliko je „previše", stagger | **`motion-design`** ← brojevi u tabeli prelaza dolaze odavde |
| `InstancedMesh`, `TubeGeometry`, budžet trouglova | `threejs-geometry` |
| tri deljena materijala, transmission, dve kože po temi | `threejs-materials` |
| PMREM env u kodu, bez `.hdr` fajla | `threejs-lighting` |
| `useGLTF`, prefetch, `COLOR_0`, meshopt dekoder | `threejs-loaders` |
| `useFrame`, swap timeline, ambient rotacija | `threejs-animation`, `threejs-fundamentals` |
| pointer parallax bez raycast-a | `threejs-interaction` |
| bloom — samo ako se dokaže da vredi | `threejs-postprocessing` |
| siluete, tipografski ton sekcije | `design-dna` |

Ako je odgovor na neko pitanje u skill-u, ne improvizuj i ne pogađaj iz sećanja.

**Stack (sve već instalirano — ništa ne instaliraj bez pitanja):**
Next.js 16.2.6 App Router · React 19.2.6 · TypeScript strict, alias `@/*` → koren repoa ·
**@react-three/fiber 9.6.1 + @react-three/drei 10.7.7** · three 0.184.0 ·
gsap 3.15 + @gsap/react · lenis 1.3.23 · Tailwind v4 · Turbopack (dev i build)

Ovo **nije** vanilla Three.js projekat. Pišeš R3F komponentu.

### Šta već postoji — koristi, ne pisati ponovo

- `hooks/usePrefersReducedMotion.ts` — **jedan hook, tri signala**: media query ILI
  `navigator.connection.saveData` ILI baterija ≤20% i ne puni se. Save-Data iz odluke 9
  je već pokriven, ne piši drugi detektor.
- `hooks/useIntersectionActive.ts` — pauza kad je sekcija van ekrana.
- `app/_components/SmoothScrollProvider.tsx` — Lenis 1.3.23 (`lerp: 0.08`, `autoRaf: false`),
  već povezan sa ScrollTrigger-om preko `lenis.on("scroll", ScrollTrigger.update)` +
  `gsap.ticker.add`. **Ne diraj tu integraciju, ne pravi drugi Lenis, ne zovi `scrollerProxy`** —
  Lenis vozi nativni `window` scroll, pa je default scroller već tačan.
- `useSmoothScroll()` vraća `RefObject<Lenis | null>`, **dvostruko opciono**: sam hook može
  biti `null`, i `.current` može biti `null`. Pod reduced-motion Lenis se **nikad ne instancira**
  (`SmoothScrollProvider.tsx:36-41`), pa nijedna grana koja zove Lenis ne sme da bude jedina.
  Lenis sluša `wheel` na `window`-u, dakle **posle** svakog listener-a na elementu u stablu.
- `app/_components/MoodScrollController.tsx` — gotov obrazac za ref-om vođeno stanje bez
  re-rendera (`progressRef` kao `MutableRefObject`, `:50`) i za `gsap.context()` + `ctx.revert()`.
- `components/ui/cta-button.tsx` — **jedini CTA na sajtu**, `asChild` preko `next/link`.
- `components/sections/hero/heroTiming.ts` — obrazac za fajl sa tajmingom uz sekciju.
- `.site-gutter` + `.site-container` par (`globals.css:84-98`). Obavezan.
  Ne vraćaj `px-6` + `max-w-Nxl`.
- `constants/brand-guidelines.ts` — glas i ton, na srpskom.

### Ispravka: `blender/CLAUDE.md` NE sadrži export pipeline

Proverio sam. Taj fajl je operativni priručnik za Blender MCP + spisak Blender 5.1 API zamki.
**Nema** gltf-transform, meshopt, `COLOR_0`, bevel, weighted normals ni AO bake.
5.1 zamke jesu zakon i preuzete su u Fazu A. **Export ugovor se piše ovde, ne nasleđuje se.**

Iz `blender/CLAUDE.md` i dalje važi doslovno: `.glb` ide u `exports/` (folder ne postoji,
napravi ga), skripte u `scripts/ops/`, `get_blendfile_summary_path_info` pre svake mutacije,
nikad `_for_cli` nad otvorenim `projekat.blend`, nikad apsolutne `C:\` putanje u sceni.

---

## 2. Mapa fajlova

**Novo:**

| Fajl | Šta |
|---|---|
| `constants/disciplines.ts` | **ugovor podataka**, jedini izvor istine za svih šest |
| `components/sections/disciplines/Disciplines.tsx` | shell sekcije, vlasnik `index` state-a |
| `components/sections/disciplines/useDisciplineIndex.ts` | ulazni motor: wheel capture, tastatura, swipe, koraci |
| `components/sections/disciplines/DisciplineStage.tsx` | `<Canvas>`, najviše dva modela u sceni |
| `components/sections/disciplines/DisciplineModel.tsx` | jedan model: GLB telo + primitiv ekrana + instancirani akcent |
| `components/sections/disciplines/DisciplineCopy.tsx` | šest tekstualnih panela, svih šest uvek u DOM-u |
| `components/sections/disciplines/DisciplineStepper.tsx` | strelice + tačke, `aria-current`, tastatura |
| `components/sections/disciplines/disciplinesTiming.ts` | tabela prelaza kao konstante |
| `components/sections/disciplines/environment.ts` | PMREM env građen u kodu, po temi |
| `components/sections/disciplines/materials.ts` | tri deljena materijala, po temi |
| `components/sections/disciplines/index.ts` | barrel export |
| `public/assets/models/disciplines/<key>.glb` × 6 | izlaz iz Faze A i C |
| `public/assets/screens/disciplines/<key>.webp` × 6 | **slike ekrana**, učitava ih R3F u kodu; do mojih slika jedan deljen placeholder |
| `public/assets/stills/disciplines/<key>.webp` × 6 | no-WebGL / Save-Data fallback |
| `blender/scripts/ops/export_discipline.py` | export op, po folder pravilima iz `blender/CLAUDE.md` |

**Menja se:**

| Fajl | Šta |
|---|---|
| `app/page.tsx` | zameni import `ServiceCards` → `Disciplines`, pozicija ostaje poslednja |
| `lib/i18n.ts` | nov `// Home disciplines` blok; **obriši parove na `:174-179`** |
| `app/globals.css` | scoped varijable pod `.disciplines`, po uzoru na `.process-timeline:778-788` |

**Briše se:** `app/_components/ServiceCards.tsx` (cela), `lib/i18n.ts:174-179` (tri para
starog grida), `<div id="timeline-end-sentinel">` na `app/_components/Timeline.tsx:97`.

**Ne dira se:** `constants/navLinks.ts`, `constants/serviceDetails.ts`,
`constants/serviceFloatingObjects.ts`, `SmoothScrollProvider.tsx`, `ThemeProvider.tsx`,
ostatak `Timeline.tsx`, `public/assets/models/hero-cube.glb`.

Imena fajlova su predlog — ako `.claude/rules/conventions.md` propisuje drugačije,
konvencije repoa pobeđuju, samo mi javi šta si promenio.

---

## 3. Odluke — nema pitanja, radi po ovome

Sve je odlučeno. Ne pitaj, ne čekaj odgovor, radi.

1. **Layout:** levo 3D kolona sa jednim modelom u fokusu, desno title + subtitle + CTA
   koji se menjaju sinhrono sa modelom.
2. **Mehanizam: sekcija se NE pinuje.** Nema pin-a, nema snap-a, nema pin-spacer-a.
   Stranica skroluje pored sekcije normalno i scroll pozicija ne određuje ništa.
   Index se menja iz **tri ulaza i samo tri**: (a) kursor nad 3D kolonom + točkić miša,
   (b) klik na strelicu ili tačku, (c) tastatura dok je 3D kolona fokusirana. Na dodiru
   još i horizontalni swipe preko modela. **Kursor bilo gde drugde na sekciji — naslov,
   lede, CTA, prazan prostor — i scroll ide ka footeru, ništa se ne presreće.**
   Detalji, brojevi i pravilo otpuštanja na krajevima su u Fazi D.
3. **Najviše DVA modela u sceni**: aktivni i onaj koji ulazi. Ostali su unmount-ovani.
   Prefetch susednih GLB-ova na `requestIdleCallback`.
4. **Blender daje SAMO geometriju** — bevel + weighted normals + AO zapečen u vertex
   colors (`COLOR_0`). **Nula PBR tekstura iz Blendera.** Svi materijali, svetlo i env u kodu.

   **Amandman (koncept uređaja).** Odluka se ne ukida, nego se precizira: **tekstura i dalje
   NIKAD ne ulazi u GLB.** Blender uz telo isporučuje i **ekran kao zaseban primitiv** —
   sopstveni mesh sa UV-ovima i **praznim materijalom**, bez ijedne slike zakačene za njega.
   Sliku učitava R3F iz `/public` i vezuje je na materijal u kodu (recept u Fazi E,
   „Materijal ekrana"). GLB nosi mesto za sliku, ne sliku.

   Posledica za kriterijume prijema Faze A i B: **`TEXCOORD_0` je dozvoljen SAMO na primitivu
   ekrana.** Telo ostaje bez UV-ova — `POSITION`, `NORMAL`, `COLOR_0` sa zapečenim AO i ništa
   više. Ako `TEXCOORD_0` osvane na telu, export je pogrešan, ne „malo veći".
5. **Materijalni jezik:** anodizovani tamni metal + hladan neutralni metal + jedan cyan
   emissive akcent. Maksimum tri deljena materijala preko svih šest. Radi u obe teme.
6. **Budžeti su kriterijum prijema** — vidi „Budžeti" ispod.
7. **Environment se gradi u kodu** (gradijent + emisioni quadovi → PMREM jednom), bez
   `.hdr` fajla, da bi se menjao sa temom.
8. **Post: samo Bloom + Vignette + suptilno zrno.** Bez SSAO (AO je zapečen), bez DOF-a.
   Transmission najviše na jednom elementu jednog modela.
9. **SEO/a11y je tvrd zahtev.** Tekst svih šest disciplina je u DOM-u sve vreme, inaktivni
   sakriveni vizuelno a **ne** uslovno mountovani. Svaki CTA je pravi
   `<Link href="/services/<key>">`. Stepper ima `aria-current` i strelice na tastaturi.
   `prefers-reduced-motion` gasi 3D i daje običnu vertikalnu listu od šest.
   No-WebGL/Save-Data pada na WebP still.
10. **Postojeći grid od šest kartica se uklanja u potpunosti.**
11. **Mobilni ispod 768px zadržava 3D.** `dpr [1, 1.5]`, bez posta, bez transmission-a,
    instance prepolovljene. Ako izmerena brojka padne ispod 45 fps, javi mi je pre nego što
    sam nešto isključiš.
12. Ako nešto stvarno ne može, uradi najbliže moguće i napiši mi to u izveštaju.

### Telo i ekran iz Blendera, akcent uvek u kodu

Ovo je pravilo koje samo od sebe zatvara budžet draw call-ova, pa ga ne izvodi svaki put ispočetka:

> **Blender isporučuje tačno dva mesh-a po modelu** — **telo** (jedan material slot, `COLOR_0`
> sa zapečenim AO, bez UV-ova) i **ekran** (zaseban primitiv, UV-ovi, prazan materijal, bez
> ijedne slike u fajlu). **Sve cyan je proceduralno u kodu**: jedan `InstancedMesh` sa
> deljenim emissive materijalom, pozicije iz `constants/disciplines.ts` kao `Vec3[]`.

**Draw call budžet — pravilo od 2 se ukida.** Novo pravilo:

> **telo + ekran + akcent = ≤ 3 draw call-a po modelu.** `seo-geo` sme **4**.
> U swap prozoru (1,36 s), dok su dva modela u sceni, **≤ 6**.

Posledice, sve poželjne:

- Slika ekrana se menja bez ponovnog exporta — GLB nosi UV-ove, ne piksele.
- Emissive geometrija ne postoji šest puta u šest GLB-ova.
- Akcent se animira (`emissiveIntensity` 0 → 1) bez diranja geometrije.
- Ako se cyan promeni, menja se jedan materijal, ne šest fajlova.

`seo-geo` ima četvrti call jer nosi **jedini transmission element na celoj sekciji** —
sočivo lupe. Ispod 768px transmission se gasi i taj model pada nazad na 3.

### Materijalni jezik — tri materijala, dve kože

| id | dark tema | light tema | koristi |
|---|---|---|---|
| `MAT_ANODIZED` | tamni anodizovani metal, `metalness 0.82`, `roughness 0.34` | svetli brušeni aluminijum, `metalness 0.78`, `roughness 0.30` | telo: `web-development`, `mobile-app-development`, `branding` |
| `MAT_STEEL` | hladan neutralni metal, `metalness 0.9`, `roughness 0.18` | isti metal, `roughness 0.22` | telo: `ui-ux-design`, `seo-geo`, `social-media` |
| `MAT_EMISSIVE` | cyan `#58C4FF`, `emissiveIntensity` do 1.0 | tamniji, zasićeniji cyan `#0E8FD6`, `emissiveIntensity` do 1.6 | akcent na svih šest |

**Materijalni jezik je nepromenjen, ali sada radi bolje nego pre.** Monitor, telefon, tablet,
tubus lupe i konstrukcija bilborda su u stvarnosti mašinski metal i staklo — anodizovano
kućište, brušeno postolje, sočivo. Ranije je taj jezik bio nametnut apstraktnim formama koje
ni od čega nisu napravljene; sada opisuje objekat kakav zaista jeste, pa se **jezik i objekat
više ne bore** — svaka vrednost u tabeli gore brani se samim predmetom.

**Zašto `metalness` nije 1.0:** na punom metalu nema difuzne komponente koju bi `COLOR_0`
množio, pa bi AO koji si zapekao u Fazi A bio nevidljiv. `0.78-0.9` je prozor u kome metal
i dalje čita kao metal a AO ima šta da zatamni. Ne diži na 1.0 „radi realizma" — obrisaćeš
ceo rad iz Faze A.

Cyan `#58C4FF` nije izabran nasumično — to je `--primary` iz dark palete (`globals.css:274`).
Svaka vrednost gore ide kroz CSS varijablu ili konstantu, **nigde hardkodovan hex u JSX-u**
(`.claude/rules/patterns.md`).

**Temu čitaj VAN `<Canvas>`-a i prosledi kao prop.** Ne oslanjaj se na to da R3F prosleđuje
React kontekst kroz svoj reconciler — ne pretpostavljam da prosleđuje, i ne treba nam odgovor
na to pitanje. `HeroCube` već tako radi sa `staticFrame`.

### Kamera i normalizacija — jedna kamera za svih šest

```js
camera.position.set(-3.2, 2.4, 6.4)   // r ≈ 7.6
camera.lookAt(0, 0, 0)
camera.fov = 30                        // vertikalni
```

Da bi jedna kamera radila za svih šest, **export normalizuje bbox**: model je centriran na
koordinatnom početku i najduža osa mu je tačno `2.0` (dakle staje u `±1.0`). To je export
pravilo iz Faze B, ne predlog. Bez njega svaki model traži svoje podešavanje kamere i
prelaz se vidi kao skok skale.

### QA rig — fiksni deo pipeline-a, ne pomoćna skripta

`blender/scripts/ops/qa_rig.py`. **Svaki model prolazi kroz oba prolaza pre nego što se
proglasi gotovim**, u svakoj fazi u kojoj se oblik menja (blocking, bevel, AO). Rig je bez
side-effect-a na import; `setup()`, `render_clay()` i `render_silhouette()` su funkcije, a
`_snapshot()`/`_restore()` vraćaju engine, view transform, world, vidljivost i materijale u
zatečeno stanje.

Kadar je isti kao gore i **ne menja se ni za jedan model** — orijentacija je deo modela, ne
podešavanje kamere.

| | prolaz 1 — clay | prolaz 2 — silueta |
|---|---|---|
| engine | EEVEE, 96 uzoraka, raytracing | EEVEE, 32 uzorka |
| model | sivi clay, `metalness 0`, `roughness 0.28` | crn **Emission** shader |
| svetlo | key gore-levo 45°/45°, hladan fill desno na ¼, rim iza-levo-dole | nema |
| pozadina | vertikalni gradijent | ravno belo |
| view transform | AgX, `Medium High Contrast` | **Standard** |
| rezolucija | **1024²** | **1024²** |

Četiri stvari su naučene skupo i ne vraćaju se nazad:

- **Nikad `render_thumbnail_to_path` za sud o formi.** Taj alat namerno obara rezoluciju i
  kvalitet; bevel od par milimetara na 512px ne postoji ni kao piksel. Prvi pilot je pao na
  tome, ne na modelu.
- **Fill je ¼ key-a mereno na modelu**, ne po nominalnim vatima — odnos se izvodi iz
  `E/r²`, jer dva svetla sa istim W na različitoj udaljenosti nisu isto jaka.
- **Ekransko levo je manji azimut** pozicije svetla. Rim sa pogrešnim znakom greje bok koji
  se iz ovog kadra uopšte ne vidi i silueta ostaje slepljena sa pozadinom.
- **Silueta ide kroz EEVEE, ne kroz Workbench.** `bpy.ops.render.render` sa Workbench-om
  ignoriše `display.shading.background_color` i vraća boju teme (0.247 sivo) — to je viewport
  postavka, ne render. Crna emisija na belom `Background`-u daje čiste nule i jedinice, što
  je provereno na pikselima.

### Budžeti — ovo su kriterijumi prijema, ne želje

Dve odvojene kolone, jer su to dva različita mrežna posla: **geometrija** (GLB-ovi) i
**slike ekrana** (WebP iz `/public`). Zbir jedne ne sme da se pravda rezervom u drugoj.

| Šta | Granica — geometrija | Granica — teksture ekrana |
|---|---|---|
| trouglova po GLB-u | **≤ 25.000** | — |
| veličina po jedinici, posle `gltf-transform` + meshopt | **≤ 120 KB** po GLB-u | **≤ 100 KB** po ekranu |
| ukupno svih šest | **≤ 700 KB** | **≤ 600 KB** |
| logo atlas (`seo-geo`, planirano) | — | **≤ 30 KB** |
| draw call-ova po modelu | **≤ 3** (telo + ekran + akcent; `seo-geo` 4; **≤ 6** samo u swap prozoru) | — |
| `dpr` | **`[1, 1.75]`** desktop, `[1, 1.5]` ispod 768px | — |
| fps, mid-range laptop | **60** | — |
| fps, mid-range Android | **≥ 45** | — |

**Granica od ≤ 700 KB za GLB-ove je nepromenjena.** Slike ekrana su dodatak pored nje, ne u njoj.

**Ekrani se učitavaju po istom prefetch pravilu kao GLB-ovi** (odluka 3): u memoriji je
**samo aktivni ekran plus dva susedna** (`index ± 1`), susedni idu na `requestIdleCallback`,
ostali se ne traže dok se ne priđu. Šest tekstura odjednom je tačno ono što ovaj budžet
sprečava — vidi red u „Rizicima".

Referenca za osećaj: `public/assets/models/hero-cube.glb` je **60.832 B za 2224 trougla**,
dakle **27 B/trougao** nekompresovano (FLOAT32 `POSITION` + `NORMAL` + `TEXCOORD_0`).
Sa meshopt-om i kvantizacijom ciljaj **7-9 B/trougao**. Prosek od 10.000 trouglova onda
pada na ~90 KB, pa šest modela staje u ~540 KB — ispod granice od 700 KB, sa rezervom.
Ako ti prvi export da 27 B/trougao, kompresija ne radi; ne krati geometriju, popravi pipeline.

---

## 4. Ugovor podataka — jedan fajl, izvor istine

`constants/disciplines.ts`. Ključevi dolaze iz `ServiceFloatingKey`, koji ima **sedam**
članova (`"default"` + šest slugova), pa se `"default"` isključuje tipom — tako kompajler
čuva da svih šest postoji i da se nijedan slug ne otkuca pogrešno.

```ts
import type { ServiceFloatingKey } from "@/constants/serviceFloatingObjects";

export type DisciplineKey = Exclude<ServiceFloatingKey, "default">;

export type Vec3 = [number, number, number];

export type Discipline = {
  key: DisciplineKey;
  /** Ime mesh-a TELA u GLB-u. Čita se preko `nodes[meshName]`, kao HeroCube. */
  meshName: string;
  /**
   * Ime mesh-a EKRANA u istom GLB-u — zaseban primitiv sa UV-ovima i praznim materijalom
   * (odluka 4, amandman). Materijal mu se gradi u kodu, recept je u Fazi E.
   */
  screenMeshName: string;
  /**
   * Slika koja ide na taj ekran. `/assets/screens/disciplines/<key>.webp`.
   * Do mojih slika ovde stoji generisan placeholder — zamena je JEDNA LINIJA po disciplini.
   */
  screenImage: string;
  modelPath: string;   // /assets/models/disciplines/<key>.glb
  stillPath: string;   // /assets/stills/disciplines/<key>.webp
  material: "anodized" | "steel";
  /** Pozicije instanci emissive akcenta, object space, posle normalizacije bbox-a. */
  accents: Vec3[];
  accentScale: number;
  /**
   * Vizuelna korekcija skale, default 1.0. Štimuje se na kontakt-listu iz Faze C.
   *
   * Normalizacija bbox-a na najdužu osu = 2.0 sprečava clipping i drži jednu kameru za
   * svih šest, ali NE izjednačava doživljaj veličine: tanak prsten i pun monolit iste
   * dužine ne nose istu vizuelnu težinu. Ovo je taj razmak, i vidi se tek kad se svih
   * šest stavi jedan pored drugog — zato se ne pogađa unapred.
   */
  displayScale: number;
  /** Ciljni broj trouglova. Plafon je 25.000 i njega proverava Faza B. */
  triBudget: number;
  /** EN izvor. Par VEĆ POSTOJI u lib/i18n.ts — ne dupliraj ga. */
  title: string;
  /** EN izvor. Par VEĆ POSTOJI. */
  kicker: string;
  /** EN izvor. NOV par, jedan po disciplini. */
  lede: string;
};

/** Redosled koraka. Index u ovom nizu je jedini redosled koji postoji. */
export const DISCIPLINE_ORDER = [
  "web-development",
  "ui-ux-design",
  "mobile-app-development",
  "seo-geo",
  "branding",
  "social-media",
] as const satisfies readonly DisciplineKey[];

export const disciplines: Record<DisciplineKey, Discipline> = { /* ... */ };
```

### Placeholder za ekrane — jedan za svih šest

Do mojih slika svih šest disciplina pokazuje **jedan isti generisan placeholder**: suptilan
gradijent sa mrežom, u tonu palete, bez teksta i bez logotipa. Jedan fajl, šest referenci.

Postoji da bi materijal ekrana i clearcoat sloj mogli da se štimuju pre nego što ijedna prava
slika postoji, i da bi se odmah videlo da je slika **iza stakla** a ne naslikana na njemu.

**Zamena mora da bude jedna linija po disciplini** — promeniš `screenImage` u
`constants/disciplines.ts` i ništa drugo. Ako zamena traži diranje materijala, geometrije,
UV-ova ili exporta, placeholder je pogrešno postavljen i to je bug, ne posao za kasnije.

`href` se **ne čuva u ovom fajlu** — izvodi se kao `` `/services/${key}` ``. Slug je već join
ključ između `navLinks.to`, foldera rute, `serviceDetails` i `ServiceFloatingKey`
(`.claude/rules/conventions.md:26`); upisan sedmi put bi bio samo sedmo mesto da se raziđe.

### Gde idu i18n parovi

Sajt je dvojezičan, izvorni jezik je **engleski**, srpski ide preko `englishToSerbianEntries`
u `lib/i18n.ts` (`DEFAULT_LOCALE = "sr"`). Prevod radi DOM walker nad celim tekstualnim
čvorom, pa string u kodu mora **doslovno** da odgovara levoj strani para.

**Dobra vest: šest naslova i šest kicker-a već imaju parove** (`lib/i18n.ts:45-57`,
blok `// Nav services`). Ne dupliraj ih — `title` i `kicker` u ugovoru podataka su tačno
te engleske strane.

Nov blok `// Home disciplines` ide **odmah posle** `// Home process`, na mesto gde sad stoje
parovi starog grida (`:174-179`), koje brišeš:

```
["Pick a discipline", "Izaberite disciplinu"],
["Six disciplines. One team.", "Šest disciplina. Jedan tim."],
["Each one is a full squad - strategy, design and engineering in the same room. Start where you need it most.",
 "Svaka je pun tim - strategija, dizajn i inženjering u istoj sobi. Počnite tamo gde je najpotrebnije."],
["See the discipline", "Pogledaj disciplinu"],

["Next.js, TypeScript and a build pipeline you can audit. Fast on the first paint, still fast in year two.",
 "Next.js, TypeScript i build pipeline koji možete da proverite. Brzo na prvom prikazu, brzo i druge godine."],
["Component systems and motion rules, not a folder of screens. Every state is designed before it is built.",
 "Komponentni sistemi i pravila pokreta, ne folder ekrana. Svako stanje je dizajnirano pre nego što se napravi."],
["One codebase, two stores, no compromise on feel. Shipped, reviewed and updated on your schedule.",
 "Jedna baza koda, dve prodavnice, bez kompromisa u osećaju. Objavljeno, odobreno i ažurirano po vašem rasporedu."],
["Technical SEO for crawlers and structured answers for AI search. Two audiences, one architecture.",
 "Tehnički SEO za pretraživače i strukturirani odgovori za AI pretragu. Dve publike, jedna arhitektura."],
["A mark, a voice and a system that holds up at 16 pixels and on a building. Documented so your team can use it.",
 "Znak, glas i sistem koji izdrži i na 16 piksela i na zgradi. Dokumentovano da vaš tim može da ga koristi."],
["Content that has a reason to exist. We plan the calendar, produce the assets and read the numbers.",
 "Sadržaj koji ima razlog da postoji. Planiramo kalendar, produciramo materijale i čitamo brojke."],
```

Crtice su obične `-`, ne en/em — `normalizeText` ih ionako svodi, ali ostatak tabele je tako pisan.

Rezervna varijanta lede-a, ako tražim promenu:

```
["Start where it hurts.", "Počnite tamo gde boli."]
```

---

## Faza A — Blender pilot (`web-development`)

Pilot je **`web-development`**: srednji budžet (~7k), bevel-ovano kućište iz Blendera, ekran
kao zaseban primitiv i instancirani akcent u kodu, dakle vežba **sve tri polovine pravila**
iz sekcije 3. Prvi je ključ u redosledu. **Ako pilot ne stane u 120 KB, svi ostali budžeti se
prekrajaju pre Faze C** — ne kreći u pet modela pre nego što znaš cenu jednog.

**Oblik pilota je promenjen, pipeline nije.** Raniji pilot (tri mašinske ploče sa kičmom kroz
njih) je odbačen **kao oblik**. Ostalo iz ove faze je nepromenjeno i već dokazano: redosled
rada, normalizacija bbox-a na `2.0`, AO bake u `COLOR_0` i export ugovor. Ne izvodi ih ponovo
i ne preispituj ih — menja se šta modeluješ, ne kako to isporučuješ.

**Jedan izuzetak: QA rig je prepravljen** i sada je zaključan u sekciji 3. Stari rig je bio
pravi razlog pada prvog pilota — forma se na njemu nije mogla suditi, pa je oblik prošao dalje
neproveren. Nov rig se koristi kakav jeste, sa dva prolaza, i **siluetni prolaz je od sada
kriterijum prijema**, ne ilustracija.

Silueta: **monitor tankog okvira na mašinskoj nozi, u blagom 3/4 zaokretu.** Iz Blendera idu
**dva mesh-a**: kućište sa nogom (telo) i ploča ekrana (zaseban primitiv sa UV-ovima i praznim
materijalom). Akcent nije geometrija u fajlu — to je `InstancedMesh` u kodu (Faza C, detalji tamo).

Radi ovim redom: blokovanje → bevel → weighted normals → AO bake u `COLOR_0` → provera
brojki → export. Ne peci AO pre nego što je bevel finalan, ponovićeš posao.

### Blender 5.1 — zamke koje te čekaju

Iz `blender/CLAUDE.md`, provereno u živoj sesiji. **Ne pogađaj imena property-ja, 5.1 je
preimenovao dosta toga; `search_api_docs` košta jedan poziv.**

- **Shade smooth je sada per-face bool atribut `sharp_face`**, ne operator koji možeš da
  pretpostaviš. To direktno utiče na weighted normals i na to kako se normale exportuju.
- `mesh.color_attributes` — za `COLOR_0` u glTF-u pazi na **domen i tip**. Proveri koju
  kombinaciju (`CORNER`/`POINT`, `BYTE_COLOR`/`FLOAT_COLOR`) glTF exporter zaista upisuje
  kao `COLOR_0`, pa tek onda peci šest puta.
- **AO bake mora u Non-Color.** Scena je na `view_transform = 'AgX'`
  (`blender/CLAUDE.md:14`). Ako AO prođe kroz view transform, zapekao si tone-mapovanu
  vrednost i model će u browseru biti previše svetao u udubljenjima. Colour space imena
  koja postoje: `sRGB`, `Non-Color`, `ACEScg`, `AgX Base sRGB`, `Linear Rec.709`, `scene_linear`.
- `bpy.ops.view3d.*` iz MCP-a pada na `poll() failed` — traži `context.temp_override`.
  `bpy.ops.mesh.primitive_*`, `object.mode_set`, `object.select_all` prolaze bez toga.
  **Prednost daj direktnom data API-ju** (`obj.location`, `bmesh`, `bpy.data.*.new`).
- Vrati Blender u zatečeno stanje: `object_mode`, aktivni objekat i selekciju zapamti pre,
  vrati posle. Ne snimaj preko `scenes/projekat.blend` bez pitanja.

### Definicija „gotovo" za Fazu A

1. Jedan `.glb` u `blender/exports/`, **dva mesh-a** (telo + ekran), **dva material slota**
   (materijal ekrana je prazan), **0 tekstura u fajlu**, 0 kamera
2. Atributi **tela** tačno `POSITION`, `NORMAL`, `COLOR_0` — ništa više, **bez `TEXCOORD_0`**.
   Atributi **ekrana** `POSITION`, `NORMAL`, `TEXCOORD_0`. **`TEXCOORD_0` je dozvoljen samo
   na primitivu ekrana** — ako ga ima na telu, export je pogrešan
3. ≤ 7.000 trouglova; prijavi tačan broj
4. Bbox centriran na `(0,0,0)`, najduža osa `2.0 ± 0.02`, Y-up (glTF konvencija)
5. **Clay prolaz QA rig-a** u `blender/renders/`: preko površina se vidi raspon vrednosti,
   a na svakoj zaobljenoj ivici tanka specular linija. Prijavi izmeren raspon, ne utisak
6. **SILUETA TEST — obavezan, i sam za sebe obara fazu.** Drugi prolaz QA rig-a, iz istog
   kadra: model kao puna crna forma na beloj pozadini, bez svetla, bez materijala i bez slike
   na ekranu. **Iz te slike se mora prepoznati da je u pitanju monitor.** Ako ne prođe, oblik
   je pao — vrati se na blocking i ne kreći u bevel, AO ni export. Nema bevela koji spašava
   siluetu, i nema slike na ekranu koja to nadoknađuje: ekran doprinosi nuli u ovom testu
7. Bez Draco-a, bez ekstenzija

---

## Faza B — Export pipeline

Pretvori ono što si ručno odradio u Fazi A u ponovljiv `blender/scripts/ops/export_discipline.py`
koji uzima **imena oba objekta (telo i ekran)** i ključ discipline i ispljune normalizovan `.glb`.
**Ugovor exporta je nepromenjen** — bbox se normalizuje nad **oba mesh-a zajedno**, kao nad
jednim objektom, inače ekran odleti van tela. Modul u `lib/` mora
biti bez side-effect-a na import; `bootstrap.py` briše `sys.modules` ključeve pri reload-u.

Ovde se rešava i kompresija. **`gltf-transform` nije instaliran** — vidi „Otvorena pitanja".
Prvo izmeri sirov export, pa onda traži alat, ne obrnuto.

U istoj fazi napravi i **jedan WebP still** iz istog kadra — to je fallback iz odluke 9 i
košta jedan render, a kasnije je šest posebnih poslova.

### Definicija „gotovo" za Fazu B

1. Tabela za pilot: `sirovo B → posle meshopt B → gzip B`, i izvedeno `B/trougao`
2. Skripta je idempotentna — dva uzastopna pokretanja daju bajt-identičan izlaz
3. `useGLTF` učitava rezultat u dev-u bez greške u konzoli. **Proveri da li drei registruje
   `MeshoptDecoder` po default-u** — `meshoptimizer` 1.1.1 već stoji u `node_modules`
   tranzitivno preko `three-stdlib`, ali to je dekoder na disku, ne dokaz da je uvezan. Javi mi šta si našao.
4. `COLOR_0` stvarno stiže do materijala: `geometry.getAttribute("color")` nije `undefined`,
   i vidljiv je kao potamnjenje u udubljenjima na `metalness 0.82`
5. **Ekran je preživeo export kao zaseban primitiv**: `nodes[screenMeshName]` postoji,
   `geometry.getAttribute("uv")` nije `undefined`, materijal u fajlu je prazan i **nula
   tekstura je u `.glb`-u**. Na telu `geometry.getAttribute("uv")` **jeste** `undefined`
6. Placeholder slika legne na taj ekran bez rastezanja i bez ogledala — UV-ovi su ispravni
7. Jedan `.webp` still ≤ 60 KB
8. `public/assets/models/disciplines/web-development.glb` na mestu

---

## Faza C — Preostalih pet modela

Ista skripta, isti budžeti, ista provera. Za svaki model: **šta je telo iz Blendera, šta je
primitiv ekrana, šta je u kodu.**

**Koncept je promenjen: umesto apstraktnih mašinskih formi, prepoznatljivi objekti sa ekranom
na koji ide moja slika.** Pipeline, QA rig, normalizacija bbox-a, AO bake i export ugovor su
nepromenjeni i dokazani — menja se samo šta modeluješ.

**Sve siluete i dalje dele isti jezik:** mašinski obrađen objekat, čita se iz jednog fiksnog
tročetvrtinskog ugla. Bez sitnih detalja koji nestaju na 400px, bez teksta i bez glifova
**u geometriji** — tekst i logotipi žive isključivo u slici ekrana, nikad u mesh-u.

**Silueta test ostaje obavezan kriterijum prijema.** Pravilo je nepromenjeno: popuni model
crnom bojom, pogledaj ga iz kadra iz sekcije 3 i moraš da prepoznaš o čemu je reč — bez boje,
bez materijala, bez slike na ekranu.

**Zašto ga ovi koncepti prolaze:** svih šest su objekti koji su u stvarnom svetu **definisani
sopstvenim obrisom**, a ne površinom. Monitor na nozi, telefon, tablet sa olovkom, tubus lupe,
bilbord na dve noge i lepeza story panela prepoznaju se kao crne mrlje — to su oblici koje
čovek čita iz dnevne upotrebe, ne iz detalja. Raniji apstraktni set je padao baš na tome:
tri ploče, tri okvira i tri prstena su iz siluete svi bili „neki mašinski komad". Ovi nisu
zamenljivi ni međusobno. Ekran doprinosi nuli u siluetnom testu — i to je namerno: **slika je
sadržaj, ne oblik.** Ako model ne prođe bez slike, model je pogrešan, a ne slika.

### `web-development` — ~7.000 trouglova, `anodized`

**Monitor tankog okvira na mašinskoj nozi, u blagom 3/4 zaokretu.** Okvir je tanak koliko
geometrija dozvoljava — debljina okvira je ono što ovaj objekat deli od stock rendera.

Telo iz Blendera: kućište monitora, tanak okvir, vrat i stopa noge. Bevel i weighted normals
nose ceo utisak, kao i do sada.
Primitiv ekrana: ploča ekrana, uvučena **iza** prednje ravni okvira, sa UV-ovima i praznim
materijalom. Uvlačenje nije stilska sitnica — ono je razlog zbog koga slika kasnije stoji iza
stakla a ne na njemu.
Kod: materijal ekrana (Faza E), plus `InstancedMesh` akcenta — nekoliko instanci sitnog
cilindra na stopi i na donjoj ivici okvira. **3 draw call-a.**

### `ui-ux-design` — ~9.000 trouglova, `steel`

**Tablet pod uglom na niskom podmetaču, i olovka zaustavljena usred poteza iznad njega.**
Olovka je zamrznuta u vazduhu, ne odložena — to je jedina naracija u celom setu i cela poenta
discipline: dizajn uhvaćen u radu.

Telo iz Blendera: tablet sa zaobljenim okvirom, kosi podmetač i olovka kao zaseban komad
istog mesh-a. Ugao olovke se pamti — mora da čita kao pokret iz kadra iz sekcije 3.
Primitiv ekrana: ploča tableta, uvučena iza okvira, UV-ovi, prazan materijal.
Kod: materijal ekrana, plus akcent — svetla tačka na vrhu olovke i tanka linija poteza.
**3 draw call-a. Transmission NE dobija** — preseljen je na `seo-geo`.

### `mobile-app-development` — ~8.000 trouglova, `anodized`

**Telefon uspravno, blago nakrivljen.** Najprostiji objekat od šest i to je u redu — telefon
se prepoznaje iz siluete brže nego bilo šta drugo, pa ceo budžet ide na okvir i zaobljenja.

Telo iz Blendera: kućište telefona, zaobljeni uglovi, tanak okvir, blago izdignut modul
kamere na leđima da profil ne bude gola pločica.
Primitiv ekrana: prednja ploča, uvučena iza okvira, UV-ovi, prazan materijal.
Kod: materijal ekrana, plus `InstancedMesh` akcenta — nekoliko status-tačaka duž ivice.
**3 draw call-a.**

### `seo-geo` — ~10.000 trouglova, `steel`

**Mašinski tubus sa nazubljenim hvatom i pravim staklenim sočivom.** Najskuplji model od šest
i jedini sa transmission-om na celoj sekciji — nazubljeni hvat sam pojede dobar deo trouglova.

Telo iz Blendera: tubus, nazubljeni prsten hvata, drška i obruč sočiva.
Primitiv ekrana: **ravna ploča ispod sočiva** — površina koja se posmatra. Slika ide na nju,
sočivo stoji iznad, pa se doslovno gleda **kroz** staklo u sliku. UV-ovi, prazan materijal.
Kod: materijal ekrana; sočivo kao `MeshPhysicalMaterial` sa `transmission` — **jedini
transmission element na sekciji i jedini razlog zbog koga ovaj model sme 4 draw call-a**;
plus `InstancedMesh` akcenta. Ispod 768px sočivo pada na neproziran `MAT_STEEL` i model se
vraća na 3 — transmission je najskuplji materijal u three.js-u.

**Planirani dodatak — logo čipovi. NE gradi sada.** Ispod tubusa, **kasnije i samo u kodu**,
četiri logo čipa: Google, ChatGPT, Gemini, Claude. Jedan **atlas 512×512** (≤ 30 KB) i jedan
`InstancedMesh` sa **per-instance UV offset-om** = **jedan draw call** za sva četiri. Nula
geometrije u GLB-u, nula promena u exportu — kad dođe red, čipovi se dodaju bez ponovnog
odlaska u Blender. Moja pretpostavka za budžet: kad slete, **čipovi preuzimaju slot cyan
akcenta** ovog modela (akcent se gasi), pa `seo-geo` ostaje na 4. Ako hoćeš i akcent i čipove,
to je peti call i granicu za ovaj model treba podići — javi mi.

### `branding` — ~6.000 trouglova, `anodized`

**Bilbord panel na dve noge, u blagoj perspektivi.** Najjednostavnija silueta od šest, i to
namerno: brend je znak koji stoji, ne mehanizam.

Telo iz Blendera: ram panela, dve noge i poprečna kosa potpora između njih. Bevel radi sav
posao, kao i ranije.
Primitiv ekrana: lice panela, uvučeno u ram, UV-ovi, prazan materijal.
Kod: materijal ekrana, plus `InstancedMesh` akcenta — sitna svetla duž gornje ivice rama.
**3 draw call-a. Ovaj model dokazuje novo pravilo od 3.**

### `social-media` — ~8.000 trouglova, `steel`

**Tri vertikalna 9:16 story panela u plitkoj lepezi na mašinskoj bazi**, plus sitni reakcijski
čipovi. Lepeza je plitka namerno — tri panela moraju da se čitaju kao tri, ne kao jedan
zaklonjen drugim.

Telo iz Blendera: mašinska baza sa tri ležišta pod uglom i tanki ramovi panela.
Primitiv ekrana: **jedan** 9:16 panel sa UV-ovima i praznim materijalom. Iz njega u kodu
nastaju sva tri.
Kod: **tri panela su jedan `InstancedMesh` sa per-instance UV offset-om preko jednog atlasa
= jedan draw call**, ne tri mesh-a i ne tri teksture. Plus `InstancedMesh` reakcijskih čipova
kao akcent. **3 draw call-a** — baza + paneli + čipovi.

### Definicija „gotovo" za Fazu C

1. Šest `.glb` fajlova u `public/assets/models/disciplines/`
2. Tabela sa šest redova: `trouglovi | B posle meshopt | B/trougao`. **Nijedan red preko
   25.000 ili 120 KB. Zbir kolone ispod 700 KB.**
3. **Svih šest ima primitiv ekrana**: `nodes[screenMeshName]` postoji, ima `uv`, materijal je
   prazan, **nula tekstura u svih šest `.glb`-ova**. Nijedno telo nema `uv`
4. **SILUETA TEST — obavezan, i sam za sebe obara fazu.** Kontakt-lista sa svih šest, svaki
   kroz **drugi prolaz QA rig-a** (`render_silhouette`, sekcija 3) — puna crna forma na belom,
   iz istog kadra, bez materijala i bez slike na ekranu. Svih šest mora da se prepozna i
   **nijedna dva ne smeju da se pomešaju**. Model koji padne vraća se na blocking; ne
   bevel-uje se, ne peče se AO i ne exportuje se dok ne prođe. Ovo je kriterijum prijema,
   ne utisak. Uz siluetnu ide i **clay kontakt-lista iz istog rig-a** — forma se sudi na
   sivom clay-u na 1024px, nikad na thumbnail-u
5. Šest WebP still-ova
6. Svih šest iz iste kamere, bez per-model podešavanja — dokaži jednim kontakt-listom
7. Šest redova u `constants/disciplines.ts` prolazi TypeScript bez `as`
8. **Druga kontakt-lista, posle podešenog `displayScale`** — svih šest jedan pored drugog,
   iste kamere. Nijedan model ne sme da deluje sitno ili da guši ostale. Pošalji mi obe
   liste, pre i posle, i šest vrednosti koje si upisao.

---

## Faza D — Ulazni motor na placeholder kockama

**Ovu fazu možeš da radiš paralelno sa A-C.** Ne čeka nijedan GLB — dok modeli ne postoje,
u sceni stoji `<boxGeometry>` sa brojem discipline. To je pola posla koje se ne blokira Blenderom.

### Mehanizam — sekcija se ne pinuje

Sekcija je običan blok u toku strane. **Nema pin-a, nema snap-a, nema pin-spacer-a, nema
ScrollTrigger instance.** Stranica skroluje pored nje kao pored bilo koje druge sekcije, a
scroll pozicija ne određuje index — nikad, ni na jednoj širini.

Index se menja iz tačno tri ulaza:

1. **Kursor nad 3D kolonom + točkić miša.**
2. **Klik na strelicu ili na tačku.**
3. **Tastatura dok je 3D kolona fokusirana.**

Na dodiru dolazi četvrti, i samo tamo: **horizontalni swipe preko modela.**

Kursor bilo gde drugde na sekciji — naslov, kicker, lede, CTA, prazan prostor pored
kolone — i scroll ide ka footeru. Ništa se ne presreće, jer se ništa i ne sluša tamo.

`index` je jedini izvor istine i živi u `Disciplines.tsx` kao React state. Sve što se dešava
između dve promene indeksa (točkić koji još nije napunio bafer, cooldown, pointer parallax)
ide kroz **refove**, nikad kroz state — React se re-renderuje isključivo na promenu indeksa.

### Capture — gde i pod kojim uslovom

- `pointerenter` / `pointerleave` idu na **kontejner 3D kolone**, ne na celu sekciju. Sekcija
  je široka i visoka; kolona je tačno ono što korisnik misli da je „model".
- Capture postoji **samo uz `(pointer: fine)` i `(min-width: 768px)`**. Na dodiru nikad —
  tamo je vertikalni gest skrol strane i ostaje skrol strane.
- `wheel` listener ide na sam element kolone, sa **`{ passive: false }`** — bez toga
  `preventDefault()` ne radi ništa i browser ispisuje upozorenje.
- **`preventDefault()` + `stopPropagation()` SAMO kad deltu stvarno trošimo.** Trošimo je i
  kad korak ne pukne zbog cooldown-a ili nedovoljnog bafera — delta je pojedena, dakle
  presretnuta. Ne trošimo je kad smo na kraju liste u smeru gesta (vidi ispod) i kad je gest
  horizontalan (`deltaY === 0`).

**Lenis.** Naš listener stoji na elementu, Lenis-ov na `window`-u, pa naš puca prvi u fazi
bubblinga. `stopPropagation()` je zato dovoljan da event nikad ne stigne do Lenis-a, a Lenis
ostaje živ za sve ostalo — tastaturu, skrol iznad i ispod sekcije, `scrollTo` iz navigacije.
`lenis.stop()` na `pointerenter` je **fallback, ne prvi potez**: uzima se tek ako se izmeri da
strana i dalje beži, i tada obavezno sa `lenis.start()` na `pointerleave` i na unmount.
`useSmoothScroll()` je dvostruko opciono (hook može biti `null`, `.current` može biti `null`),
a pod reduced-motion Lenis ne postoji uopšte — nijedna grana ne sme da zavisi od njega.

### Otpuštanje na krajevima — bez ovoga se korisnik zaglavi

**Ovo je najvažnije pravilo cele faze.**

Na **indeksu 0 sa gestom nagore** i na **indeksu 5 sa gestom nadole** ne zovemo
`preventDefault()` i ne zovemo `stopPropagation()`. Event prolazi, Lenis ga dobija, stranica
skroluje. **Odmah, bez odlaganja**, bez „još jednog koraka da bude sigurno" i bez čekanja da
istekne cooldown — provera kraja ide **pre** provere cooldown-a i pre akumulacije. Bafer se
pritom nulira, da promena smera kreće od nule umesto od nagomilane delte.

Posledica koja se traži: korisnik koji **namerno** drži kursor nad modelom kroz ceo skrol
strane potroši pet koraka, stigne do indeksa 5 i odatle skroluje do footera bez i jednog
presretnutog eventa.

### Akumulacija

- Sabiraj normalizovanu `deltaY` u bafer. `|bafer| > 120` → **jedan korak**, bafer na 0.
- **Cooldown 450 ms** između koraka. Dok traje, delta se troši ali se ne akumulira — tako
  rep trackpad flick-a nema šta da napuni i jedan zamah ne prolazi kroz dva modela.
- **200 ms bez ijednog eventa → bafer na 0.** Dva odvojena, spora gesta se ne sabiraju.
- **`deltaMode` se normalizuje pre svega ostalog:**
  `DOM_DELTA_LINE` (1) × 16, `DOM_DELTA_PAGE` (2) × visina viewporta, `DOM_DELTA_PIXEL` (0)
  kakva jeste. **Firefox šalje LINE**, gde je `deltaY` reda veličine 3, a Chrome PIXEL, gde je
  reda veličine 100. Bez ove normalizacije prag od 120 znači dve potpuno različite stvari u
  dva browsera.

### Stepper

Strelica **iznad** kolone i strelica **ispod** nje, tačke između njih. Ispod `lg` se ceo
stepper okreće u horizontalu i seli ispod canvasa — smisao ostaje „prethodni i sledeći".

- Pravi `<button>`-i sa `aria-label`, nikad divovi.
- Klik = **tačno jedan korak**. **`disabled` na krajevima, bez wrap-a** — sa indeksa 5 se ne
  ide na 0.
- Tačke nose `aria-current` na aktivnoj i vode direktno na svoj index.
- 3D kolona ima `tabIndex={0}` i sluša **`ArrowUp`/`ArrowDown`** i **`Home`/`End`** —
  točkić ne sme da bude jedini ulaz. Krajevi se poštuju i ovde.
- **Afordansa:** na **prvi** `pointerenter` nad kolonom strelice pulsiraju **jednom**, pa
  nikad više u toj sesiji komponente. Pulsira se preko klase koju postavlja ref, ne preko
  state-a — jedan re-render bi prošao nezapaženo, ali pravilo „nula re-rendera između promena
  indeksa" mora da važi doslovno da bi se moglo izmeriti.

### Mobilni

**Bez wheel capture-a i bez ijednog presretanja vertikalnog dodira.** Vertikalni gest na
telefonu je skrol strane; svako mešanje u njega je tačno onaj sudar koji ova revizija uklanja.

Ostaje: strelice, tačke, i **horizontalni swipe preko modela** — prag **40 px**, i samo ako je
`|dx| > |dy| × 1.5`. Swipe ulevo je sledeći, udesno prethodni, krajevi se poštuju.
Kolona nosi `touch-action: pan-y pinch-zoom`, pa vertikalni skrol i zumiranje idu browseru
netaknuti, a horizontalni pomeraj stiže nama.

Layout ispod `768px`: jedna kolona, canvas gore, **stepper horizontalno ispod canvasa**, tekst
ispod steppera. Tekst ide ispod, ne preko — preko bi tražilo scrim, scrim bi pojeo model.
Prelom je čist CSS (Tailwind `lg:`), bez `useState` na resize i bez JS breakpoint-a: nema
pina koji bi trebalo ponovo graditi na promenu orijentacije, pa nema ni razloga za JS.

### Sadržaj

Naslov, kicker, lede i CTA dolaze iz `constants/disciplines.ts` i menjaju se **sinhrono sa
modelom**. `href` je `/services/${key}`, izveden, ne upisan. Tabela prelaza iz Faze E važi i
ukupan swap je **1,36 s**.

Svih šest panela je u DOM-u sve vreme, složeni jedan preko drugog u istoj grid ćeliji, pa
najviši od njih drži visinu i panel ne poskakuje pri promeni. Neaktivni: `opacity: 0` +
`pointer-events: none` + `inert`. Nikad `display:none`, `visibility:hidden`, uslovni mount ni
`autoAlpha` (odluka 9).

### Tekst reveal — na svaki dolazak, i na povratak

Naslov stiže **po reči**, isto kao svaki naslov na sajtu, i to **svaki put** — na svaki korak,
i kad se vratiš na disciplinu koju si već video. To je razlika u odnosu na globalni
kontroler: on element otkrije **jednom** i završi s njim, a ovde je kopija nova pri svakom
koraku jer je i model iza nje nov.

- Panel nosi `data-reveal="off"` i vozi svoj reveal. `data-reveal='off'` je u `skipSelector`,
  pa je panel ujedno izuzet i iz CSS pravila koje skriva kopiju pre prvog paint-a — nema
  duplog vlasništva nad neprozirnošću.
- Splitter je **`splitWords`/`restoreWords` iz `lib/textReveal.ts`**, nikad lokalni: ugovor sa
  `LanguageProvider`-om (pomeri tekstualni čvor, nosi `data-no-translate` dok je razdvojen,
  vrati ga pre nego što walker prođe) mora da važi svuda ili prevod uhvati pola rečenice.
- **Vraćanje ide odmah po završetku dolaska**, ne kad panel ode. Razdvojen element nosi
  `data-no-translate`, a kopija koja ostane razdvojena je kopija do koje promena jezika ne
  može da dođe. Uz to, efekat na `locale` vraća reči i usred animacije.
- **Nigde `autoAlpha`**, ni na panelu ni na `span`-ovima reči — `autoAlpha` piše
  `visibility: hidden`, što je tačno ono što obara SEO argument. Sve je obična `opacity`.
- Prvi panel čeka `IntersectionObserver` sa istim `enterRatio` (15%) koji koristi globalni
  kontroler. Bez toga bi odigrao i završio dok je sekcija još metar ispod fold-a, pa bi
  posetilac stigao na kopiju koja je već sletela.
- Offseti su iz tabele prelaza Faze E, mereni od promene indeksa (dakle od trenutka kad reel
  krene): **naslov 0,60 s po reči, kicker 0,78 s, lede + CTA 0,88 s**. Kraj u 1,14 s, unutar
  swap prozora od 1,36 s. Stagger naslova je ograničen na **0,25 s ukupno**, pa naslov od tri
  i naslov od pet reči sleću u istom trenutku — i na srpskom i na engleskom.

U sceni: **index 0 je pravi monitor iz Faze A**, indeksi 1-5 su `<boxGeometry>` kocke sa
brojem discipline dok Faza C ne isporuči preostalih pet GLB-ova. Ivica kocke je `2/√3`, da
joj je **telesna dijagonala tačno 2.0** — ista brojka na koju export normalizuje svaki pravi
model, pa placeholder i gotov monitor stoje u istoj težinskoj klasi na istoj kameri.

### Prelaz modela — vertikalni reel

Šest modela visi na **jednoj vertikalnoj traci, sa razmakom između njih**, i korak pomera
traku. Skrol nadole: model koji je na ekranu **klizi NAGORE** i izlazi iz kadra, a odozdo
**nagore ulazi sledeći** na njegovo mesto. Skrol nagore je isti pokret u suprotnom smeru —
zato prelaz unazad nikad ne izgleda kao premotavanje prelaza unapred.

- U sceni su **najviše dva modela**, i to samo dok se traka kreće (odluka 3).
- Odlazeći stoji u koordinatnom početku trake, ulazni je **jedan slot** dalje u smeru iz
  kog dolazi, i **jedan tween nad trakom nosi oba**. Zato ovde stoji jedno trajanje i jedan
  easing, a ne izlazna pa ulazna kriva: to je jedan pokret, ne dva koja se preklapaju.
- `MODEL_SLOT_GAP = 0.9`, `MODEL_SLOT_SPAN = 2 + gap = 2.9` — bbox je normalizovan na 2.0,
  pa je razmak čist vazduh. Na `fov 30` i r ≈ 4.44 vidljiva visina je ~2.38, dakle odlazeći
  model je van kadra pre nego što je ulazni na pola puta.
- Trajanje i easing su **red „ulaz model" iz tabele prelaza Faze E**: **0,80 s, `power3.out`**.
  Reel jeste ulaz — oko prati model koji stiže, a usporavajuća kriva je ono što ga spušta na
  mesto umesto da ga zaustavi.
- Korak koji stigne usred klizanja uzima onaj koji je ulazio kao svoj odlazeći, pa traka
  nikad ne drži tri modela.
- `kill()` na cleanup-u, **ne `ctx.revert()`**: revert bi vratio traku tamo gde je tween
  počeo, što za završeno klizanje znači vratiti model van ekrana.

**Cleanup** po `.claude/rules/patterns.md`: `gsap.context()` + `ctx.revert()`, ciljanje dece
preko klasa (`.discipline-panel`, `.discipline-dot`), nikad preko stale refova. Svaki
listener koji je dodat — `wheel`, `pointerenter`, `pointerleave`, `pointerdown`, `pointerup`,
`pointercancel`, `keydown` — skida se na unmount.

### Definicija „gotovo" za Fazu D

1. Kursor nad naslovom, lede-om ili CTA-om → skrol ide ka footeru, index se ne menja
2. Kursor nad modelom → točkić menja model, strana stoji
3. **Kursor NAMERNO nad modelom kroz ceo skrol strane → korisnik stigne do footera bez
   zaglavljivanja.** Snimi ovo — to je jedina provera koja hvata pokvareno otpuštanje na
   krajevima
4. Trackpad flick ne prolazi kroz više od jednog modela
5. Firefox = Chrome — `deltaMode` normalizovan, isti broj gestova za isti put
6. Strelice, tačke i tastatura rade i poštuju krajeve; `disabled` na 0 nagore i na 5 nadole
7. Mobilni: strelice i tačke rade, horizontalni swipe radi, **vertikalni skrol netaknut**
8. Nula re-rendera između promena indeksa — dokaži React DevTools Profiler-om
9. `next build --turbopack` prolazi, `eslint` čist, nula grešaka i upozorenja u konzoli
10. Svi listeneri skinuti na unmount, `gsap.context()` + `ctx.revert()`
11. Šest placeholder kocki sa brojevima na indeksima 1-5, pravi monitor na 0
12. Reduced-motion: sekcija je obična vertikalna lista od šest, `<Canvas>` se ne montira
13. Reel klizi vertikalno u oba smera, najviše dva modela u sceni i samo dok traje klizanje;
    posle više punih krugova `renderer.info.memory` se ne pomera
14. Naslov se otkriva po reči **na svaki dolazak**, uključujući povratak na već viđenu
    disciplinu; posle šetnje kroz svih šest i nazad nema zaostalih `.reveal-word` span-ova
    ni zaostalog `data-no-translate`

---

## Faza E — Spajanje i art direction

### Tabela prelaza

Brojevi dolaze iz `motion-design`, nisu izmišljeni. Izvod: ličnost je **Premium**
(0% overshoot), „dramatic reveal" je 600-1200 ms, materijal je **Rigid/metal** pa nosi
**skalu 1,2×**, izlaz je **65-75%** ulaza, preklop izlaz↔ulaz **100-150 ms**, ukupan
stagger **ispod 500 ms**.

| Faza | Element | Start (s) | Trajanje (s) | Easing | Property |
|---|---|---|---|---|---|
| izlaz | stepper tačka | 0,00 | 0,28 | `power2.out` | width, opacity |
| izlaz | tekst panela | 0,00 | 0,20 | `power2.in` | opacity 1→0, y 0→−12 |
| izlaz | model | 0,05 | 0,55 | `power2.in` | scale 1→0,88 · rotY −0,35 rad · opacity 1→0 |
| ulaz | model | 0,48 | 0,80 | `power3.out` | scale 0,92→1 · rotY +0,5→0 · opacity 0→1 |
| ulaz | emissive akcent | 0,72 | 0,50 | `power2.out` | `emissiveIntensity` 0→1,0 |
| ulaz | naslov, po reči | 0,60 | 0,46 | `power3.out` | opacity · blur 8→0 · yPercent 22→0 · stagger 0,05 `from:"random"` |
| ulaz | kicker, po reči | 0,78 | 0,32 | `power3.out` | opacity · blur 5→0 · yPercent 16→0 · stagger 0,04 `from:"random"` (plafon 0,14) |
| ulaz | lede, po reči | 0,88 | 0,30 | `power3.out` | opacity · blur 6→0 · yPercent 14→0 · stagger 0,028 `from:"random"` (plafon 0,22) |
| ulaz | CTA | 0,94 | 0,30 | `power2.out` | opacity · y 12→0 |
| ambient | rotacija u mirovanju | — | 24 s / obrt | `none` | rotY, kontinuirano |
| ambient | plutanje | — | 6,5 s | `sine.inOut` | y ±0,04 |

**Provere koje ova tabela prolazi:** ukupan swap **1,40 s** — lede je poslednji i on ga meri
(0,88 + 0,22 + 0,30), i dalje ispod plafona (1200 ms × 1,2 = 1440 ms ✓); izlaz modela 0,55 /
ulaz 0,80 = **69%** ✓; preklop izlaz↔ulaz **0,12 s** ✓; stagger naslova 0,05 × ~5 reči =
**0,25 s**, ispod 500 ms ✓; nigde overshoot ✓.

**Zašto kicker i lede idu po reči, a CTA ne.** Reveal po reči je *jedini* način na koji tekst
stiže na ovaj sajt (`.claude/skills/text-reveal`), pa panel u kojem se samo naslov sklapa iz
reči čita kao dva različita sajta. CTA ostaje blok jer je kontrola, a kontrola koja se sklapa
iz reči čita kao tekst. Razlika između tri linije je **širina staggera i dubina blura**, ne
vrsta pokreta — naslov najširi, kicker najuži, lede između.

**Dva reda o modelu su u Fazi D već potrošena — i to namerno.** Prelaz modela je
**vertikalni reel** (Faza D, „Prelaz modela"), dakle jedan tween nad trakom koja nosi oba
modela, na **0,80 s / `power3.out`** — brojevima reda „ulaz model". Redovi „izlaz model" i
„ulaz model" se zato **ne implementiraju kao dva odvojena tween-a**: nema odlaska koji bi
skalirao i rotirao odvojeno od dolaska, ima jednog pokreta. Ostatak tabele — tačka, tekst,
akcent — ostaje kakav jeste i vezuje se za početak tog istog klizanja.

Sve ovo živi u `disciplinesTiming.ts` kao imenovane konstante, po obrascu `heroTiming.ts` —
lokalne vrednosti se **izvode** iz njih, ne prepisuju. Stagger reči reši tako da poslednja
reč uvek sleće na isti trenutak bez obzira na broj reči i jezik; `HeroContent.tsx:64-67` je
gotovo rešenje.

**Redovi za tekst su već implementirani u Fazi D** („Tekst reveal", tamo), zajedno sa
pravilom da se reveal ponavlja na svaki dolazak. Ostaje samo stepper tačka.

**Reveal naslova po reči** koristi `splitWords`/`restoreWords` iz `lib/textReveal.ts`, ne
lokalni splitter — inače pada ugovor sa `LanguageProvider`-om (pomeri tekstualni čvor, nosi
`data-no-translate` dok je razdvojen, vrati ga pre nego što walker prođe). Panel nosi
`data-reveal="off"` jer sam upravlja svojom neprozirnošću, isto kao hero i `ProcessCard`.

**Ko vozi vreme.** Swap je GSAP timeline (diskretan događaj, ne scrubbed). Ambient rotacija
i plutanje su `useFrame`. To su dva različita posla, ali **nikad ne diraju istu vrednost** —
timeline piše `scale`/`opacity`/`emissiveIntensity`, `useFrame` piše `rotation.y` i `position.y`.
Dokumentuj tu podelu u komentaru; ako ikada oboje počnu da pišu isti property, imaš dva
schedulera nad jednom vrednošću i trzanje koje se ne debug-uje lako.

**Pointer parallax:** ±0,06 rad na rotY/rotX, lerp 0,06, **samo na `(pointer: fine)`**, petlja
staje čim se kursor smiri. Sirovi `window` listener, ne R3F event
(`.claude/rules/patterns.md`), i bez raycast-a — ništa se ne bira klikom u sceni.

### Učitavanje — dva pravila koja se lako promaše

**1. Prvi model se preload-uje pre nego što sekcija uđe u kadar.** `useGLTF.preload()` za
index 0 okida `IntersectionObserver` sa **`rootMargin: "150%"`**, ne mount komponente.
Posetilac koji brzo skroluje ne sme da zatekne praznu kutiju —
150% viewporta unapred je otprilike jedan ekran skrola vremena za 90 KB.
Susedi (`index ± 1`) idu i dalje na `requestIdleCallback`, po odluci 3.

**2. `<Suspense>` granica ide PO MODELU, ne oko cele scene.** Jedna granica oko `<Canvas>`
sadržaja znači da nespreman model koji ulazi suspenduje celo podstablo — a u tom podstablu
je i **odlazeći model, koji tada nestane umesto da odigra izlaz**. Prelaz se pretvori u
treptaj. Svaki `<DisciplineModel>` nosi svoj `<Suspense>`, sa fallback-om koji nije `null`
nego zadržava mesto (`.claude/rules/patterns.md`).

### Materijal ekrana — recept, ne predlog

Ekran je jedini primitiv na sekciji koji nosi sliku. Materijal mu se gradi **isključivo u kodu**
(odluka 4, amandman), po ovom receptu, doslovno:

| Property | Vrednost | Zašto |
|---|---|---|
| `map` | slika (`screenImage` iz ugovora podataka) | sam sadržaj displeja |
| `emissiveMap` | **ista slika**, na **niskom intenzitetu** | displej se sam svetli; bez toga je to nalepnica koja čeka da je neko osvetli |
| `roughness` | **~0.15** | glatka staklena površina, ali ne ogledalo |
| `clearcoat` | **1.0** | stakleni sloj **preko** slike |
| `clearcoatRoughness` | **0.05** | taj sloj hvata environment kao oštar odsjaj |
| `colorSpace` | **`SRGBColorSpace`** | slika je sRGB; bez ovoga su boje isprane ili prepečene |

`emissiveMap` ide uz `emissive` postavljen na neutralno svetlo i **nizak** `emissiveIntensity` —
displej treba da se odvoji od kućišta, ne da postane lampa. Vrednost intenziteta ide u
`disciplinesTiming.ts`/`materials.ts` kao imenovana konstanta, ne kao broj u JSX-u.

**Eksplicitno, i ovo je najvažnija rečenica u podsekciji:**

> **Ekran NIKAD nije `MeshBasicMaterial`, niti gola `map` na standardnom materijalu.**
> Bez clearcoat sloja slika izgleda **naslikana na plastiku**, i ceo utisak uređaja pada.

Clearcoat je ono što razdvaja „slika je iza stakla" od „slika je odštampana na kućištu".
To je razlika koju gledalac ne ume da imenuje ali je vidi odmah, i zbog nje primitiv ekrana
stoji **uvučen iza prednje ravni okvira** na svih šest modela (Faza C).

Isti materijal deli svih šest — razlikuju se samo po `map`/`emissiveMap` teksturi, pa je to
**jedan materijal sa šest tekstura**, ne šest materijala. Teksture se učitavaju po prefetch
pravilu iz sekcije „Budžeti": aktivna plus dve susedne.

**Ovaj materijal stoji van tri iz „Materijalnog jezika".** Ona tri (`MAT_ANODIZED`, `MAT_STEEL`,
`MAT_EMISSIVE`) opisuju **kućište** i nepromenjena su. Ekran je staklo sa slikom — druga vrsta
površine, jedan dodatni deljeni materijal, i on ne otvara vrata četvrtoj koži metala.

### Environment se gradi u kodu

Bez `.hdr` fajla, po odluci 7.

1. Nacrtaj 256×128 equirect na `<canvas>`: vertikalni gradijent, plus dva-tri zamućena
   radijalna „emisiona quad-a" — key gore-levo, hladan fill desno, cyan kicker dole-levo.
2. `CanvasTexture` → `PMREMGenerator.fromEquirectangular()` → `scene.environment`.
3. **Odmah dispose-uj generator i izvornu teksturu**, zadrži samo render target.
4. Gradi se **jednom po temi**. Promena teme rebuild-uje; ništa drugo ne sme.

Boje čitaj iz CSS varijabli **van `<Canvas>`-a** i prosledi kao props. `--surface-section`,
`--primary` i `--background` postoje u sve tri palete (`:root` je light, `.dark` je dark,
`html[data-mood="alt"]` je treći), pa se light/dark inverzija materijala dobija bez ijedne
grane u JSX-u.

`toneMapping` postavi eksplicitno i dokumentuj izbor, kao u `HeroCube.tsx:290-293`.

### Post

`@react-three/postprocessing` **nije instaliran** — vidi „Otvorena pitanja", tačka 1.
Do odgovora radi **bez posta**. Prvo izmeri ms po frejmu bez, pa onda sa, pa mi javi obe brojke.
Ni u jednoj varijanti nema SSAO (AO je zapečen) ni DOF-a.

### Definicija „gotovo" za Fazu E

1. Šest modela zamenjuju placeholder kocke, prelaz je jedan potez a ne dva odvojena
2. Tabela prelaza je implementirana i vidi se u `disciplinesTiming.ts` kao konstante
3. Prelaz nazad (skrol nagore) izgleda isto kao unapred, ne kao reverse
4. Skok od 3 panela — moguć samo klikom na tačku — ne igra 3 prelaza; dokaži screen recording-om
5. Obe teme: model se čita na `#f4f7fb` i na `#070d19`, cyan akcent živ u obe
6. Ambient rotacija nema vidljiv šav pri obrtu
7. `renderer.info.render.calls` **≤ 3 u mirovanju** (`seo-geo` 4), **≤ 6 u swap prozoru** —
   prijavi obe brojke
8. **Tajming nije zaključan dok mi ne pošalješ poređenje.** Snimi isti prelaz na **1,36 s**
   i na **0,75× toga (1,02 s)**, side-by-side, i javi mi koji je bolji. Tabela iz ove faze je
   izvedena iz `motion-design`, ali ona ne zna da cooldown od 450 ms drži model u mirovanju
   između koraka — možda ima prostora za sporije, možda je 1,36 s presporo kad model ionako
   stoji dok korisnik ne zatraži sledeći. Ja odlučujem.
9. Ulazak u kadar sa brzim skrolom odozgo ne pokazuje praznu kutiju — `rootMargin: "150%"` radi
10. Odlazeći model odigra ceo izlaz i kad model koji ulazi još nije učitan — dokaz da je
    `<Suspense>` po modelu, a ne oko scene

---

## Faza F — Perf, a11y, SEO, fallback

### SEO — tekst svih šest je u DOM-u, uvek

Neaktivni paneli: `opacity: 0` + `pointer-events: none` + **`inert`**.

**Zabranjeno:** `display: none`, uslovni mount, `visibility: hidden`, i **GSAP `autoAlpha`** —
`autoAlpha` postavlja `visibility: hidden`, što je tačno ono što ne smemo za tekst koji
prodaje SEO. Koristi običan `opacity`. Ovo je jedina razlika u odnosu na hero, i namerna je.

`inert` skida panel sa tab reda i iz accessibility stabla, a ostavlja ga u DOM-u — crawler
čita DOM, screen reader ne dobija šest preklopljenih panela. To je tačan alat za tačan posao.

Dodatno: `ItemList` JSON-LD sa svih šest, `<Script type="application/ld+json">` na dnu sekcije.
Obrazac već postoji na service stranicama (`.claude/rules/patterns.md`).

Svaki CTA je pravi `<Link href={`/services/${key}`}>` kroz `components/ui/cta-button.tsx`,
sa `aria-label` koji nosi naziv discipline — jer je vidljivi tekst na svih šest isti.

### a11y

- Stepper: `aria-current` na aktivnoj tački, roving `tabindex`, `ArrowUp`/`ArrowDown` i
  `ArrowLeft`/`ArrowRight`, `Home`/`End` na prvi i poslednji.
- Strelice su pravi `<button>` sa `aria-label`, ne divovi.
- Canvas nosi `role="img"` sa `aria-label` koji se menja sa modelom — `HeroCube.tsx:302-307`
  je gotov obrazac.
- Fokus na 3D koloni ne sme da pomeri stranu; `tabIndex={0}` je tu zbog tastature, a
  `outline` ostaje vidljiv.

### Fallback-ovi

| Uslov | Šta se dešava |
|---|---|
| `usePrefersReducedMotion()` | sekcija je obična vertikalna lista od šest; `<Canvas>` se ne montira, wheel capture se ne postavlja |
| Save-Data / slaba baterija | isto — pokriveno istim hook-om, ne piši drugi detektor |
| WebGL nedostupan | `<Canvas>` se ne montira, na njegovo mesto ide WebP still; **detektor ne postoji u repou, pišeš ga** |
| `<768px` | 3D **ostaje**; `dpr [1, 1.5]`, bez posta, bez transmission-a, instance /2; bez wheel capture-a |
| sekcija van ekrana ili `document.hidden` | `frameloop={active ? "always" : "never"}`, gde je `active` presek `useIntersectionActive` i `!document.hidden` |

Fallback nikad nije crn canvas. Kutija canvasa je rezervisana kroz `aspect-ratio` pre nego
što se išta učita, da učitavanje modela ne pomeri sadržaj ispod sebe.

### Definicija „gotovo" za Fazu F

1. `view-source` sadrži svih šest naslova, kicker-a i lede-ova — proveri u produkcionom buildu
2. Tab kroz sekciju dodiruje samo aktivni panel i stepper
3. Screen reader ne čita neaktivne panele
4. `ItemList` prolazi Rich Results Test
5. Sa `prefers-reduced-motion: reduce` sekcija je upotrebljiva lista, bez canvasa
6. Sa ugašenim WebGL-om (Chrome flag) sekcija radi i pokazuje still

---

## Definicija „gotovo" — cela sekcija

1. Šest GLB-ova: **≤ 25.000 trouglova i ≤ 120 KB svaki, ≤ 700 KB ukupno** — prijavi tabelu
2. Šest slika ekrana: **≤ 100 KB svaka, ≤ 600 KB ukupno**, odvojeno od budžeta GLB-ova;
   u memoriji nikad više od tri (aktivna + dve susedne) — prijavi tabelu
3. **≤ 3 draw call-a po modelu** u mirovanju — telo + ekran + akcent (`seo-geo` 4),
   **≤ 6 u swap prozoru** — prijavi `renderer.info.render.calls`
4. **Ekran je clearcoat recept iz Faze E** — nigde `MeshBasicMaterial`, nigde gola `map`;
   slika čita kao da stoji iza stakla, ne kao da je odštampana na kućištu
5. **60 fps na mid-range laptopu**, uz 4× CPU throttle u DevTools — prijavi brojku
6. **≥ 45 fps na mid-range Androidu** — prijavi brojku i uređaj
7. `dpr` `[1, 1.75]` desktop, `[1, 1.5]` ispod 768px
8. Prelaz traje vrednost zaključanu u `disciplinesTiming.ts` posle poređenja iz Faze E
   (1,36 s ili 1,02 s) i ne pravi thrash pri brzom nizu koraka
9. Tekst svih šest disciplina u DOM-u u produkcionom buildu; nula `display:none` i nula
   `visibility:hidden` na tim panelima
10. Šest CTA-ova su pravi `<Link>`-ovi ka `/services/<key>`
11. Stepper radi mišem i tastaturom, poštuje krajeve, bez wrap-a; `aria-current` tačan
    (a na dodiru radi i horizontalni swipe preko modela)
12. Zamena placeholder slike pravom je **jedna linija po disciplini** u `constants/disciplines.ts`
13. `next build --turbopack` prolazi, `eslint` čist, TypeScript bez grešaka
14. Obe teme provereno; `data-mood="alt"` ne lomi sekciju
15. Chrome, Firefox, Safari uključujući iOS Safari
16. Nula grešaka i upozorenja u konzoli
17. Nema curenja memorije posle mount → unmount → mount — proveri `renderer.info.memory`
18. Nema CLS-a: kutija canvasa rezervisana pre učitavanja
19. Stari grid uklonjen: `app/_components/ServiceCards.tsx`, parovi na `lib/i18n.ts:174-179`,
    `#timeline-end-sentinel` na `Timeline.tsx:97` — **zaseban commit, povratan `revert`-om**,
    posle njega build i lint i dalje prolaze

---

## Otvorena pitanja — odgovori mi pre Faze E

Ne pretpostavljaj nijedno od ovoga.

**1. `@react-three/postprocessing` nije instaliran, a odluka 8 traži Bloom + Vignette + zrno.**
Tri puta:

| put | cena | trošak |
|---|---|---|
| (a) dodati paket | jedna zavisnost | najčistiji R3F kod |
| (b) `three/addons/postprocessing/*` | **nula novih zavisnosti** — three 0.184 ih već nosi | ručno vlasništvo nad render petljom, bije se sa R3F `frameloop` |
| (c) bez posta | nula | glow, vignette i zrno kao CSS slojevi oko canvasa, nula GPU prolaza |

Moja preporuka je **(c)**: `.bg-video-vignette` je već taj obrazac u repou, CSS vignette je
theme-aware bez ijedne linije GLSL-a, i ne košta GPU prolaz. Ali odluči ti, i odluči tek
kad mi pošalješ ms/frejm sa i bez.

**2. `gltf-transform` CLI nije instaliran**, a bez meshopt-a i kvantizacije budžet od 120 KB
je verovatno nedostižan (hero-cube je 27 B/trougao nekompresovan). **Izmeri sirov export u
Fazi B pa mi javi brojku** pre nego što tražiš alat — ako sirov export slučajno stane, nema
razgovora.

**3. Ulaze li WebP still-ovi u budžet od 700 KB?** Moj predlog: **ne** — lazy su i uslovni,
učitava ih samo klijent bez WebGL-a ili sa Save-Data, i taj klijent nikad ne povuče nijedan GLB.

---

## Rizici

| Rizik | Mitigacija |
|---|---|
| **`COLOR_0` AO nevidljiv na metalu** — na `metalness 1.0` nema difuzne komponente koju bi AO množio, pa ceo rad iz Faze A nestane | drži `metalness` u prozoru `0.78-0.9`; ako i dalje ne čita, AO ide kao poseban term kroz `onBeforeCompile` |
| **AO zapečen kroz AgX** — scena je na `view_transform = 'AgX'` (`blender/CLAUDE.md:14`), a `HERO_SPEC.md:191` tvrdi da je Blender na `Standard`; dokumenti se ne slažu | AO bake ide u **Non-Color**, nikad kroz view transform; proveri stvarno stanje scene pre Faze A i javi mi koje je |
| **ZAGLAVLJIVANJE — korisnik ne može da prođe sekciju.** Ako otpuštanje na krajevima ne radi, kursor koji stoji nad 3D kolonom pojede svaku deltu i strana više ne skroluje ka footeru. Ovo je najgori mogući bug ove sekcije: nije ružan, nego blokira sajt | provera kraja ide **pre** cooldown-a i pre akumulacije, i na indeksu 0 nagore / 5 nadole se ne zove ni `preventDefault()` ni `stopPropagation()`. Kriterijum prijema Faze D, tačka 3, i traži se **screen recording**, ne izjava da radi |
| Lenis i naš wheel listener se otimaju o istu deltu | naš listener je na elementu, Lenis-ov na `window`-u, pa `stopPropagation()` presreće pre njega. Ako se izmeri da strana i dalje beži, `lenis.stop()` na `pointerenter` + `lenis.start()` na `pointerleave` i na unmount — i to se **javi**, ne uvodi ćutke |
| Wheel capture uhvati i kursor koji samo prelazi preko kolone ka nečemu drugom | capture je vezan za kontejner 3D kolone, ne za sekciju, i traži `(pointer: fine)` + `(min-width: 768px)`; bafer se resetuje posle 200 ms bez eventa, pa jedan slučajan „zarez" delte ne ostane da čeka |
| Firefox se ponaša drugačije od Chrome-a | `deltaMode` se normalizuje pre praga: LINE × 16, PAGE × visina viewporta. Bez toga je prag od 120 u Firefox-u ~40 gestova, u Chrome-u ~1,2 |
| Brz niz koraka pravi swap thrash | skok > 1 panela je moguć samo klikom na tačku → kill + 0,25 s crossfade (Faza E); točkić je ograničen cooldown-om od 450 ms i ne može da preskoči panel |
| 45 fps na Androidu uz zadržan 3D (odluka 11) | `dpr [1, 1.5]`, bez posta, bez transmission-a, instance /2; ako i dalje pada, **javi brojku pre nego što sam nešto isključiš** |
| `seo-geo` probije budžet zbog nazubljenog hvata | to je najskuplji model od šest; ako probije, smanji broj zubaca pre nego što diraš siluetu — hvat se čita i sa upola manje zubaca, tubus bez hvata ne |
| `transmission` na `seo-geo` ubije mid-range GPU | već je ograničen na jedan element jednog modela (sočivo lupe) i gasi se ispod 768px; ako i na desktopu košta, pada na `MAT_STEEL` i javi mi. Tablet ga **ne dobija** — `ui-ux-design` je bez transmission-a |
| **Uređaji su najotrcaniji 3D motiv na internetu** — monitor, telefon i tablet su na svakom stock sajtu, pa koncept može da sleti kao template | razliku pravi **debljina okvira**, **pravo staklo preko ekrana** i to da **slika stoji IZA stakla a ne na njemu** — a **ne** količina detalja. Ne dodaj portove, dugmiće ni logotipe da bi „bilo bogatije"; to pojede budžet i ne pomera utisak ni za piksel |
| **Kvalitet slike na ekranu nosi ceo utisak** — loš screenshot obara i savršen model | slika je sadržaj sekcije, ne tekstura; placeholder postoji da se materijal štimuje pre prave slike, ali **prijem sekcije se ne proglašava na placeholderu**. Zamena je jedna linija po disciplini, pa nema izgovora da se odloži |
| **Šest tekstura udvostručuje mrežni budžet** ako se prefetch pravilo ne poštuje — 6 × 100 KB uz 700 KB GLB-ova je duplo više bajtova nego danas | u memoriji je **samo aktivna plus dve susedne**, susedne na `requestIdleCallback`, isto pravilo kao za GLB-ove (odluka 3). Ako se ijednom učita svih šest odjednom, to je bug sa prioritetom, ne optimizacija za kasnije |
| Prelaz izgleda kao dve odvojene animacije (model posebno, tekst posebno) | preklop 0,12 s u tabeli prelaza je tu baš zbog toga; ako i dalje čita razdvojeno, pomeri ulaz teksta ranije, ne produžuj model |
| Google diskontuje tekst na `opacity: 0` | aktivni panel je uvek stvaran tekst; `ItemList` JSON-LD i šest pravih `<Link>`-ova su drugi i treći signal |
| Brisanje `ServiceCards.tsx` obori build zbog nekog importa koji nisam našao | pre brisanja pretraži repo za `ServiceCards`; posle brisanja `next build --turbopack` mora da prođe u istom commit-u |

---

## Šta NE radiš

- Ne piši vanilla Three.js — ovo je R3F projekat
- Ne instaliraj pakete bez pitanja; kandidati su samo `@react-three/postprocessing` i
  `gltf-transform`, i oba su otvorena pitanja, ne odluke
- Ne diraj `SmoothScrollProvider`, `ThemeProvider`, ni njihovu ScrollTrigger integraciju
- Ne pravi drugi Lenis i ne zovi `ScrollTrigger.scrollerProxy` — Lenis vozi nativni scroll
- Ne pinuj sekciju i ne vezuj index za scroll poziciju — ni `pin`, ni `snap`, ni `scrub`
- Ne hvataj `wheel` nigde osim na kontejneru 3D kolone, i nikad na dodiru
- Ne presreći vertikalni dodir na telefonu — to je skrol strane
- Ne zovi `preventDefault()` na kraju liste u smeru gesta; to je zaglavljivanje, ne feature
- Ne mount-uj uslovno šest tekstualnih panela i ne stavljaj im `display:none`,
  `visibility:hidden` ni `autoAlpha` — to je jedina stvar koja obara ceo SEO argument
- Ne izvozi PBR teksture iz Blendera — **nula tekstura u GLB-u**, odluka 4. Ekran je primitiv
  sa UV-ovima i praznim materijalom; sliku vezuje kod, ne exporter
- Ne stavljaj `TEXCOORD_0` na telo — UV-ovi postoje samo na primitivu ekrana
- Ne pravi ekran kao `MeshBasicMaterial` ni kao golu `map` na standardnom materijalu —
  bez clearcoat sloja pada ceo utisak uređaja (Faza E, „Materijal ekrana")
- Ne gradi logo čipove za `seo-geo` sada — to je planirani dodatak, ne posao ove revizije
- Ne dodaj SSAO ni DOF; AO je zapečen, a DOF nije tražen
- Ne diraj `public/assets/models/hero-cube.glb` ni bilo šta u hero folderu
- Ne diraj `constants/navLinks.ts`, `serviceDetails.ts` ni `serviceFloatingObjects.ts` —
  nova sekcija čita svoj ugovor podataka, ne njihove
- Ne dodaj čestice, trail-ove, pozadinske mreže ni druge ukrase koje nisam tražio
- Ne push-uj na main; deployment ide po `.claude/rules/deployment.md`, i to kad ja kažem

## Kako izveštavaš

Screenshot i brojke uz svaku fazu — brojke iz „Definicije „gotovo"" te faze, ne opisno.
Za svaki model tabela `trouglovi | KB | B/trougao`. Za performanse uvek uređaj uz brojku.
Ako nešto nije izvodljivo, reci odmah umesto da improvizuješ.
