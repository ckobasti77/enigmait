⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno — bez plan/goal, bez odobrenja)

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Projekat Next.js+React+TS+Tailwind+GSAP
"enigma-digital". KORAK 06/07 na grani feat/redesign-clean.

Detaljan spec: `enigma-claude-code-promptovi.md` (root) — sekcija **PROMPT 5**. Vizuelna referenca:
`enigma-proto.html` (root). Pročitaj `app/(pages)/projects/page.tsx`.

═══ TVRDA PRAVILA ═══
NE push, NE deploy — samo lokalno na grani feat/redesign-clean. Ne diraj main ni početnu. Pozadina ista;
GLOW OSTAJE (isti fazon kao početna) — čišćenje = manje sekcija/čipova/sitnica, NE manje glowa. i18n:
vrednosti u blok <span>. prefers-reduced-motion poštovan. TS bez `any`. AGENTS.md: minimalne, hirurške.

PREDUSLOV: koristi <Card>/<RevealCard> (korak 03) i novu CtaButton (korak 02) ako postoje; ako ne,
stiliši dosledno inline i zapiši u izveštaj.

═══ ZADATAK 06 — Projekti: mirniji hero + sažimanje ═══
Po PROMPT 5:
- Sažmi 4 sekcije na 2: (1) hero + odmah mreža projekata, (2) jedan kompaktan završni CTA. „Kako radimo"
  izbaci ili sažmi u jedan red od 3 sitna koraka u hero-u.
- HERO: eyebrow + kratak jasan H1 + 1 rečenica lede + 2 CTA (nova trace dugmad) + do 3 proof metrike kao
  sitne pločice (vrednost u blok <span>). ZADRŽI glow — ne skidaj ga.
- LISTA: prvi projekat kao veliki featured <RevealCard>, ostali u mreži 2 kolone kroz <RevealCard>. Zadrži
  ShowcaseVideo/monogram fallback. Manje čipova po kartici (max 3), više vazduha.

VERIFIKACIJA (obavezno pre commit-a): `npm run build` i `npm run lint` prolaze; hero mirniji; prvi projekat
istaknut; sva dugmad = nova trace varijanta; kartice = novi primitiv.
- Ako prolazi: `git add -A && git commit -m "feat(projects): mirniji hero + sažete sekcije + trace kartice"`.
- Ako NE prolazi: vrati sve izmene ovog koraka (`git restore .` pa `git clean -fd` za tvoje nove fajlove),
  ostavi stablo čisto, zapiši uzrok u izveštaj, završi uredno.

IZVEŠTAJ: `showcase/redesign/REPORT-06.md` (urađeno, fajlovi, build/lint, preskočeno + zašto).
