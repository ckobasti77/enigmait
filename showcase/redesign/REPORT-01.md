# REPORT-01 — Rekon + plan (redesign, korak 01/07)

Grana: `feat/redesign-clean`. Referenca kvaliteta (NE DIRATI): `app/_components/Hero.tsx`,
`TechSection` (`components/logo-marquee`), `Timeline.tsx` + `ProcessCard.tsx`,
`components/sections/disciplines/*`.

## Metodologija datovanja

Istorija je skoro sva u dva velika komita: `first-commit` (2026-08-01, uvoz postojećeg
projekta) i `project showcase: real client sites on /projects, end to end` (2026-08-11,
uglavnom restrukturiranje foldera/rute za projects + services, ne nužno redizajn sadržaja).
Prava "polish" faza koja je isporučila referentni kvalitet (Timeline spine trace,
ProcessCard sekvenca, Disciplines a11y/i18n/perf) desila se **2026-08-02 → 2026-08-03**
("faza F disciplines...", "remove old services grid", "fix" ×2). Fajlovi čiji je poslednji
pravi dodir samo `first-commit` nikad nisu prošli kroz tu fazu — to je glavni signal za
"stara verzija", jače od samog datuma fajla na disku (mtime je nepouzdan posle klona).

## Tabela: stranice i komponente

| Stranica / komponenta | Poslednja prava izmena (git) | # sekcija sad | Predlog # sekcija | Šta spojiti/skratiti |
|---|---|---|---|---|
| `/brand` (`BrandGuidelines.tsx`) | `first-commit` (2026-08-01) | 1 (header + grid kartica + footer, sve u jednom `<section>`) | 1 | Već minimalno — samo generički `theme-card` grid od 9 pillar-a iz `constants/brand-guidelines.ts`. Nema šta strukturno da se seče; eventualno uskladiti hover/gradient overlay klase sa aktuelnim `card-lift` konvencijama umesto ručnog `group-hover:opacity-100` gradienta. |
| `/privacy` (`PrivacyPolicy.tsx`) | `first-commit` (2026-08-01) | 1 | 1 | Isti template kao brand (10 kartica). Sadržajna stranica — sadržaj se ne skraćuje, samo eventualno vizuelno uskladiti karticu sa `theme-card` konvencijom. |
| `/terms` (`TermsOfService.tsx`) | `first-commit` (2026-08-01) | 1 | 1 | Isto (9 kartica). Isti template kao brand/privacy — sva tri fajla su bukvalno kopije jedne šeme; kandidat za deljenu `LegalPageTemplate` komponentu (DRY), ali nije vizuelni dug. |
| `/contact` (`page.tsx` + `ContactForm.tsx`) | 2026-08-11 (project showcase) | 1 | 1 | Već čisto — komentar u kodu ("Direct lines, not boxed cards") pokazuje da je već prošlo kroz cleanup. Nema akcije. |
| `/projects` (`page.tsx`) | 2026-08-11 (project showcase) | 4 (hero, grid od 6 projekata, "Kako radimo" 3 kartice, final CTA) | 3 | "Kako radimo" (razgovor/dizajn/lansiranje, 3 kartice) duplira poruku koju homepage Timeline već nosi — kandidat za brisanje ili spajanje u hero kao kratka lista, ne poseban `<section>`. Final CTA i grid ostaju. |
| `/services` (index, `PageHero.tsx`) | `first-commit` (2026-08-01) | 1, ali gusto: eyebrow + naslov + opis + 2 CTA + 3 metrike (grid) + 6 highlight kartica (iz nav dropdown-a) + footnote + floating 3D objekti | 1, olakšano | Previše sitnica u jednom hero-u (metrike + 6 kartica + footnote sve odjednom). Predlog: zadržati floating objekte i glow, ukinuti metrike grid (3 broja koji se ne pojavljuju nigde drugde na sajtu kao dokaz) ili highlight kartice — ne oboje. `PageHero` je generička komponenta korišćena i drugde, pa promena mora ostati opciona (props već opcioni). |
| `/services/<slug>` × 6 (`ServicePageTemplate.tsx` + 8 pod-komponenti) | 2026-08-11 (project showcase — ali strukturno nepromenjeno od uvoza, template sam nije redizajniran) | **8 sekcija po stranici**: Hero → ProofStrip → Capabilities → Process → Differentiators → Deliverables → Faq → FinalCta | 5–6 | Najveći teret ponavljanja (×6 stranica). `ServiceProofStrip` (4 broja) i `ServiceDifferentiators` (2×2 kartice bez ikonica) su tanki i vizuelno skoro identični `ServiceCapabilities` (kartice sa ikonicom) — kandidati za spajanje: ProofStrip u Hero (stat traka ispod CTA, bez novog `<section>`), Differentiators spojiti u Capabilities kao produžen grid ili ukinuti ako je sadržaj redundantan sa Capabilities/Deliverables. Process, Faq, FinalCta zadržati (nose različitu funkciju: sekvenca, prigovori, sledeći korak). |
| `app/_components/PageHero.tsx` | `first-commit` (2026-08-01) | — (deljena komponenta, korišćena od `/services` indexa) | — | Videti gore — props su već opcioni (`metrics`, `highlights`, `footnote` mogu izostati), pa se čišćenje svodi na to koje props-e `/services/page.tsx` prosleđuje, ne na izmenu same komponente. |
| `app/_components/EffectiveSoftware.tsx` | `first-commit` (2026-08-01) | **NIJE MOUNTOVANA NIGDE** — proverено grep-om, `app/page.tsx` je uvezuje samo Hero/TechSection/Timeline/Disciplines | — | Mrtav kod (250 linija, 4 "pillar" kartice sa scroll-spy logikom). Kandidat za brisanje ili arhiviranje — van scope-a "redizajn stranice" jer se ništa ne renderuje; treba odluka da li se briše ili ostavlja za kasnije. |
| `app/_components/Challenges.tsx` | `first-commit` (2026-08-01) | **NIJE MOUNTOVANA NIGDE** | — | Placeholder (`<div className="h-screen w-full" />`, 7 linija, ništa ne renderuje). Isto — mrtav kod, kandidat za brisanje. |

