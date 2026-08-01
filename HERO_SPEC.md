# HERO_SPEC — specifikacija nove hero sekcije

**Ovo je autoritet za ceo posao. Poštuj doslovno.**

Geometrija je gotova i verifikovana: `public/assets/models/hero-cube.glb`,
59,4 KB, 2224 trougla, sa normalizovanom dužinom putanje `t ∈ [0,1]` u `TEXCOORD_0.x`.

Cilj je lista u sekciji „Faza D". Radi dok sve stavke ne prođu.
Ne pitaj gde šta ide — mapa fajlova je ispod.

---

## 0. Šta pravimo

Zamenjujemo **kompletnu** hero sekciju. Levo: naslov + CTA. Desno: 3D logo-kocka koja
se iscrtava jednom linijom, u petlji, na providnoj pozadini.

**Sve ide, novi hero se piše od nule.** Ne spašavaj sadržaj iz starog, ne gradi novi
pored starog, ne pravi feature flag.

Živi lanac: `app/page.tsx` → `app/_components/Hero.tsx` (shim) →
`components/sections/hero/Hero.tsx` (shim) → **`components/sections/hero/ScrollStoryHero.tsx`** (60 KB).

Stari hero pročitaj **samo da bi mapirao zavisnosti** — šta uvozi, šta izvozi, ko ga
još koristi osim `page.tsx`, koje konstante i tipove deli sa ostatkom repoa. To je
provera da uklanjanje ne obori build, nije arheologija sadržaja.

---

## 1. Kontekst repoa — pročitaj pre svega

Repo: `C:\Users\admin\Desktop\Web Dev Projects\enigma-digital`

Obavezno: `.claude/CLAUDE.md`, `.claude/rules/patterns.md` (GSAP, R3F, theme,
`"use client"`), `.claude/rules/architecture.md`, `.claude/rules/conventions.md`,
`.claude/rules/styling.md`, `AGENTS.md`. Poštuj ih — ne izmišljaj svoje konvencije.

### Skill-ovi — koristi ih, u projektu su sa razlogom

U `.claude/skills/` stoje gotovi skill-ovi za baš ovaj stack. **Nisu opcioni.**
Učitaj relevantan skill PRE nego što napišeš kod za tu oblast, ne posle prve greške:

| Pre nego što radiš | Učitaj |
|---|---|
| shader, GLSL, `onBeforeCompile`, uniformi, discard | **`threejs-shaders`** ← najvažniji ovde |
| učitavanje GLB-a, `useGLTF`, `TEXCOORD_0`, atributi | `threejs-loaders`, `threejs-geometry` |
| materijal, emissive, fresnel, tone mapping, boje | `threejs-materials`, `threejs-lighting` |
| `useFrame`, petlja, tajming animacije | `threejs-animation`, `threejs-fundamentals` |
| ako uopšte uvodiš GSAP u komponentu | `gsap-react`, `gsap-timeline`, `gsap-performance` |
| bloom, EffectComposer — samo ako se dokaže da vredi | `threejs-postprocessing` |
| ritam animacije, easing, koliko je „previše" | `motion-design` |
| tipografija i vizuelni ton hero sekcije | `design-dna` |

Ako je odgovor na neko pitanje u skill-u, ne improvizuj i ne pogađaj iz sećanja.

**Stack (sve već instalirano — ništa ne instaliraj bez pitanja):**
Next.js 16.2.6 App Router · React 19.2.6 · TypeScript strict, alias `@/*` → koren repoa ·
**@react-three/fiber 9.6.1 + @react-three/drei 10.7.7** · three 0.184.0 ·
gsap 3.15 + @gsap/react · lenis 1.3.23 · Tailwind v4 · Turbopack (dev i build)

Ovo **nije** vanilla Three.js projekat. Pišeš R3F komponentu.
Jedini paket koji sme da se doda je `@react-three/postprocessing`, i to samo ako
dokažeš da je bloom vredan — vidi dole.

### Šta već postoji — koristi, ne pisati ponovo

- `hooks/usePrefersReducedMotion.ts` i `hooks/useIntersectionActive.ts`
- `app/_components/SmoothScrollProvider.tsx` — Lenis je već povezan, ne duplirati
- `app/_components/ThemeProvider.tsx`, `MoodProvider.tsx`, `constants/moodConfig.ts`
- `app/_components/LogoMark3D.tsx` — postojeća R3F logo komponenta, referenca za
  konvencije (`useGLTF`, centriranje kroz `Box3`, `Suspense`)
- `components/ui/cta-button.tsx`
- `constants/brand-guidelines.ts` — glas i ton, na srpskom

---

## 2. Mapa fajlova

