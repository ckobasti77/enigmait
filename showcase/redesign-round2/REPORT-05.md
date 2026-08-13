# REPORT-05 — Discipline kao beskonačan horizontalni slajder

**Grana:** feat/redesign-round2
**Korak:** 05/12

---

## PLAN (napisan pre koda)

### Šta postoji danas

`components/sections/disciplines/` je **vertikalni reel**: šest GLB modela visi na
jednoj vertikalnoj traci u jednom `<Canvas>`-u, korak pomera traku po `position.y`
(`MODEL_SLOT_SPAN = 2.9`), a `useDisciplineIndex` je input engine (wheel nad
kolonom, strelice, swipe) sa **clamp-om** na `[0, 5]` i "edge release"-om koji na
krajevima vraća scroll strani. Stepper je vertikalna šipka (`lg`) između modela i
teksta, aktivna tačka je samo *veća* (0.55rem), ne izdužena. Kopija: svih šest
panela je uvek u DOM-u (`opacity` + `inert`) — to je ceo SEO argument sekcije i
ne sme da se dira.

Uzor `ServiceCarousel.tsx`: stage koji kliperuje, track 200% sa dva slota, push
`translateX(-50%)` preko WAAPI keyframe-a (620ms, `cubic-bezier(0.65,0,0.24,1)`),
slajdovi keyed po slug-u da se WebGL ne remountuje, dots sa izduženom aktivnom
tačkom, `wrap()` modul za beskonačno.

### Ključna napetost i kako je rešavam

ServiceCarousel montira 1–2 panela; ovde **svih šest mora ostati u DOM-u**.
Zato ne kopiram *mehanizam* (track od dva slota), nego **geometriju push-a**:

| sloj | kako se push izvodi | zašto tako |
|---|---|---|
| 3D model | jedan `<Canvas>`, traka se pomera po **kamerinoj desnoj osi** umesto po `y` | WebGL se nikad ne remountuje; i dalje su montirana najviše 2 modela (odlazeći + dolazeći) — to je već "aktivni + susedni" |
| kopija | šest panela ostaje u jednoj grid ćeliji; odlazeći ide na `-100%`, dolazeći dolazi sa `+100%`, WAAPI, isti bezier | pravi push bez unmount-a, SEO netaknut |

Obe animacije dele **jedan** `SLIDE_DURATION` + **jedan** bezier
(`cubic-bezier(0.65, 0, 0.24, 1)` — services krive), pa red čita kao jedan pokret.
GSAP nema tu krivu ugrađenu, pa se za reel registruje `CustomEase` iz istog
tuple-a brojeva — jedan izvor, dva potrošača.

### Koraci

1. **`disciplinesTiming.ts`** — reel iz vertikale u horizontalu (`MODEL_SLOT_GAP`
   naraste jer je kadar širi nego viši), `MODEL_SWAP_*` → deljeni `SLIDE_DURATION`
   / `SLIDE_BEZIER` / `SLIDE_EASE_CSS` / `SLIDE_EASE_PATH`; `HINT_PULSE_*` ispada,
   ulaze `HINT_*` konstante tutorijala.
   → verifikacija: `tsc` prolazi, nema mrtvih importa.
2. **`useDisciplineIndex.ts`** — `clamp` → `wrap` (modul), `direction` postaje deo
   state-a (ne izvodi se iz `index > pair.to`, jer 5→0 mora da bude *napred*),
   wheel dobija **budžet od jednog kruga po ulasku u ekran** umesto edge release-a
   (bez toga kursor nad modelom trajno pojede scroll — beskonačna lista nema
   krajeve), plus `stageVisible` / `interacted` za tutorijal.
   → verifikacija: dots/strelice/wheel/swipe idu u krug u oba smera.
3. **`DisciplineStage.tsx`** — traka se pomera po `SLOT_AXIS` (kamerin desni
   vektor, izračunat iz `CAMERA_POSITION`, ne po svetskom `x` — kamera je off-axis,
   pa bi svetski `x` push imao i dubinsku komponentu), `direction` stiže kao prop.
   → verifikacija: napred = model izlazi levo, sledeći ulazi zdesna.
4. **`DisciplineStepper.tsx`** — rail horizontalan na svim širinama i ispod reda,
   ševroni levo/desno, strelice **nikad disabled** (nema krajeva), aktivna tačka
   izdužena 0.5rem → 1.6rem kao services, `aria-current` ostaje.
