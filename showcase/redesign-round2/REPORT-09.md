# REPORT-09 — Redizajn kontakt stranice i forme

Krug 2, korak 09/12. Grana `feat/redesign-round2`. Status: **prošlo, komitovano.**

## Šta je urađeno

### 1. Eyebrow skinut

`app/(pages)/contact/page.tsx` — uklonjen `<span>` „Gradimo zajedno" iznad
typing-console naslova. Stranica sada počinje kucanim naslovom. Par
`["Let's build together", "Gradimo zajedno"]` je ostavljen u `lib/i18n.ts`
(rečnik nema režiju od neiskorišćenog para, a brisanje bi bilo dodatna izmena
bez efekta).

### 2. Mejl → `office@enigmait.rs`

Zamenjeno svuda gde je stajao `hello@enigma.digital`:

- kontakt stranica: prikazani red i `mailto:` (`page.tsx:28`)
- kontakt JSON-LD: `mainEntity.email` (`page.tsx:21`)
- footer / social dropdown: `constants/socialLinks.tsx` (href, tooltip, aria-label)
- pravne stranice: `PrivacyPolicy.tsx`, `TermsOfService.tsx`, `BrandGuidelines.tsx`

Pravne stranice su izvan doslovnog opsega zadatka (koji pominje kontakt + footer +
JSON-LD), ali je tamo isti mejl kontakt tačka za GDPR zahteve i uslove korišćenja —
ostaviti mrtvu adresu u politici privatnosti dok footer pokazuje novu bilo bi
kontradikcija koju korisnik sajta vidi. Ako to nije bila namera, revert je jedan
`sed` po ta tri fajla.

