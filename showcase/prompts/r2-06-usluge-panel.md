⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 06/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW/REVEAL OSTAJE. NE diraj SEO rute
(services/<slug>/page.tsx). i18n text-reveal (tekst u blok <span>). TS bez any. AGENTS.md: minimalne izmene.
Prvo otvori: app/(pages)/services/_components/ServicePanel.tsx (sadrži: eyebrow + brojač „01 / 06", h1, lede,
3 capability stavke sa ikonicom, 1 CTA, 3 proof broja kao dl iznad tanke linije, ServiceModelStage desno).

═══ ZADATAK 06 — Očisti unutrašnjost slajda usluge (levi blok) ═══
Na SVIM uslugama (isti ServicePanel), levi blok postaje čistiji:
1) SKINI gornji eyebrow + brojač „01 / 06" — skroz.
2) SKINI donji deo: 3 proof broja (dl) + tanku liniju iznad njih — skroz.
3) 3 capability stavke (ikonica + tekst) PREMESTI NA DNO levog bloka, u HORIZONTALNI red (jedna do druge),
   tačno tamo gde je bila proof linija. Zadrži postojeći stil tih stavki (ikonica + labela) — sviđa mu se.
   - Dozvoli OVERFLOW: red sme malo da „iscuri" van širine levog bloka (overflow-visible); ispod 3D modela ima
     mesta pa ne upadaju u model — i lepo je ako malo strči. Na mobilnom neka se prelome umesto da razbiju layout.
Finalni levi blok: h1 → lede → CTA → (dno) horizontalni red od 3 capability stavke.
4) OPCIONO (proba): skini pun background + border panela (RevealCard omotač) da se vidi globalna pozadina/glass;
   ZADRŽI trace reveal + glow. Ako bez pozadine izgleda razbijeno/nečitko, vrati SUPTILAN glass umesto punog card bg-a.
   Zapiši u izveštaj koju si varijantu ostavio i kako izgleda.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; nema eyebrow-a ni proof reda; 3 capability
na dnu horizontalno (overflow ok); reveal/glow rade; sve 6 usluga i dalje rade u carousel-u; reduced-motion ok.
- Prolazi: `git add -A && git commit -m "feat(services): čist slajd — bez eyebrow/proof, capability čipovi na dnu"`.
- Ne prolazi: `git restore .` + `git clean -fd` (tvoji fajlovi), stablo čisto, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-06.md`.