## Koje stranice idu u redizajn (koraci 02–06)

Redosled po uticaju (broj ponavljanja × koliko odstupa od referentnog fazona):

1. **Services template** (`ServicePageTemplate` + 8 pod-komponenti) — najveći prioritet,
   množi se ×6 stranica, 8 sekcija je previše naspram Timeline/Disciplines fazona koji nosi
   mnogo manje elemenata po ekranu.
2. **`/services` index hero** (`PageHero.tsx` upotreba, ne sama komponenta) — previše
   sitnica nagurano u jedan `<section>` (metrike + kartice + footnote).
3. **`/projects`** — jedna sekcija viška ("Kako radimo" duplira Timeline).
4. **Legal stranice** (`/brand`, `/privacy`, `/terms`) — nizak prioritet, već minimalne,
   eventualno samo DRY refaktor u zajednički template, bez vizuelnih promena.
5. **`/contact`** — bez akcije, već redizajnirano.
6. **Mrtav kod** (`EffectiveSoftware.tsx`, `Challenges.tsx`) — van glavnog toka redizajna
   stranica (ništa se ne vidi na sajtu), ali vredi ih ukloniti ili eksplicitno označiti kao
   arhivu da se ne pobrka sa aktivnim sekcijama u narednim koracima.

## Napomena (važi za korake 02–07)

**Glow i reveal se ne diraju.** Svaka sekcija gore već koristi isti fazon kao početna:
`glow-accent` orb blur, `theme-card` / `card-lift` hover, hairline gradient na vrhu kartica,
i tekst koji dolazi kroz site-wide `text-reveal` (nijedna od ovih komponenti ne postavlja
sopstvenu text-entrance animaciju niti `data-reveal="off"` osim tamo gde je opravdano —
`ContactForm` direktne linije i `ServiceDeliverables` stack-lista, oba već obeležena).
"Čišćenje" u koracima 02–06 znači: manje sekcija po stranici, manje redundantnih kartica
(Differentiators vs. Capabilities, "Kako radimo" na /projects vs. homepage Timeline),
manje sitnih dekorativnih divova — ne manje glow-a, ne manje reveal efekta, ne diranje
pozadine.
