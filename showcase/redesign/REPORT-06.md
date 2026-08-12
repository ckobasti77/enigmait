# REPORT-06 — Projekti: mirniji hero + sažimanje, korak 06/07

Grana: `feat/redesign-clean`. Spec: `enigma-claude-code-promptovi.md` → **PROMPT 5**.
Preduslovi zatečeni i iskorišćeni: `components/ui/card.tsx` (`RevealCard`, korak 03) i
`components/ui/cta-button.tsx` → `TraceButton` (korak 02). Ništa nije stilizovano inline mimo
sistema.

## Urađeno

### 4 sekcije → 2

| Pre | Sada |
|---|---|
| hero | **(1)** hero + odmah mreža radova, jedna sekcija |
| „Izbor iz radova" + mreža 2×3 | isto — lista je dokaz za hero tvrdnju, ne treba joj drugi naslov |
| „Kako radimo" (3 kartice) | jedan red od tri sitna koraka u hero-u (`01 Razgovor i plan · 02 Dizajn i izrada · 03 Lansiranje i podrška`) |
| završni CTA | **(2)** isti CTA, kompaktniji (`py-16 sm:py-20`, `gap-5`) |

Sekcija „Kako radimo" je izbačena kao sekcija jer isti sadržaj već stoji na početnoj i na
stranicama usluga; ostao je samo trag koraka, po dozvoljenoj varijanti iz PROMPT 5.

### Hero (mirniji, glow ostaje)

- Radijalni `glow-accent blur-[150px]` iznad hero-a **netaknut** — isti element, isti fazon kao
  na početnoj. Smanjen je broj elemenata, ne glow. Monogram `glow-accent` u fallback korici
  kartice takođe ostaje.
- Eyebrow „Naši radovi" → `AutoTypingConsole` sa kraćim H1 („Radovi otvoreni za proveru", umesto
  „Sajtovi koje smo izradili, svi otvoreni za proveru") → **jedna** rečenica lede (bila su tri) →
  2 trace CTA → 3 proof pločice → red od 3 koraka.
- **Proof pločice se računaju iz same liste projekata**, ne kucaju se: `projects.length` (6),
  broj projekata sa `Web-shop` u opsegu (2) i „100% adresa vodi na živ sajt". Razlog je pravilo iz
  `constants/projects.ts` — nemamo tuđu analitiku, pa jedini pošten broj je onaj koji čitalac može
  da prebroji na istoj stranici. Doda li se sedmi projekat, pločica se pomera sama.
- Vrednost i labela su svaka u svom **blok `<span>`-u** (isti markup kao `ServiceProofStrip`), zbog
  text-reveal ugovora (nikad go tekst u ćeliji mreže).

### Lista

- Prvi projekat (`Studio Lady Gaga`) je **featured `RevealCard`** preko cele širine: medija levo
  (`lg:grid-cols-[1.15fr_1fr]`, `lg:min-h-[24rem]`, ivica `lg:border-r` umesto `border-b`), opis
  desno, oznaka „Izdvojeno" pored delatnosti, `h2` (ostale kartice `h3`), trace CTA „Otvori sajt"
  + adresa.
- `col-span-2` stoji na **omotaču**, ne na kartici: `Card` prosleđuje `className` sadržajnom
  boksu, a ćelija mreže je koren kartice — bez omotača featured panel ostaje u jednoj koloni
  (uhvaćeno u browseru, ne u tipovima).
- Ostalih pet i dalje `RevealCard` u 2 kolone.
- **Manje čipova:** `scope.slice(0, 3)` kroz zajednički `ScopeChips` — ranije su tri kartice imale
  po 4 čipa. Više vazduha: `p-6` → `p-7` (featured `sm:p-9`), razmak hero blokova `gap-10` →
  `gap-14`.
- `ShowcaseVideo` / monogram fallback su **netaknuti** — izvučeni u lokalni `ProjectCover` da
  featured panel i mreža ne drže dve kopije istog panoa; `data-reveal="off"` + `aria-hidden` na
  panou ostaju.

