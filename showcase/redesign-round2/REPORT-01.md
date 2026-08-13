# REPORT-01 — Grana feat/redesign-round2 + priprema

## Grana
- Pošao od `feat/redesign-clean` (round-1 rad).
- Radno stablo nije bilo čisto: 13 untracked fajlova (`run-round2-overnight.ps1` + `showcase/prompts/r2-01..12.md`).
  Committed lokalno na `feat/redesign-clean` kao `wip: snapshot pre round2` (c7257ef).
- Kreirana nova grana `feat/redesign-round2` iz `feat/redesign-clean`. Trenutno na njoj.

## Round-1 komponente/tokeni — provera
Sve nađeno, ništa ne nedostaje:

- `components/ui/trace-button.tsx` — FOUND
- `components/ui/cta-button.tsx` — FOUND (ima `look?: "trace" | "glass"` prop, default `"trace"`)
- `components/ui/card.tsx` — FOUND
- `hooks/useBorderTraceReveal.ts` — FOUND
- `app/(pages)/services/_components/ServiceCarousel.tsx` — FOUND
- `app/(pages)/services/_components/ServicePanel.tsx` — FOUND
- `--cta-line` / `--cta-sweep` tokeni — FOUND, definisani u sve tri palete (dark ~L202-203, light ~L386-387, alt/green ~L1069-1070)
- `.trace-cta` blok — FOUND u `app/globals.css` (~L1924-1991), uključuje `::before` sweep, hover/focus/active stanja i `@keyframes trace-cta-sweep`

Zaključak: koraci 02-11 mogu bezbedno da se oslanjaju na sve navedene komponente/tokene — nema blokera.

## Folderi
- `showcase/redesign-round2/` — kreiran
- `showcase/redesign-round2/review/` — kreiran

## Plan koraka 02-11 (kratko, jedna linija po koraku)
- 02 — CTA/nav: primena `trace-cta` / `cta-button look` konzistentno kroz navbar i ključne CTA-e.
- 03 — Logo kocka: 3D/logo mark redesign iteracija (kocka koncept).
- 04 — Redosled sekcija: preslaganje redosleda sekcija na početnoj po review nalazima.
- 05 — Discipline slajder: unapređenje slajdera disciplina (interakcija/tempo).
- 06 — Usluge panel: refinman `ServicePanel` layouta i sadržaja.
- 07 — Usluge strelice: navigacione strelice za `ServiceCarousel`.
- 08 — Usluge CTA: CTA blok na kraju usluga sekcije/stranica.
- 09 — Kontakt: redesign/kontakt sekcije i forme.
- 10 — Projekti (capture): priprema/hvatanje sadržaja za sekciju projekata.
- 11 — Projekti (mock API): povezivanje projekata sekcije sa mock API izvorom podataka.
- 12 — Review: finalni pregled celog kruga 2, screenshotovi u `showcase/redesign-round2/review/`, REPORT-FINAL.

## Tvrda pravila (važe za ceo krug)
- Bez push, bez deploy — samo lokalno na `feat/redesign-round2`.
- Pozadina ostaje ista, glow ostaje.
- Ovaj krug sme da menja početnu, ali samo kako zadaci traže; sačuvati postojeće varijante.
- Ovaj korak (01) nije menjao nijednu komponentu — samo grana + folderi + izveštaj.
