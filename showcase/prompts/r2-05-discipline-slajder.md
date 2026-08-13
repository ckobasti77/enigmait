⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: xhigh · MODE: bypassPermissions (autonomno; interni plan pre koda)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 05/12, grana feat/redesign-round2. NAJTEŽI KORAK NA POČETNOJ.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW OSTAJE. TS bez any. prefers-reduced-motion poštovan.
AGENTS.md: minimalne izmene. Prvo otvori: components/sections/disciplines/* (Disciplines.tsx, DisciplineStage.tsx,
DisciplineStepper.tsx, useDisciplineIndex.ts, DisciplinesSection.tsx) I uzor:
app/(pages)/services/_components/ServiceCarousel.tsx (mehanika slajdera je već rešena tamo — reuse obrazac).

═══ PRVO NAPIŠI KRATAK PLAN na vrh REPORT-05, PA KODIRAJ ═══ (ako je preveliko: 5a slajder skelet + 5b scroll/tooltip; ali završi obe)

═══ ZADATAK 05 — 6 disciplina (3D modeli) → horizontalni slajder istog tipa kao usluge ═══
- Pretvori scroll-scrub „stepper" disciplina u HORIZONTALNI SLAJDER kao na uslugama (isti push obrazac iz ServiceCarousel):
  * prošireni AKTIVNI dots (kao services dots — aktivna tačka izdužena),
  * animiran push prelaz jedan→drugi,
  * BESKONAČNO: posle zadnjeg modela ide prvi, u oba smera (modul nad redosledom disciplina).
- SCROLL preko modela: običan wheel scroll NAD stage-om menja slajd (dole = sledeći, gore = prethodni), debounce
  da jedan „notch" = jedan slajd. Van stage-a normalan page scroll. (Ovo je glavna interakcija koju traži.)
- TUTORIAL TOOLTIP: mali hint („Skrolujte ovde ⇆" na desktopu, „Prevucite" na mobilnom) koji se pojavljuje na interval
  dok korisnik NIJE interagovao: prvi put ~6s pošto stage uđe u ekran, pa ponovo svakih ~20s dok miruje; SAKRIJ ga
  čim korisnik skroluje/prevuče/klikne dot. Nežno se pojavi/nestane (glow u fazonu sajta).
- Zadrži postojeći 3D model rendering unutar slajda; NE remountuj WebGL bez potrebe (key po disciplini, lazy montiranje
  aktivnog + suseda, kao ServiceCarousel). Ukloni staro pinovanje/scrub ako smeta novom slajderu.
- prefers-reduced-motion: trenutna zamena bez klizanja; mobilni: swipe. Dostupnost: dots aria-current, tasteri ← → opciono.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; slajder radi (dots, push, beskonačno oba smera);
wheel nad modelom menja slajd; tooltip se pojavljuje na interval i krije na interakciju; reduced-motion i mobilni rade;
0 grešaka u konzoli; WebGL se ne remountuje po koraku.
- Prolazi: `git add -A && git commit -m "feat(home): discipline kao beskonačan slajder + scroll/tooltip"`.
- Ne prolazi posle razumnog truda: `git restore .` + `git clean -fd` (tvoji fajlovi), stablo čisto, ostavi staru
  sekciju netaknutu, detaljno zapiši šta je zapelo, exit uredno (lanac nastavlja).

IZVEŠTAJ: `showcase/redesign-round2/REPORT-05.md` (plan na vrhu + urađeno, fajlovi, build/lint, preskočeno).
