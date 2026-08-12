⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno — bez plan/goal, bez odobrenja)

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Projekat Next.js+React+TS+Tailwind+GSAP
"enigma-digital". KORAK 03/07 na grani feat/redesign-clean.

Detaljan spec: `enigma-claude-code-promptovi.md` (root) — sekcija **PROMPT 2**. Vizuelna referenca:
`enigma-proto.html` (root), sekcija „02" (klase `.rcard`, `.trace`, `@keyframes streak`). Obavezno prvo
pročitaj `app/_components/ProcessCard.tsx` i `lib/borderTrace.ts` (odatle vadiš deljivu trace logiku).

═══ TVRDA PRAVILA (nikad ne krši) ═══
NE push, NE deploy — samo lokalno na grani feat/redesign-clean. Ne diraj main ni početnu. Pozadina ista;
GLOW/REVEAL OSTAJE (isti fazon kao process kartice na početnoj — trace + prateći glow/halo se ZADRŽAVA).
Čišćenje = manje sitnica/dupliranih linija, NE manje glowa. Novi token -> u sve teme u globals.css.
Poštuj prefers-reduced-motion (usePrefersReducedMotion({includeDataAndBattery:false})) — tada sadržaj
odmah vidljiv, bez animacije. Meri border-box (ne content-box) za trace. i18n: tekst u blok <span>.
TS bez `any`. AGENTS.md: minimalne, hirurške izmene.

═══ ZADATAK 03 — Card primitiv + trace reveal (jedan izvor istine) ═══
Po PROMPT 2: 
1) Izvuci deljivu logiku u `hooks/useBorderTraceReveal.ts` (ResizeObserver border-box +
   buildBorderTracePaths + ScrollTrigger jednokratni reveal, isti tempo kao ProcessCard: TRACE_DASH,
   ease power1.inOut). Reduced-motion => bez animacije.
2) Napravi `components/ui/card.tsx`: <Card> (statični plavi border var(--border-strong), theme-card,
   suptilan cyan hairline, hover card-lift + glow) i <RevealCard> (obmota Card hookom + SVG trace sloj).
   Reveal glow OSTAJE — isti fazon kao početna. Bez per-kartica dodatnih glow-kugli SAMO ako dupliraju
   isti efekat; osnovni reveal glow se zadržava.
3) Primeni (isti sadržaj, novi primitiv) na: ServiceCapabilities, projects kartice, PageHero highlights.
   Manje čipova/sitnica gde je pretrpano — ali reveal/glow ostaje.

VERIFIKACIJA (obavezno pre commit-a): `npm run build` i `npm run lint` prolaze; kartice imaju stalan
plavi border i „unlock" trace na scroll; reduced-motion => odmah vidljive.
- Ako prolazi: `git add -A && git commit -m "feat(ui): Card + RevealCard primitiv sa trace reveal"`.
- Ako NE prolazi: vrati sve izmene ovog koraka (`git restore .` pa `git clean -fd` za tvoje nove fajlove),
  ostavi stablo čisto, zapiši uzrok u izveštaj, završi uredno.

IZVEŠTAJ: `showcase/redesign/REPORT-03.md` (urađeno, fajlovi, build/lint, preskočeno + zašto).
