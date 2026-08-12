# REPORT-03 — Card primitiv + trace reveal, korak 03/07

Grana: `feat/redesign-clean`. Spec: `enigma-claude-code-promptovi.md` → **PROMPT 2**.
Vizuelna referenca: `enigma-proto.html`, sekcija „02" (`.rcard`, `.trace`, `@keyframes streak`).
Izvor logike: `app/_components/ProcessCard.tsx` + `lib/borderTrace.ts` (početna nije dirana).

## Urađeno

Jedan Card primitiv za ceo sajt i jedan hook koji nosi „unlock" sa početne. Kartica ima
**stalan plavi rim** u miru, cyan hairline gore i hover (lift + glow); `RevealCard` na
ulazak u ekran pusti **dva svetlosna traga** koji krenu iz sredine gornje ivice, pretrče
border u suprotnim smerovima i sretnu se dole, a sadržaj izranja iz blura unutar tog traga.
Jednokratno. Pod `prefers-reduced-motion` nema ni traga ni blura — kartica je odmah tu.

### Fajlovi

| Fajl | Status | Šta |
|---|---|---|
| `hooks/useBorderTraceReveal.ts` | **nov** | ResizeObserver (border-box) + `buildBorderTracePaths(w,h,16,"top")` + jednokratni ScrollTrigger. Izvozi `TRACE_DASH`, `CARD_RADIUS` i klase koje animira. |
| `components/ui/card.tsx` | **nov** | `Card` (statična) i `RevealCard` (Card + hook + SVG trace sloj). |
| `app/globals.css` | izmenjen | Tokeni `--card-trace` / `--card-trace-glow` u **sve tri palete**; blok `.ui-card*` odmah ispod `.trace-cta` bloka. |
| `app/(pages)/services/_components/ServiceCapabilities.tsx` | izmenjen | 6 kartica → `RevealCard`. |
| `app/(pages)/projects/page.tsx` | izmenjen | 6 projekat-kartica + 3 „Kako radimo" → `RevealCard`. |
| `app/_components/PageHero.tsx` | izmenjen | highlight kartice → `Card` sa `cursorGlow`. |
| `.gitignore` | izmenjen (1 linija) | `showcase/redesign/review/` — screenshotovi su artefakt procesa, isto pravilo kao `showcase/review/`. |

### Tokeni (sve tri palete)

| Paleta | `--card-trace` | `--card-trace-glow` |
|---|---|---|
| svetla (`:root`) | `#0284c7` | `rgba(2, 132, 199, 0.3)` |
| tamna (`.dark`) | `#58c4ff` | `rgba(56, 189, 248, 0.45)` |
| matrix (`data-mood="alt"`) | `#00ff41` | `rgba(0, 255, 65, 0.45)` |

Reuse, bez novih tokena: `--border-strong`, `--card`, `--card-foreground`, `--glow-accent-1`,
`--glow-accent-2`, `--shadow-elevated`, `.theme-card`, `.card-lift`.

## Implementacione odluke

- **Reveal ne dira `opacity` — ni jednom.** Kopiju na ovom sajtu otkriva site-wide pass
  (`lib/textReveal.ts`) reč po reč, i on je vlasnik opacity-ja svake linije. Da je veil
  gasio istu kopiju, kartica bi morala `data-reveal="off"` **i** sopstveni `splitWords`
  (dug iz `text-reveal` skila) — mnogo mašinerije za primitiv koji renderuje decu koja mu
  se predaju. Umesto toga veil nosi **dubinu**: `blur(6px) → 0` i `y: 14 → 0`. Reči stižu
  unutar traga, animacije se slažu umesto da se otimaju. Bonus: nijedna linija teksta ne
  može da ostane nevidljiva ako JS zakaže.
- **Tempo je ProcessCard-ov, bez njegovog `timeScale`.** Isti `TRACE_DASH` (`TRACE_LENGTH*0.17`),
  isti `power1.inOut`, ista dužina traga (1.05s). `SEQUENCE_SPEED = 3` na početnoj postoji zato
  što tamo lanac ima pet koraka (čvor → konektor → trag → sadržaj → smirivanje) i mora da
  stigne dok kartica putuje kroz ekran; ovde su dva koraka, pa neubrzano pada na ~1.05s —
  praktično prototipovih 1.15s.
