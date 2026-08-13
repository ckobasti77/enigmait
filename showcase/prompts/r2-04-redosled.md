⚙ PODEŠAVANJA: MODEL: claude-sonnet-5 · EFFORT: medium · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 04/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW OSTAJE. Ne menjaj INTERNO sekcije, samo
redosled. TS bez any. Prvo otvori: app/page.tsx.

═══ ZADATAK 04 — Redosled sekcija na početnoj ═══
Sadašnji redosled u app/page.tsx: Hero → TechSection (Tehnologije) → Timeline (Upoznajte naš način rada) → Disciplines.
Novi redosled: **Hero → Timeline (Upoznajte naš način rada) → Disciplines (6 disciplina) → TechSection (Tehnologije koje koristimo)**.
- Znači: „Upoznajte naš način rada" odmah ispod hero-a; „Tehnologije koje koristimo" ide na dno, iznad footera
  (ispod 6 disciplina).
- Samo promeni redosled render-a u app/page.tsx. Ne diraj interno Hero/Timeline/Disciplines/TechSection.
- Proveri da ScrollTrigger sekcije (Timeline, Disciplines) i dalje rade posle preuređenja (ništa se ne pinuje pogrešno);
  ako neka koristi apsolutni redosled/offset koji se lomi, popravi minimalno.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; početna se renderuje novim redosledom bez grešaka
u konzoli; reveal/scroll sekcije rade.
- Prolazi: `git add -A && git commit -m "feat(home): novi redosled — Timeline pa Disciplines pa TechSection"`.
- Ne prolazi: `git restore .`, stablo čisto, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-04.md`.