| Fajl | Šta |
|---|---|
| `public/assets/models/hero-cube.glb` | ulaz iz prethodne faze, ne diraj |
| `components/sections/hero/HeroCube.tsx` | R3F scena: `<Canvas>`, GLTF, shader materijal |
| `components/sections/hero/heroCube.shaders.ts` | GLSL kao inline template string |
| `components/sections/hero/HeroContent.tsx` | levo: naslov + CTA |
| `components/sections/hero/Hero.tsx` | postojeći shim — prepiši da renderuje novi hero |
| `components/sections/hero/index.ts` | postojeći barrel export — uskladi |
| `app/_components/Hero.tsx` | postojeći shim — ostaje, samo proveri da štima |
| `app/page.tsx` | ne diraj; uvozi `./_components/Hero` i to ostaje |

Za brisanje na kraju: `components/sections/hero/ScrollStoryHero.tsx`,
`components/sections/hero/scrollStoryData.ts`, `public/hero-frames/`.

Imena fajlova su predlog — ako `.claude/rules/conventions.md` propisuje drugačije,
konvencije repoa pobeđuju, samo mi javi šta si promenio.

---

## 3. Odluke — nema pitanja, radi po ovome

Sve je odlučeno. Ne pitaj, ne čekaj odgovor, radi.

1. **Kocka se ne rotira.** Stoji u fiksnom uglu, kao logo.
2. **Ciklus:** ~3s iscrtavanje, pa zmija u beskonačnoj petlji, pun obrt repa ~4s.
3. **Gradijent je fiksan**, ne reaguje na theme/mood.
4. Ako nešto stvarno ne može, uradi najbliže moguće i napiši mi to u izveštaju.

### GLB je gotov i verifikovan — ne diraj ga

`public/assets/models/hero-cube.glb`, **59,4 KB**

```
atributi:      POSITION, NORMAL, TEXCOORD_0
temena:        1452        trouglova: 2224
materijali:    0           kamere: 0        ekstenzije: nema (bez Draco-a)
TEXCOORD_0:    FLOAT32, .x ide 0 -> 1, 387 jedinstvenih vrednosti
bbox:          x ±1.077   y ±1.007   z ±1.077   (Y-up, glTF konvencija)
```

**Putanja je ZATVORENA** — provereno, početak i kraj se poklapaju, razdaljina 0.
`t` je prava normalizovana dužina luka (18 segmenata, odnos dužina/korak konstantan).
Zato je petlja bez šava izvodljiva bez trikova: `uHead` samo klizi po modulu 1.

### Kamera — reprodukuj ugao sa loga

Ugao je izveden merenjem sa logo PNG-a i potvrđen renderom. U three.js koordinatama:

```js
camera.position.set(-3.592, 3.371, 7.532)   // r = 9.0
camera.lookAt(0, 0, 0)
camera.fov = 28.8                            // vertikalni, za kvadratni canvas
```

Ako canvas nije kvadratni, zadrži pravac a podesi `fov` ili rastojanje da kocka lepo
leži u okviru. **Pravac ne menjaj** — on je ono što kocku čini kockom umesto heksagona.

---

## Faza C — R3F komponenta

**Reveal + snake.** `useGLTF` za geometriju, materijal preko `onBeforeCompile` na
`meshStandardMaterial` ili custom `shaderMaterial`. Uniformi `uHead`, `uGap`.
Fragment se odbacuje ako je `t` van `[uHead - uGap, uHead]`, sa wrap-around preko 0/1.

- Faza 1: `uGap` raste 0 → 1, linija se puni
- Faza 2: `uGap` fiksiran na ~0.35, `uHead` klizi u krug — zmija juri rep
- Prelaz mora biti neprimetan

**Glava.** Emisivni ramp u zadnjih par procenata pre `uHead` + diskretan glow.
Prvo bez postprocessing-a. Ako `@react-three/postprocessing` bloom bitno popravlja
izgled — izmeri ms po frejmu sa i bez, javi mi obe brojke, pa tek onda instaliraj.

**Ko vozi vreme.** Odaberi jedno: `useFrame` ili GSAP timeline sa `onUpdate`. Ne oba.
Dokumentuj izbor u komentaru. Lenis i ScrollTrigger su već povezani preko
`SmoothScrollProvider` — ne diraj tu integraciju.

### Boja i animacija su DVA NEZAVISNA ULAZA — ne mešaj ih

Gradijent na logu je izmeren: **ne prati liniju, prostorna je dijagonala.**
Regresija nijanse po poziciji daje pravac `(+0.823, +0.568)` u koordinatama slike.

| Šta | Ulaz | Čemu služi |
|---|---|---|
| **Boja** | pozicija temena projektovana na fiksni 3D pravac | da izgleda kao logo |
| **Iscrtavanje i zmija** | `t` iz `UVMap.x` (`TEXCOORD_0`) | animacija |

Pravac za boju (object space, isti kao u Blender sceni, leži u ravni ekrana):

```
gdir = (0.6512, -0.5464, -0.5267)     // normalizovan
raspon projekcije: -1.647 .. +1.647   // mapiraj na 0..1
```

