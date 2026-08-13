⚙ PODEŠAVANJA: MODEL: claude-sonnet-5 · EFFORT: medium · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 08/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW OSTAJE. i18n: nove niske u lib/i18n.ts kao [en, sr].
TS bez any. Koristi round-1 CtaButton (components/ui/cta-button.tsx). Prvo otvori: ServiceCarousel.tsx (FAQ je ispod
carousela) ili ServicePageTemplate.tsx da nađeš gde se renderuje FAQ.

═══ ZADATAK 08 — Mala CTA sekcija ISPOD FAQ-a ═══
- Ispod FAQ sekcije dodaj malu sekciju, odvojenu SAMO razmakom (bez teškog bordera/kartice, minimalno).
- Sadržaj: jedan naslov + jedno CTA dugme, JEDNO PORED DRUGOG horizontalno (na mobilnom se prelome jedno ispod drugog).
  * Naslov (npr.): „Imate specifično pitanje?" (i18n [en,sr]).
  * Dugme: TraceButton tekst „Pitajte nas" → href="/contact".
- Uklopi u postojeći sistem (isti CTA, boje, tipografija). Kratko i čisto.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; sekcija je ispod FAQ-a; naslov+dugme horizontalno;
dugme vodi na /contact; EN/SR prevod radi; nije razbijeno na mobilnom.
- Prolazi: `git add -A && git commit -m "feat(services): mala kontakt-CTA sekcija ispod FAQ-a"`.
- Ne prolazi: `git restore .` + `git clean -fd` (tvoji fajlovi), stablo čisto, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-08.md`.
