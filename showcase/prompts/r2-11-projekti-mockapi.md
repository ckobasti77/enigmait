⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: xhigh · MODE: bypassPermissions (autonomno; interni plan pre koda)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 11/12, grana feat/redesign-round2. NAJVIZUELNIJI KORAK.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW/REVEAL OSTAJE. TS bez any. i18n [en,sr] za nove niske.
prefers-reduced-motion poštovan. Prvo otvori: app/(pages)/projects/page.tsx (ima ProjectCover/ScopeChips/LiveLink,
featured RevealCard), components/ui/showcase-video.tsx, i manifest constants/projectMockups.ts (korak 10).

PREDUSLOV: ako manifest/slike NEDOSTAJU (korak 10 pao) — koristi postojeći monogram/placeholder korice po projektu
i to jasno zabeleži; ne blokiraj se.

═══ PRVO NAPIŠI KRATAK PLAN na vrh REPORT-11, PA KODIRAJ ═══

═══ ZADATAK 11 — Projekti: klaster device-mockapa po projektu ═══
- Napravi komponentu (npr. `ProjectMockupCluster`) koja po projektu prikazuje KLASTER od 4 device frame-a, sve
  frame-ove izgrađene U KODU (CSS/SVG — bez gotove slike mockapa): veliki ekran (monitor), laptop, tablet, mobilni.
- RASPORED: frame-ovi se PREKLAPAJU (jedan preko drugog), cik-cak levo-desno-levo-desno, jedan ispod drugog, i kod
  centralne vertikale malo UPADAJU jedan drugom u kolonu (blago preklapanje po sredini). Dozvoli da izgleda kao jedna
  kompozicija „na jednom mestu", ne 4 odvojena boksa u redu.
- SADRŽAJ u frame-ovima (iz manifesta, korak 10):
  * laptop → pušta POSTOJEĆI video (ShowcaseVideo, screen-recording koji se skroluje) — kao sad, lazy/poster;
  * veliki ekran, tablet, mobilni → STATIČNE slike odgovarajuće veličine (desktop/tablet/mobile iz manifesta),
    da website ostane lagan i da se lepo čita.
- Zameni sadašnju korice (ProjectCover media) ovim klasterom — svaki projekat dobija „malo veći" mockup klaster.
  Featured projekat može biti najveći. Drži lagano: lazy-mount slike/video (samo kad su u ekranu); ne pravi 6 video-a
  koji svi rade odjednom (video samo za aktivne/u ekranu).
- RESPONSIVE: na uskim ekranima klaster se pojednostavi (npr. samo mobilni+laptop, ili primarna slika) da se ne razbije.
- Zadrži RevealCard/trace/glow i i18n; ne diraj pozadinu.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; svaki projekat ima klaster (frame-ovi u kodu,
preklapanje cik-cak), laptop pušta video, ostali statične slike, lazy-load radi, mobilni se ne lomi, 0 grešaka u konzoli.
- Prolazi: `git add -A && git commit -m "feat(projects): device-mockup klaster po projektu (laptop video + slike)"`.
- Ne prolazi posle razumnog truda ILI izgleda razbijeno: `git restore .` + `git clean -fd` (tvoji fajlovi), vrati staru
  korice, detaljno zabeleži šta je zapelo i kako je izgledalo, exit uredno. Bolje stara korica nego razbijen klaster.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-11.md` (plan na vrhu + urađeno, fajlovi, build/lint, kako izgleda, preskočeno).