5. **`DisciplineHint.tsx`** (novo) — pilula nad modelom: prvi put ~6s pošto stage
   uđe u ekran, pa svakih ~20s, svaki put ~3.6s vidljiva; gasi se na prvu
   interakciju. Desktop/mobile kopija se bira **CSS media query-jem** nad dva već
   renderovana labela (ne `matchMedia` state-om), da `LanguageProvider` prevede
   oba i da ne bude hydration razlike. `data-reveal="off"` — chrome koji mora da
   bude čitljiv čim se pojavi.
6. **`Disciplines.tsx`** — grid 2 kolone + stepper ispod, push driver za kopiju,
   stari one-shot puls strelica ispada (tutorijal ga zamenjuje).
7. **`disciplinePrefetch.ts`** — susedi po modulu (sused nule je petica), evikcija
   po **kružnoj** distanci.
8. **`globals.css`** — `.discipline-slide` clip, horizontalan rail, izdužena
   aktivna tačka, `.discipline-hint`.
9. **`lib/i18n.ts`** — `[en, sr]` parovi za dva nova stringa.

### Šta namerno NE diram

- `DisciplineCopy.tsx` — reč-po-reč dolazak i `LanguageProvider` ugovor rade;
  push ide na *omotač*, ne na panel, da dva vlasnika ne pišu isti `transform`.
- Reduced-motion granu (`reduced` → ravna `<ol>` lista od šest). Zahtev traži
  "trenutna zamena bez klizanja"; postojeća grana daje **jače** od toga — nema
  slajdera uopšte, pa nema ni šta da klizi. Rušiti to bi bila regresija.
- `DisciplineModel.tsx`, `environment.ts`, `materials.ts` — pozadina i glow ostaju.

---

## Urađeno