- **Okidač je `top 85%`, ne `center 67%`.** 15% u ekran je isti trenutak koji koristi
  site-wide text reveal, pa trag i reči kreću zajedno. `center 67%` ovde ne valja iz drugog
  razloga: kartica u poslednjem redu kratke stranice nikad ne dođe do sredine ekrana, i
  ostala bi zaključana zauvek.
- **Konstante su prepisane, ne importovane iz `ProcessCard`.** Početna je dizajn-referenca
  ovog redizajna i po tvrdom pravilu se ne dira — a lift konstanti iz nje bi bila izmena u
  njoj. Kad zatreba da se pomeraju zajedno, ovaj hook je fajl u koji se dižu.
- **Tri kutije po kartici i svaka nosi svoje.** Root drži radius, hover lift i hover glow;
  shell drži border, pozadinu i clip (media ide do ivice, mora da stane u ćoškove);
  content box prima `className` (padding/flex/gap) i to je ono što `RevealCard` animira.
  Isti razlog kao kod `ProcessCard`: **trag mora da sija preko ivice na kojoj je nacrtan**,
  pa i on i senka žive na root-u, izvan clip-a. Da je sve jedna kutija, `overflow: hidden`
  bi pojeo pola glowa.
- **Rim je `color-mix(--card-trace 22%, --border-strong)`, ne goli `--border-strong`.**
  U tamnoj i matrix paleti `--border-strong` *jeste* plava (odn. zelena), ali na papiru je
  topla strukturna linija — kartica bi u svetloj temi ostala bez plavog rima, a „stalan plavi
  border" je kriterijum prihvatanja. Mešanje čuva palette-anchor i daje plavo u sve tri teme
  (izmereno: tamna `rgba(88,196,255,0.53)`, svetla `srgb 0.114 0.385 0.507 / 0.39`).
- **Trag se ne renderuje pod reduced-motion.** Da SVG ostane, statični dash bi visio na
  gornjoj ivici kao artefakt. Hook vraća `trace: null` i kartica ga preskoči.
- **Merenje ne blokira reveal.** Ako kartica nikad ne prijavi veličinu (npr. stoji u
  `display:none` kontejneru), nema traga — ali sadržaj i dalje mora da izađe iz blura, pa
  se timeline gradi i bez putanja. Grana bez putanja ne zove GSAP na prazan selektor
  (proveren konzolni log: 0 `GSAP target not found`).
- **`cursorGlow` je opcion i koristi se tačno gde je zamenio nešto.** PageHero highlight
  kartice su imale ručni `linear-gradient` overlay na hover; sad je to radial glow koji prati
  miša preko `--glow-x`/`--glow-y`, isti trik kao `DropdownItem` u `ServicesDropdown` —
  bez React state-a, bez re-rendera po hover-u.
- **Polimorfni `as`** je `ElementType`, ali se pri renderu kastuje u jedan `ComponentType`
  tip (`CardRoot`). Bez toga TS preseca propove svih mogućih tagova i `children` postane
  `never`. Bez `any`.

## Čišćenje (manje sitnica, glow netaknut)

