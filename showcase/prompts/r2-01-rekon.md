⚙ PODEŠAVANJA (runner postavlja preko flagova; ovde radi jasnoće):
   MODEL: claude-sonnet-5 · EFFORT: medium · MODE: bypassPermissions (autonomno — bez plan/goal, bez odobrenja)

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Next.js App Router + React + TS + Tailwind + GSAP,
repo "enigma-digital". KRUG 2 (round 2). Ovo je KORAK 01/12.

═══ ZADATAK 01 — Grana feat/redesign-round2 + priprema + plan ═══
1) Grana: kreni od round-1 grane.
   - `git switch feat/redesign-clean` (round-1 rad je tu). Ako radno stablo nije čisto:
     `git stash` NEMOJ — umesto toga `git status` i ako ima nešto necommit-ovano, `git add -A && git commit -m "wip: snapshot pre round2"`.
   - `git switch -c feat/redesign-round2` (ako već postoji: `git switch feat/redesign-round2`).
2) Potvrdi da round-1 komponente postoje (od njih zavise koraci 02–11); zabeleži u izveštaj koje su nađene:
   - components/ui/trace-button.tsx, components/ui/cta-button.tsx (look prop), components/ui/card.tsx,
     hooks/useBorderTraceReveal.ts, app/(pages)/services/_components/ServiceCarousel.tsx i ServicePanel.tsx,
     tokeni --cta-line/--cta-sweep i blok .trace-cta u app/globals.css.
   - Ako neka NEDOSTAJE, jasno napiši u izveštaj (koraci koji zavise od nje moraju to da provere pre rada).
3) Napravi folder `showcase/redesign-round2/` (i `showcase/redesign-round2/review/`) ako ne postoje.
4) Upiši `showcase/redesign-round2/REPORT-01.md`: potvrda grane, spisak nađenih round-1 komponenti/tokena,
   i kratak plan koraka 02–11 (jedna linija po koraku).
5) Commit LOKALNO (bez push): `git add -A && git commit -m "chore(round2): grana + priprema (REPORT-01)"`.

TVRDA PRAVILA (važe za ceo krug): NE push, NE deploy — samo lokalno na feat/redesign-round2. Pozadina ostaje
ista, GLOW OSTAJE. Ovaj krug SME da menja početnu, ali samo kako zadaci traže. Sačuvaj postojeće varijante.
Ovaj korak NE menja komponente — samo grana + folder + izveštaj. Ostavi stablo čisto.