Plan je izvršen u celini, sa **jednim odstupanjem** (opisano pod „Jedna izmena
plana" niže) i **jednim dodatkom koji plan nije predvideo** (retiming kopije).

### Fajlovi

| fajl | šta |
|---|---|
| `components/sections/disciplines/useDisciplineIndex.ts` | prepisan: `wrap` umesto `clamp`, `direction` kao deo state-a, wheel budžet + `IntersectionObserver`, `stageVisible` / `interacted` |
| `components/sections/disciplines/DisciplineStage.tsx` | `SLOT_AXIS` (kamerin desni vektor iz `CAMERA_POSITION`), `slotPosition()`, reel po toj osi, `direction` prop, `CustomEase` |
| `components/sections/disciplines/DisciplineStepper.tsx` | horizontalan rail, strelice levo/desno i bez `disabled`, wrap u tasterima |
| `components/sections/disciplines/DisciplineHint.tsx` | **novo** — tutorijal pilula |
| `components/sections/disciplines/Disciplines.tsx` | grid 2 kolone + rail ispod, WAAPI push kopije, hint, stari puls strelica uklonjen |
| `components/sections/disciplines/disciplinesTiming.ts` | `SLIDE_*` (jedan bezier za oba medija), horizontalan `MODEL_SLOT_*`, `HINT_*` umesto `HINT_PULSE_*`, pomereni `COPY_*_START` |
| `components/sections/disciplines/disciplinePrefetch.ts` | susedi i evikcija po kružnoj distanci |
| `app/globals.css` | izdužena aktivna tačka, horizontalan rail, `.discipline-slide` + clip na stack-u, `.discipline-hint` |
| `lib/i18n.ts` | `["Scroll here", "Skrolujte ovde"]`, `["Swipe", "Prevucite"]` |

`DisciplineCopy.tsx`, `DisciplineModel.tsx`, `DisciplineStill.tsx`,
`environment.ts`, `materials.ts`, `DisciplinesSection.tsx` — netaknuti. Pozadina
i glow netaknuti.

### Jedna izmena plana: wheel ne hvata zauvek

Beskonačna lista nema krajeve, a **krajevi su bili to što je vraćalo scroll
strani** (stari „edge release"). Bez zamene, kursor parkiran nad modelom pojede
svaki delta i posetilac nikad ne stigne do footera — to nije ružan bag, to je
blokiran sajt. Zato wheel dobija **budžet od `count - 1` koraka po ulasku stage-a
u ekran**; kad se potroši, delte se puštaju strani, a budžet se puni kad stage
napusti viewport. Dots, strelice, tasteri i swipe idu u krug **bez ograničenja** —
oni se ni sa čim ne takmiče za isti gest. Zahtev „beskonačno u oba smera" se
odnosi na redosled disciplina i on je ispunjen na svim ulazima.

### Dodatak koji plan nije predvideo: kopija je bila prazna tokom push-a

Prvi prolaz je vizuelno pao. Stari tajming je pisan za **cross-fade u mestu**:
izlaz 0,20 s, ulaz naslova na 0,60 s. Panel koji *putuje* dok je prazan čita se
kao bag — oko prati pokret i u njemu ne nađe ništa (`round2-05-push-midway.png`,
prva verzija: prazna desna kolona sa jednim duhom teksta). Popravka:

- `COPY_EXIT_DURATION` 0,20 → **0,42** (dve trećine push-a; ostatak odseca clip)
- `COPY_TITLE_START` 0,60 → **0,30**, `KICKER` 0,78 → **0,46**,
  `LEDE` 0,88 → **0,54**, `CTA` 0,94 → **0,60**

Redosled i raspon (stagger) nisu dirani, samo offseti. Kraj lede-a je sad
0,54 + 0,22 + 0,30 = **1,06 s**, i dalje ispod plafona od 1,44 s. Sada odlazeća
kopija ostaje čitljiva veći deo puta, a dolazeća se sklapa reč po reč **dok još
klizi** — što je i vidljivo na novom `round2-05-push-midway.png`.

### Verifikacija

`npm run build` ✅ · `npm run lint` ✅ · `npx tsc --noEmit` ✅ (bez `any`)

Ponašanje mereno u pravom browseru (Playwright, produkcijski build na `next start`
i dev build za `__disciplineStage` probe koji postoji samo van produkcije):

| provera | rezultat |
|---|---|
| wheel nad stage-om, jedan notch = jedan slajd | 0→1→2→3→4→5, pet notch-eva, pet koraka |
| wheel posle potrošenog budžeta | šesti notch skroluje stranu, indeks stoji |
| budžet se puni na povratku u ekran | posle izlaska i povratka: notch daje 5→**0** (wrap), strana se ne pomera |
| beskonačno napred | strelica „next" na indeksu 5 → 0 |
| beskonačno nazad | strelica „prev" na indeksu 0 → 5; swipe desno 1→0→**5** |
| dot ide kraćim putem | 5 → dot 1 (dva napred, ne četiri nazad) |
| smer push-a napred | dolazeći slot na `x = +3.04`, traka putuje u minus (izlazi levo) |
| smer push-a nazad | dolazeći slot na `x = −3.04`, traka putuje u plus |
| dva modela samo u letu | `slots: 2` u sredini, `1` u mirovanju |
| kriva i trajanje kopije | `cubic-bezier(0.65, 0, 0.24, 1)`, `620 ms` — identično reelu |
| **WebGL se ne remountuje** | isti `<canvas>` (probe atribut) kroz svih 5 wheel koraka; 1 canvas posle 48 koraka |
| GPU working set posle 4 kruga napred + 4 nazad | geometrije 3 → 5 → 5, teksture 4 → 7 → 6 — plato, bez rasta |
| tooltip prvi put | nevidljiv na 5,6 s, `opacity 1` na 7,0 s, sam se gasi do 10,4 s |
| tooltip posle interakcije | klik na dot → ostaje `data-visible="false"` |
| tooltip kopija | desktop „Skrolujte ovde ⇆", mobilni (390 px) „Prevucite ⇆" |
| aktivna tačka | 25,6 × 8 px (izdužena), neaktivna 8 × 8 px |
| mobilni swipe | levo → sledeći, desno → prethodni, sa wrap-om |
| reduced-motion | ravna lista od 6, sve `opacity: 1`, bez canvas-a, bez slajdera, bez tooltip-a |
| konzola | **0 grešaka**; 3 upozorenja su zatečena (`THREE.Clock` deprecation, HLSL preciznost) |
| text-reveal | `[data-reveal-state="pending"]` = 0, nema zaostalih `.reveal-word` ni `data-no-translate`, nema nevidljive kopije u sekciji |

Slike: `showcase/redesign-round2/review/round2-05-*.png` (folder je u `.gitignore`,
kao i za prethodne korake).

### Preskočeno / svesno nije rađeno

- **Reduced-motion nije dobio „trenutnu zamenu bez klizanja"** jer u toj grani
  nema slajdera uopšte — `usePrefersReducedMotion()` (koji hvata i Save-Data i
  bateriju ispod 20%) vodi na ravnu `<ol>` listu svih šest panela. To je jače od
  traženog i postojeća je, dokumentovana odluka; rušiti je da bi se dodalo
  klizanje-bez-klizanja bila bi regresija.
- **Track od dva slota iz `ServiceCarousel`-a nije prekopiran** — svih šest panela
  mora ostati u DOM-u zbog SEO-a. Prekopirana je geometrija push-a, ne mehanizam.
- **`aria-live` na promenu discipline nije dodat** — nije traženo, a kolona već
  nosi `role="group"` sa uputstvom i `role="img"` sa imenom aktivnog modela.

## Status

Prolazi verifikaciju. Commit na `feat/redesign-round2`, bez push-a.