- Tri ručno prekucana hairline `div`-a (ServiceCapabilities, projects grid, projects
  „Kako radimo") obrisana — hairline je sad deo primitiva.
- Klaster `card-lift relative flex ... overflow-hidden rounded-3xl border border-theme
  theme-card ... hover:border-cyan-400/50` obrisan sa 4 mesta.
- PageHero highlight: obrisan hover gradient overlay (`mixBlendMode: screen`) i ručni
  `hover:-translate-y-2` — oba dupliraju ono što kartica sad radi sama.
- Projects kartica: obrisan dekorativni redni broj (`01`, `02`…) — kartica je već obeležena
  tag čipom, a broj je duplirao poziciju u mreži. Header red se sveo na jedan čip.
- **Nije dirano:** tag čip, `scope` čipovi, monogram/grid „designed cover" i njegova
  `glow-accent` kugla, `glow-accent` u projects hero-u. To je sadržaj i glow, ne sitnica.

## Verifikacija

`npm run lint` — prolazi (bez izlaza). `npm run build` — prolazi, 16 ruta, TypeScript čist,
bez `any`. `npx tsc --noEmit` — čist.

Ostalo je provereno u pravom browseru (Playwright MCP, dev server na :3001):

| Provera | Rezultat |
|---|---|
| broj kartica kroz primitiv | 9 na `/projects`, 6 na `/services/web-development`, 6 highlight-a na `/services` |
| radius / rim | root `16px`; rim `rgba(88,196,255,0.53)` tamna, `srgb .114 .385 .507 / .39` svetla, zelena u matrix |
| hairline | `linear-gradient(90deg, transparent, var(--card-trace), transparent)`, prati temu |
| unlock na scroll | `strokeDashoffset` `170 → -99 → -1000`, veil `blur(6px)/y14 → blur(0px)/y0`; svih 9 kartica završi otključano |
| trag: boja i glow | `stroke: rgb(2,132,199)` (svetla), `drop-shadow(0 0 4px)` + `drop-shadow(0 0 10px)` — glow netaknut |
| hover | `translateY(-4px)`, `0 18px 46px var(--shadow-elevated), 0 0 0 1px trace@22%, 0 0 28px var(--glow-accent-1)`, rim → trace@55% |
| `prefers-reduced-motion: reduce` | 0 trace SVG-ova, veil `filter: none / transform: none / opacity: 1` — sadržaj odmah vidljiv |
| text-reveal ugovor | posle skrola cele stranice: `[data-reveal-state="pending"]` = 0, nijedan vidljiv element sa `opacity: 0` osim zatečene chrome (nav panel, tooltipovi) |
| konzola | 0 grešaka; jedino upozorenje je zatečeno `THREE.Clock deprecated` |

Screenshotovi: `showcase/redesign/review/03-*.png` (gitignore-ovani, kao i za ranije korake).

## Poštovana pravila

Bez push-a i bez deploy-a — sve lokalno na `feat/redesign-clean`. Početna (`Hero`,
`TechSection`, `Timeline`, `ProcessCard`, `Disciplines`) i `lib/borderTrace.ts` nisu
promenjeni ni jednim karakterom. Pozadina nije dirana. Glow nije smanjen: reveal trag nosi
isti dvostruki drop-shadow kao process kartice, hover je dobio glow koji ranije nije imao,
a kugle i ambijentalni glow na stranicama su ostali. Novi tokeni su u sve tri palete.
Trag se meri po **border-box**-u. i18n: sav tekst je ostao u istim blok elementima
(`h3`/`p`/`span`/`li`), nijedan string nije menjan ni brisan, pa `lib/i18n.ts` ne traži dopunu.

## Preskočeno / napomene za sledeće korake

- **Nema `data-reveal="off"` na karticama** — namerno, vidi prvu odluku. Ako neki budući
  sadržaj u kartici bude morao da ima sopstveni tajming kopije, tada ide opt-out **i**
  `splitWords`/`restoreWords`, po `DisciplineCopy.tsx`.
- **`ProcessCard` i dalje ima svoju kopiju `TRACE_DASH`/`CARD_RADIUS`.** Duplikat je svestan
  (početna se ne dira u ovom lancu). Kandidat za konsolidaciju kad redizajn stigne do
  početne, ako uopšte stigne.
- **Prvi frame.** Kartica se iscrta oštro pa je efekat zamuti u sledećem frame-u (isti
  obrazac kao `ProcessCard`, jer skrivanje mora da bude JS a ne CSS). Ispod preloma se ne
  vidi; sve tri primenjene mreže su ispod preloma, a PageHero highlight-i koriste statični
  `Card` bez reveal-a.
- **`will-change: transform, filter`** stoji na veil-u trajno (kao na `.process-card-veil`).
  Ako se broj kartica po stranici bude povećavao, to je prvo mesto za merenje.
- **Ostale kartice na sajtu** (`/about`, `/contact`, `/brand`, metrics u `PageHero`,
  `ServiceProcess` i sl.) nisu prevedene na primitiv — PROMPT 2 nabraja tri mesta i tu je
  granica ovog koraka. Primitiv je spreman za PROMPT 3/4/5.
