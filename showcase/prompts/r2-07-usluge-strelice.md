⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 07/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW OSTAJE. TS bez any. prefers-reduced-motion poštovan.
Prvo otvori: app/(pages)/services/_components/ServiceCarousel.tsx i blok „Services carousel" u app/globals.css
(klase .arrow i dots). Vizuelni jezik: enigma-proto.html sekcija „03".

═══ ZADATAK 07 — Strelice bez bordera + hover iscrtavanje + scroll preko dots-a ═══
1) STRELICE: skini svaki border i pozadinu — ostaje SAMO plavi caret („<" / „>"), veći nego sad
   (uvećaj svg/stroke). Zadrži fiksnu poziciju na ivicama i hit-area ≥ 44px (nevidljiva zona za klik),
   ali vizuelno je samo plavi chevron. Boja: var(--primary)/var(--cta-line).
2) HOVER ANIMACIJA carета: iz VRHA chevrona (ugao gde se dve linije spajaju) svetlo se iscrtava KA OBA KRAJA
   ISTOVREMENO (niz obe „ruke" chevrona), sa glow-om (cyan). Izvedba: dve linije (dva kraka) sa stroke-dashoffset
   koji na hover ide od vrha ka vrhovima. Za levu strelicu iz njenog vrha, za desnu iz njenog. reduced-motion: bez iscrtavanja.
3) SCROLL PREKO DOTS-a: kad se wheel-uje preko reda tačkica ispod slajdova → menja slajd (dole = sledeći,
   gore = prethodni), debounce da jedan notch = jedan slajd. Ne lomi običan page scroll van dots reda.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; strelice su goli veći plavi caret-i; hover crta
iz vrha ka oba kraja; scroll nad dots-ovima menja slajd; tap target ≥44px; reduced-motion bez animacije; sve teme ok.
- Prolazi: `git add -A && git commit -m "feat(services): plave strelice bez bordera + hover iscrtavanje + scroll dots"`.
- Ne prolazi: `git restore .` + `git clean -fd` (tvoji fajlovi), stablo čisto, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-07.md`.
