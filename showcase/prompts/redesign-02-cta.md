⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno — bez plan/goal, bez odobrenja)

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Projekat Next.js+React+TS+Tailwind+GSAP
"enigma-digital". KORAK 02/07 na grani feat/redesign-clean.

Detaljan spec: `enigma-claude-code-promptovi.md` (root) — sekcija **PROMPT 1**. Vizuelna referenca za
izgled/animaciju: `enigma-proto.html` (root), klase `.cta-a` i `@keyframes sweep`. Pročitaj ih pre rada.

═══ TVRDA PRAVILA (nikad ne krši) ═══
NE push, NE deploy (bez vercel / `npx convex deploy`) — samo lokalno na grani feat/redesign-clean.
Ne diraj main ni početnu (Hero/TechSection/Timeline/Disciplines). Pozadina ista; GLOW OSTAJE (isti
fazon kao početna + services dropdown) — čišćenje je MANJE sadržaja/sitnica, NE manje glowa. Sačuvaj
postojeće varijante (liquid-glass i "enigma" dugme). Svaki NOVI CSS token dodaj u SVE teme u globals.css.
Poštuj i18n text-reveal (tekst u blok <span>), prefers-reduced-motion, TS bez `any`. AGENTS.md:
minimalne, hirurške izmene.

═══ ZADATAK 02 — Novo CTA „Trace glass" (varijanta A) ═══
Uradi tačno ono što piše u PROMPT 1: nova komponenta `components/ui/trace-button.tsx` (plavi border +
svetlosni streak na hover + cyan glow, prati DNK kartica), token `--cta-line` u sve tri palete, i
`components/ui/cta-button.tsx` da po defaultu koristi novu TraceButton uz prop `look?: "trace" | "glass"`
(default "trace"; "glass" = stari LiquidButton). Pošto sva CTA idu kroz CtaButton, ceo sajt automatski
dobija novi izgled. Reduced-motion: bez sweep kretanja.

VERIFIKACIJA (obavezno pre commit-a): `npm run build` i `npm run lint` prolaze; `<CtaButton look="glass">`
i dalje daje stari izgled; radi u sve tri teme.
- Ako prolazi: `git add -A && git commit -m "feat(cta): trace-glass CTA varijanta (A), stari stil zadržan"`.
- Ako NE prolazi posle razumnog truda: vrati sve izmene ovog koraka (`git restore .` pa `git clean -fd`
  samo za fajlove koje si TI dodao), ostavi stablo čisto, zapiši uzrok u izveštaj, završi uredno.

IZVEŠTAJ: upiši `showcase/redesign/REPORT-02.md` (urađeno, fajlovi, build/lint status, šta preskočeno i zašto).