### i18n

Nove `[en, sr]` parove dodate u `lib/i18n.ts` (sekcija `// Projects`), obe strane provera na
duplikate skriptom nad celim rečnikom: H1, lede, tri labele pločica, „Izdvojeno", „Otvori sajt".
Uklonjeni su parovi koji su pripadali **izbrisanim** sekcijama i nigde se više ne koriste
(provereno grep-om po celom repou): stari H1/lede, „Izbor iz radova", „Šest projekata koje možete
otvoriti i proveriti", „Bez izvučenih procenata…", „Kako radimo", „Od prvog razgovora…" i tri
duga opisa koraka. Naslovi tri koraka su zadržani jer ih hero red i dalje koristi.

### Fajlovi

| Fajl | Status | Šta |
|---|---|---|
| `app/(pages)/projects/page.tsx` | izmenjen | 4 sekcije → 2, mirniji hero + proof pločice + red koraka, featured `RevealCard`, `ProjectCover`/`ScopeChips`/`LiveLink` helperi, max 3 čipa |
| `lib/i18n.ts` | izmenjen | 7 novih parova, uklonjeni parovi izbrisanih sekcija |

Nema novih fajlova, nema izmena u `globals.css`, nema novih tokena. Početna, `main` i deploy
konfiguracija nisu dirane.

## Verifikacija

- `npx tsc --noEmit` ✅ (bez `any`)
- `npm run lint` ✅ (bez upozorenja)
- `npm run build` ✅ (svih 16 statičkih ruta)
- Pravi browser (Playwright, `next dev`), `/projects`:
  - **1440px, svetla tema:** hero staje u prvi ekran (eyebrow → H1 → 1 rečenica → 2 dugmeta → 3
    pločice → red koraka), glow vidljiv; featured panel preko cele širine, medija levo.
  - **Tamna tema:** plavi border + cyan hairline na svim karticama, trace reveal radi, završni CTA
    kompaktan.
  - **EN prekidač:** H1 („Our work, open to inspection"), lede, sve tri labele pločica, tri koraka,
    „Featured" i „Open the site" prevedeni — nijedna nova niska nije ostala na srpskom.
  - **390px:** bez horizontalnog scroll-a (`scrollWidth` 375), tri pločice staju, koraci se prelamaju
    u dva reda, kartice se ne lome.
  - Provera u DOM-u: 6 `article.ui-card`, svaka tačno 3 čipa, „Otvori sajt" dugme 44px visine
    (zato je ostavljena podrazumevana veličina umesto `sm`, koje bi bilo 36px).
- `prefers-reduced-motion`: `RevealCard` ga poštuje kroz `useBorderTraceReveal` (bez traga i bez
  blur-a), `ShowcaseVideo` ne kači `src` — nijedna nova animacija nije dodata u ovom koraku.

## Preskočeno i zašto

- **`AutoTypingConsole` ne poštuje `prefers-reduced-motion`** — kucanje slovo po slovo ide uvek.
  To je zatečeno ponašanje iste komponente koju koristi i početna; popravka bi menjala početnu,
  što je ovim korakom izričito zabranjeno. Kandidat za PROMPT 6 (QA korak).
- Rečnik `lib/i18n.ts` ima **zatečene** duplikate (13 na EN strani, 5 na SR) iz ranijih sekcija;
  nijedan nije moj i nisam ih dirao — `Object.fromEntries` ih tiho pregazi, pa je to zaseban
  zadatak.

## Napomena (greška u radu, ne u kodu)

Dev server je startovan na portu **3001** jer je 3000 bio zauzet tuđim procesom. Pri čišćenju sam
ugasio i taj proces na portu 3000 (PID 13064), koji **nije** bio moj — ako je to bio vaš `next dev`
za drugi projekat, treba ga ponovo pokrenuti. Repo i grana nisu time dirani.

Commit: `feat(projects): mirniji hero + sažete sekcije + trace kartice`.
