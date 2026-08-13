# REPORT-04 — Redosled sekcija na početnoj

**Grana:** feat/redesign-round2
**Korak:** 04/12

## Zadatak

Promeniti redosled sekcija na `/` iz Hero → TechSection → Timeline → Disciplines
u Hero → Timeline → Disciplines → TechSection, tako da "Upoznajte naš način rada"
bude odmah ispod hero-a, a "Tehnologije koje koristimo" ide na dno stranice,
iznad footera.

## Izmena

`app/page.tsx` — samo redosled JSX render-a, ništa interno u komponentama:

```diff
 <Hero />
-<TechSection />
 <Timeline />
 <Disciplines />
+<TechSection />
```

## Provera ScrollTrigger / scroll logike

Pre commit-a proverio sam da li Timeline, Disciplines, TechSection ili Hero
zavise od apsolutne pozicije na strani, fiksnih pixel offset-a ili susedstva
sa specifičnom sekcijom:

- **Timeline.tsx** — `ScrollTrigger` trigeruje na `.process-rail` (sopstveni
  child), `start: "top center"` / `end: "bottom center"`, scrub. Self-relative.
- **ProcessCard.tsx** — per-card unlock koristi `ScrollTrigger.create({ trigger: row, start: "center 67%" })`,
  gde je `row` sopstveni `rowRef`. Viewport-relative %, ne page-absolute.
- **components/sections/disciplines/** — nema `ScrollTrigger`; stepper
  interakcija (`useDisciplineIndex`) hvata wheel/keyboard/touch direktno na
  sopstvenom column ref-u, ne preko scroll pozicije strane.
- **components/logo-marquee/TechSection.tsx** — nema GSAP/ScrollTrigger,
  čist CSS marquee keyframe loop + mouse-tooltip logika scoped na
  `sectionRef.getBoundingClientRect()`.
- **Hero.tsx** — nema scroll logiku vezanu za ono što sledi.
- **globals.css `--process-card-*`** — čisti layout tokeni (širina, radius,
  connector offset) unutar Timeline sekcije, bez `nth-child` ili
  order-dependent pravila vezanih za redosled sekcija na strani.

Zaključak: nijedna sekcija ne zavisi od apsolutnog redosleda/pozicije — sve
koriste self-relative trigger ref-ove i viewport-relative `start`/`end`
vrednosti. Nije bilo potrebe za dodatnim izmenama van `app/page.tsx`.

## Verifikacija

- `npm run build` — ✅ prošao (Next.js 16.2.6 + Turbopack), TypeScript čist,
  svih 16 statičkih ruta generisano bez grešaka.
- `npm run lint` — ✅ prošao, bez upozorenja/grešaka.
- Nema promena van `app/page.tsx` (`git status` potvrđuje samo taj fajl).

## Status

Prolazi verifikaciju. Commit kreiran na `feat/redesign-round2`, bez push-a.