Napomena: `lib/i18n.ts:1418-1419` još sadrži par sa `hello@enigma.digital` u telu
rečenice („share a deck, a Loom…"). Taj string ne renderuje nijedna komponenta
(proveren grep kroz `app/`, `components/`, `constants/`) — ostatak je ranije verzije
kontakt stranice, pa je ostavljen netaknut.

### 3. Pozadina forme = liquid glass, uspravno

Nova klasa `.contact-glass` u `globals.css` — materijal `.nav-panel-body`-ja na
stojećoj površini: `backdrop-filter: blur(18px) saturate(150%)` + wash gradijent +
inset rim + elevacija. Radijus je `--surface-radius` (14px, isti ugao kao ceo sajt),
`transform: none` — bez skew-a, bez krivina, forma ostaje pravougaona.

Namerno **bez** `url(#liquid-glass-filter)` displacement sloja koji `.nav-panel-body`
dodaje: taj filter je podešen za element veličine kontrole (scale 26 preko dugmeta
od ~44px), a preko ovako visoke forme razmaže sadržaj iza sebe u šum. Blur + wash
nose isti utisak na ovoj veličini.

Novi tokeni, definisani u **sve tri palete** (`:root` light, `.dark`, `[data-mood="alt"]`):

| token | šta radi |
|---|---|
| `--form-glass-wash` | gradijent-podloga panela |
| `--form-glass-rim` | inset rim (ivica stakla) |
| `--form-field-bg` | podloga inputa unutar stakla |
| `--form-field-bg-focus` | ista, na fokusu |

Polja unutar stakla su korak *papira* na staklu, ne drugo staklo — naslagani
blur-ovi čitaju kao magla.

### 4. Floating labels

Svako tekstualno polje (ime, e-pošta, kompanija, poruka) sada nema statični label:
`<label>` stoji na prvoj liniji inputa kao placeholder i diže se u rezervisani
pojas na vrhu polja na fokus, ili kad polje ima vrednost.

- Pristupačnost: pravi `<label for>` ↔ `id` par, ne fake placeholder. Ime polja
  ostaje u accessibility stablu (potvrđeno Playwright snapshotom: `textbox "Ime"`).
- Mehanika: `:placeholder-shown` u CSS-u, zato svako polje nosi `placeholder=" "` —
  polje bez `placeholder` atributa nikad ne matchuje taj pseudo-klas i label bi
  ostao zaglavljen dole. Razlog je dokumentovan u konstanti `FLOAT_PLACEHOLDER`.
- Layout se ne pomera: gornji padding je rezervisan prostor u koji podignuti label
  sleće. Animiraju se samo `transform` i `color`.
- `<select>` („Željeni format odgovora") uvek ima vrednost, pa mu je label pinovan
  gore (`.float-field-label--pinned`); native chevron je zadržan (`appearance: none`
  bi uklonio jedinu afordansu kontrole), vrednost se sklanja desnim paddingom.
- Chrome autofill: dodato pravilo koje sprečava da žuti slab probije staklo.

### 5. Multi-select pilule „Šta vas zanima?"

`<fieldset>` + `<legend>`, unutra sedam parova `input[type=checkbox]` (vizuelno
sakriven, ali fokusabilan) + `<label class="interest-pill">`. Redosled po
specifikaciji: Opšte, Website, Mobilna aplikacija, Dizajn, Branding, SEO i GEO,
Društvene mreže. Više može biti čekirano.

Čekirano stanje nosi **CTA-ov puls**: selektor
`.interest-pill-input:checked + .interest-pill::after` je *dodat u postojeću
grupu* `.trace-cta--primary::after, .cta-rim::after`, umesto da se pravilo prepisuje —
znači isti `--cta-line`, isti `--cta-pulse-glow`, ista `cta-breathe` animacija i isti
`--cta-pulse-duration` iz koraka 02. „Selektovano" i „deluj ovde" su isto svetlo.

Opcije žive u novom `constants/contactInterests.ts` i deli ih klijent i server —
akcija validira ono što stigne prema tim vrednostima i u mejl šalje label, pa
string ne postoji u dve verzije sa dve strane žice.

### 6. Slanje — `interests` u `actions.ts`

`formData.getAll("interests")` → filtrirano kroz `CONTACT_INTEREST_LABELS` (whitelist,
jer POST može poslati bilo šta) → mapirano u labele → `Interests: …` red u `text` i
`html` telu mejla. Prazno je dozvoljeno (`(not selected)` / `Not selected`).
Validacija, poruke o uspehu/grešci, reset forme nakon uspeha i ostatak ugovora
akcije su netaknuti.

## Bug uhvaćen tokom verifikacije

Prve pilule su renderovale **„Web sajt"** i **„Brending"** umesto „Website" i
„Branding" — i to u srpskom, bez ikakvog prebacivanja jezika. Uzrok:
`LanguageProvider` prevodi svaki tekstualni čvor koji prepozna, uključujući i u SR
režimu, a „Website" i „Branding" su već *engleski ključevi* u `lib/i18n.ts` (za nav:
→ „Web sajt", → „Brending"). Par tu ne pomaže — engleska strana je zauzeta, a
duplikat ključa bi odveo nav stringove na pogrešno mesto.

Rešenje: te dve pilule nose `data-no-translate="true"` (escape hatch koji provider
već poštuje) i čitaju se isto na oba jezika — što je i tačno, obe reči su iste u
engleskom i srpskom. Nosi ga podatak (`noTranslate?: true` u `contactInterests.ts`),
ne komponenta, pa je razlog zapisan uz opciju. Ostalih pet pilula ide kroz rečnik
(„Dizajn", „SEO i GEO", „Društvene mreže" su već imali par; „Opšte" i „Mobilna
aplikacija" su dodati).

Usput: naslov forme „Započnite skicu projekta" je pokazivao isti Microgramma glyph
kvar dokumentovan u REPORT-08 (mid-word `č` renderovano kao `Č`). Primenjen isti
dokumentovani opt-out — `data-display-font="off"` + `font-aeonik` — jer je naslov
kartice forme chrome, ne headline.

## Verifikacija

- `npm run lint` — prošlo, bez upozorenja.
- `npx tsc --noEmit` — prošlo. Nema `any`.
- `npm run build` (Turbopack + TypeScript) — prošlo, svih 16 stranica.
- Playwright (pravi browser, MCP), `/contact`:
  - eyebrow-a nema u DOM-u (`body.textContent` ne sadrži „Gradimo zajedno")
  - sva tri `mailto:` linka na stranici → `office@enigmait.rs`
  - `.contact-glass`: `backdrop-filter: blur(18px) saturate(1.5)`, wash gradijent,
    rim + elevacija u `box-shadow`, `border-radius: 14px`, **`transform: none`**
  - floating label, sva četiri stanja izmerena na `#contact-name`:
    fokus-prazno → podignut `scale(.78) translateY(8px)`; blur-popunjeno → ostaje
    podignut; blur-prazno → vraća se na `translateY(24px)`; boja na fokusu → `--primary`
  - pilule: klik na „Website" pa „SEO i GEO" → oba čekirana istovremeno
    (multi ✓), `FormData.getAll("interests") = ["website","seo-geo"]`
  - čekirana pilula: `::after` animacija `cta-breathe 3.2s`, `box-shadow` iz
    `--cta-line` / `--cta-pulse-glow`
  - tastatura: Tab stiže do checkbox-a, `:focus-visible` ring se crta na piluli,
    Space čekira (ring: `solid`, boja `--cta-line`)
  - EN prekidač: legend → „What are you interested in?", pilule → General / Website /
    Mobile app / Design / Branding / SEO & GEO / Social Media; labeli polja →
    Name / Work email / Company / What should we tackle together? / Preferred
    response style. Povratak na SR vraća tačno početne stringove (nema drifta).
  - `prefers-reduced-motion: reduce` (emulirano): label bez tranzicije, puls
    `animation: none` ali prsten parkiran na `opacity .55` — stanje preživljava
  - dark tema i mobilni viewport (390×844) provereni screenshotom: staklo drži
    kontrast, pilule se prelamaju u tri reda, dugme ide ispod
  - console: bez grešaka
- Nije testirano stvarno slanje mejla — to bi značilo pravi SMTP saobraćaj sa
  produkcijskim kredencijalima iz `.env.local`. Provereno je da forma na wire šalje
  `interests` u obliku koji `actions.ts` čita (`getAll` + whitelist).

## Fajlovi

- `constants/contactInterests.ts` (nov)
- `app/(pages)/contact/_components/ContactForm.tsx` (prepisan)
- `app/(pages)/contact/actions.ts` (+ `interests`)
- `app/(pages)/contact/page.tsx` (eyebrow, mejl, JSON-LD)
- `app/globals.css` (4 nova tokena × 3 palete, `.contact-glass`, floating label,
  pilule, reduced-motion, proširena CTA-puls grupa)
- `constants/socialLinks.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`,
  `BrandGuidelines.tsx` (mejl)
- `lib/i18n.ts` (3 nova `[en, sr]` para)

## Napomena o commit-u

Zadatak propisuje `git add -A`, pa su u commit ušla i dva fajla koja ne pripadaju
ovom koraku a stajala su u working tree-u od ranije: `.claude/launch.json` (lokalna
izmena, `enigma-logo-worktree` konfiguracija) i `showcase/redesign-round2/REPORT-08.md`
(izveštaj prethodnog koraka, bio nekomitovan).