**Stopovi** — uzorkovano sa logo PNG-a, 310.000 piksela, speculari isključeni,
interpolacija linearna:

| pozicija | hex |
|---|---|
| 0.00 | `#01BCF9` |
| 0.25 | `#0084F7` |
| 0.50 | `#0841F4` |
| 0.75 | `#4E1BF3` |
| 1.00 | `#8405E5` |

Specular na ivicama `#EEF6FE`. Materijal: `metalness 0`, `roughness 0.14`,
boja ide u `color` i `emissive`, `emissiveIntensity` ~0.45, plus tanak fresnel rim
ka `#EEF6FE` umesto environment mape.

Boja se tokom animacije **ne pomera** — zaključana je za geometriju. Pomera se samo
koji deo linije je vidljiv. Kocka se iscrtava u svojim bojama, boja ne putuje sa glavom.

`toneMapping` postavi eksplicitno i dokumentuj izbor. Blender scena je na `Standard`;
ako web ostane na drugom default-u, boje neće odgovarati renderu koji je odobren.

**Integracija.**

- `"use client"`, `<Canvas>` sa `gl={{ alpha: true }}`, providna pozadina, bez skybox-a
- `frameloop="always"`, ali pauziraj kroz postojeći `useIntersectionActive`
- pauza na `document.hidden`
- `dpr={[1, 2]}`
- `usePrefersReducedMotion` → statičan, potpuno iscrtan kadar
- Turbopack: GLSL kao inline template string, **ne** dodavati glsl loader
- ako `t` atribut nedostaje → kontrolisan fallback na statičan mesh, nikad crn ekran
- čist cleanup na unmount: geometrija, materijali, render targets

**Levo u hero-u:** naslov + podnaslov + primarni CTA (`components/ui/cta-button.tsx`)
i sekundarni link. Tipografija po `.claude/rules/styling.md`.

Sajt je dvojezičan, izvorni jezik je **engleski**, srpski ide preko
`englishToSerbianEntries` u `lib/i18n.ts` (`DEFAULT_LOCALE = "sr"`).
Svaki string dodaj kao `[EN, SR]` par u tu tabelu.

**Koristi ovu varijantu** (naslov objašnjava kocku pored sebe — animacija postaje
argument, ne ukras):

```
["One line. Everything connected.", "Jedna linija. Sve povezano."],
["Product, engineering and design as one continuous system - not three vendors.",
 "Proizvod, inženjering i dizajn kao jedan neprekinut sistem - ne tri izvođača."],
["Start a project", "Pokreni projekat"],
["See our work", "Pogledaj radove"],
```

Rezervne varijante, ako tražim promenu:

```
["Complexity is not an excuse.", "Složenost nije opravdanje."]
["Ship what moves the number.", "Isporučujemo ono što pomera broj."]
```

**Responsive:** ispod 1024px kocka ide iznad teksta i smanjuje se.
Ispod 768px predloži mi da li canvas uopšte ostaje — 3D na slabom telefonu je
najskuplja stvar na stranici.

---

## Faza D — Definicija „gotovo"

1. Petlja bez vidljivog šava — dokaži poređenjem prvog i poslednjeg frejma
2. 60 fps uz 4× CPU throttle u DevTools — prijavi brojku
3. Nova hero komponenta + GLB ispod 200 KB gzip, ne računajući `three`
4. `next build --turbopack` prolazi, `eslint` čist, TypeScript bez grešaka
5. Pozadina providna — testirano u obe teme
6. Chrome, Firefox, Safari uključujući iOS Safari
7. Nula grešaka i upozorenja u konzoli
8. Nema curenja memorije posle mount → unmount → mount
9. Mobilni layout: kocka se ne lomi ispod 768px
10. Stari hero uklonjen: `ScrollStoryHero.tsx`, `scrollStoryData.ts`,
    `public/hero-frames/` (243 fajla, 18,19 MB) — zaseban commit, povratan `revert`-om,
    posle njega build i lint i dalje prolaze

---

## Šta NE radi

- Ne piši vanilla Three.js — ovo je R3F projekat
- Ne instaliraj pakete bez pitanja; jedini kandidat je `@react-three/postprocessing`
- Ne diraj `SmoothScrollProvider`, `ThemeProvider`, `MoodProvider`
- Ne diraj `public/assets/models/hero-cube.glb` — geometrija je zaključana
- Ne briši `logo.gltf` ni `logo2.gltf`
- Ne gradi novi hero pored starog i ne pravi feature flag
- Ne dodaj čestice, trail-ove, pozadinske mreže ni druge ukrase koje nisam tražio
- Ne push-uj na main; deployment ide po `.claude/rules/deployment.md`, i to kad ja kažem

## Kako izveštavaš

Screenshot i brojke uz svaku veću izmenu. Ako nešto nije izvodljivo, reci odmah
umesto da improvizuješ.
