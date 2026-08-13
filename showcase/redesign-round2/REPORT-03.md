# REPORT-03 — Emblem loga = 3D kocka sa brzim draw → fade loop-om

Grana `feat/redesign-round2`. Lokalno, bez push-a i bez deploy-a. Pozadina netaknuta, glow ostaje.

---

## Plan (napisan pre koda)

1. **SVG, ne WebGL.** Emblem je 40–52px chrome u fiksiranom navbaru: WebGL bi značio kontekst
   po instanci, canvas, rAF i `usePrefersReducedMotion()` pretplatnika za četiri linije.
   Stroke-dashoffset na SVG-u daje isti draw, crisp na svakom DPR-u, bez ijednog JS-a.
2. **Geometrija = ono što emblem stvarno jeste:** četiri kvadratna prstena, po jedan na gornjoj,
   donjoj, levoj i desnoj strani kocke. Utkani („nemogući") izgled PNG-a je artefakt debljine
   punih greda; linija nema šta da uplete, pa se prsteni samo projektuju i iscrtaju.
3. **Ugao merim, ne pogađam:** projekcija po mreži uglova, skor = IoU siluete protiv alpha maske
   `logo-emblem.png`. Očekivanje: negde oko hero kamere.
4. **Fiksna orijentacija, bez rotacije** — ni u miru, ni na hover. Veličina/pozicija u layoutu
   ostaju iste (SVG se uklapa u isti box koji je PNG zauzimao u svom 1024 platnu).
5. **Animacija = draw → hold → fade → pauza, u krug.** Bez putujuće crtice: nema glave koja juri
   oblik, linija dođe i ode. Draw i fade **isto traju**.
6. **`pathLength="1000"`** na svakom prstenu (kao trace na process karticama) — prsteni nisu iste
   dužine, pa bi bez normalizacije svaki crtao svojom brzinom iz jednog CSS `duration`-a.
7. **`prefers-reduced-motion: reduce`** → `animation: none`, kocka statična i iscrtana.
8. Verifikacija: build + lint + tsc, pa pravi browser — filmstrip loop-a, oba theme-a, mobilni,
   reduced-motion, i side-by-side sa starim PNG-om.

---

## 1. Ugao gledanja — izmeren sa `logo-emblem.png`, ne procenjen

Prsteni su projektovani preko mreže (azimut 20–70°, elevacija 8–40°, inset prstena 0.70–1.00),
rasterizovani u canvas i ocenjeni **IoU-om protiv alpha maske PNG emblema**. Optimum je stabilan:

| parametar | vrednost | odakle |
|---|---|---|
| azimut | **33°** | fit (IoU ≈ 0.60 na 200×200 maski) |
| elevacija | **22°** | fit — **tačno elevacija hero kamere** (`HeroCube.tsx` je na 22°, sa druge strane) |
| FOV | 28.8° | `HERO_SPEC`, nepromenjeno |
| inset prstena | 0.90 | fit |

Ta poklapajuća elevacija je razlog zašto emblem i hero kocka čitaju kao **jedan objekat viđen
dvaput**, a ne kao dva slična crteža. Prvi pokušaj — bukvalno hero kamera — promašio je: emblem je
na **suprotnoj strani** (azimut istog znaka bi dao ogledalo), i to je fit odmah pokazao.

Prsteni su fitovani u **isti box koji PNG artwork zauzima u svom 1024 platnu**
(`62,100 → 941,949`), umanjen za debljinu stroke-a — pa zamena slike komponentom ne menja
**ništa** u veličini ni poziciji: izmereno 52 / 46 / 40px na `lg` / `sm` / mobile, `x` = 72 / 24 / 16,
identično starom `<Image>`.

**Zašto četiri prstena, a ne 12 ivica.** Inset 0.90 je ono što ih drži kao četiri odvojena
kvadrata; na 1.00 bi se sastavili u temenima kocke i pali u običan 12-ivični wireframe, koji nije
Enigma znak.

## 2. Animacija — `logo-cube-draw`, 2.2s

| faza | udeo | trajanje |
|---|---|---|
| draw (`stroke-dashoffset` 1000 → 0) | 0 → 25% | **0.55s** |
| hold (iscrtana kocka) | 25 → 45% | 0.44s |
| fade (`opacity` 1 → 0) | 45 → 70% | **0.55s** |
| pauza (prazno) | 70 → 100% | 0.66s |

Draw i fade su namerno **jednaki**. Draw je **0.55s prema hero-vih 1.35s** (`HERO_REVEAL_DURATION`)
— 2.5× brže, jer je emblem mali, trajni chrome i mora da završi da bude zanimljiv pre nego što oko
stigne do njega.

**Bez zmijice.** `stroke-dasharray` je pun obim (1000), pa je jedina animirana veličina offset:
linija raste sa svog početka, ne postoji kratka crtica koja putuje oblikom. Nestajanje je `opacity`,
ne obrnuti draw — kocka **izbledi**, ne „obriše se".

Stagger: **poklopac, pa obe bočne strane zajedno, pa pod** (0 / 0.08 / 0.08 / 0.16s). Kocka se
sklapa, a ne četiri poteza koja dele kutiju. `:nth-of-type`, ne `:nth-child`, jer je `<defs>` prvo
dete SVG-a.

`animation-fill-mode: backwards` — **nađen bug u toku rada:** bez njega dva odložena prstena stoje
**potpuno iscrtana kroz svoj delay**, pa je prvi frame svakog učitavanja bio gotova kocka. Uhvaćeno
na filmstrip-u (`0ms` je pokazivao pun znak), popravljeno, pa ponovo izmereno.

Easing je po keyframe-u: draw `cubic-bezier(0.33, 0, 0.15, 1)` (brz start, meko sletanje na pun
oblik), fade `cubic-bezier(0.4, 0, 0.6, 1)` (simetrično gašenje).

## 3. Boje i glow

Ramp je hero-ov, isti stopovi (`#01BCF9 → #0084F7 → #0841F4 → #4E1BF3 → #8405E5`), po istoj
dijagonali — hero-va gradijentna osa se projektuje na `(0.823, 0.569)` u screen space.

Ramp je zakačen za **sopstveni raspon znaka** duž te ose, ne za uglove artwork box-a: box je
pravougaonik, kocka nije, pa bi corner-to-corner potrošio oba krajnja stopa na prazno platno i
emblem bi izgubio zasićeni cyan i ljubičastu po kojima se prepoznaje. (Prva verzija je imala baš
taj problem — vidi se u `round2-03-old-vs-new.png` posle popravke da su ramp-ovi sada isti.)

Glow ostaje: `drop-shadow-[0_0_16px_rgba(0,183,255,0.26)]` je prenet 1:1 sa `<Image>`-a na SVG.

## 4. Zašto CSS, a ne hook

Repo pravilo je da „trajni trošak" (video, dot field, 3D scene) ide kroz
`usePrefersReducedMotion()` sa Save-Data i baterijom. Ovde je trošak **četiri stroke-ovane linije
u boksu od 52px** — nije u toj klasi, a hook bi značio `"use client"` granicu i pretplatnika za
znak koji je inače čist server markup. OS preferenca — jedina koju je korisnik zaista tražio —
poštovana je CSS media query-jem.

**Bonus:** nema više mrežnog zahteva za `logo-emblem.png` u navbaru (bio je `priority`); znak je
inline u HTML-u.

---

## Fajlovi

| fajl | šta |
|---|---|
| `constants/logoCubeMark.ts` | **novo** — kamera, projekcija, četiri prstena, path-ovi, gradijentna osa |
| `components/EnigmaCubeMark.tsx` | **novo** — SVG (server komponenta, bez hook-ova, bez `"use client"`) |
| `app/globals.css` | **+** `@keyframes logo-cube-draw`, `.logo-cube-mark`, `.logo-cube-ring`, reduced-motion |
| `app/_components/Navbar.tsx` | `<Image src="/logos/logo-emblem.png">` → `<EnigmaCubeMark>`; `Image` import ostaje (wordmark ga koristi) |

`public/logos/logo-emblem.png` **nije obrisan** — ostaje u repou.

## Verifikacija

| provera | rezultat |
|---|---|
| `npx tsc --noEmit` | ✅ čisto, bez `any` |
| `npm run lint` | ✅ bez izlaza |
| `npm run build` | ✅ 16/16 statičkih strana |
| SSR | ✅ četiri `path`-a u serviranom HTML-u, bez hydration warning-a (projekcija je determinističan modul-level račun) |
| konzola | ✅ bez grešaka (samo postojeći `THREE.Clock` deprecation) |
| draw → fade loop | ✅ filmstrip: prazno 0ms → počinje 150ms → pun 600ms → hold → blediš 1350ms → prazno 1800ms |
| zmijica | ✅ nema — dash je pun obim, animira se samo offset |
| rotacija | ✅ nema, ni u miru ni na hover |
| veličina/pozicija | ✅ 52/46/40px, `x` 72/24/16 — identično starom `<Image>` |
| dark / light | ✅ oba (gradijent je theme-nezavisan, kao i PNG pre njega) |
| mobile 390 / 340px | ✅ bez regresije; ispod 360px emblem sam, kao i pre |
| `prefers-reduced-motion` | ✅ `animationName: "none"`, `stroke-dashoffset: 0px`, `opacity: 1`, 0 aktivnih animacija → statična iscrtana kocka |

Screenshot-ovi: `showcase/redesign-round2/review/round2-03-*.png`
(`loop-filmstrip`, `nav-dark`, `nav-light`, `nav-mobile`, `old-vs-new`, `reduced-motion`).
Folder je u `.gitignore`, kao i u prethodnim koracima.

## Preskočeno / napomene

- **Footer nema emblem.** Zadatak kaže „gde god stoji: navbar, footer" — `grep` po celom repou
  daje **samo Navbar** kao mesto gde emblem stoji (`/logos/logo-emblem.png`). Footer ima tekstualni
  brand blok, bez znaka. Dodavanje novog znaka u footer bi bilo proširenje opsega, ne izvršenje
  zadatka, pa nije urađeno — ako se želi, to je jedan `<EnigmaCubeMark>` u postojeći blok.
- **`components/EnigmaLogo.tsx` je nekorišćen** i nema emblem (samo wordmark „ENIGMA/digital" u
  `--font-deltha`). Zatečen dead code, netaknut.
- Jedan `id` gradijenta po stranici. Znak se renderuje jednom; dve instance bi razrešile isti —
  identičan — gradijent, pa nema razloga za `useId()` i `"use client"` granicu koju bi doneo.
