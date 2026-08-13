⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno; interni plan pre koda)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 03/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno na feat/redesign-round2. Pozadina ista; GLOW OSTAJE. TS bez any.
prefers-reduced-motion poštovan. AGENTS.md: minimalne izmene. Prvo otvori: components/EnigmaLogo.tsx,
app/_components/LogoMark3D.tsx, components/sections/hero/HeroCube.tsx, heroCube.shaders.ts.

═══ PRVO NAPIŠI KRATAK PLAN (5–8 linija) na vrh REPORT-03, PA KODIRAJ ═══

═══ ZADATAK 03 — Emblem loga = 3D kocka, statična, sa brzim iscrtavanjem u loop-u ═══
- Emblem loga (mark u EnigmaLogo — gde god stoji: navbar, footer) postaje 3D KOCKA u duhu hero kocke, ALI:
  * NE rotira. Stoji u FIKSNOJ orijentaciji koja liči na trenutni 2D emblem (uskladi ugao gledanja da podseća
    na sadašnji emblem). Veličina i pozicija u layoutu ostaju iste kao sad.
- ANIMACIJA = SAMO ISCRTAVANJE IVICA pa NESTAJANJE, u loop-u:
  * cela ivica/wireframe se iscrta (stroke-draw) MNOGO brže nego na hero kocki — kratka sekvenca koja „ima smisla",
  * BEZ „zmijice"/putujuće crtice: nije trag koji juri, nego se linije iscrtaju pa IZBLEDE za isto vreme,
  * pa opet: draw → fade-out → draw → fade-out, u krug beskonačno. To je cela animacija. Boje kao sad/hero.
- PREPORUKA IZVEDBE (tvoj izbor, ali obrazloži u planu): laka SVG/CSS izo-kocka sa stroke-dashoffset iscrtavanjem
  je lakša i preciznija od WebGL-a za mali emblem koji stoji u navbaru i footeru (nema WebGL konteksta po instanci).
  Ako biraš WebGL kao hero, koristi jednu laku deljenu instancu. Cilj: crisp, lagano, tačan draw→fade loop.
- prefers-reduced-motion: statična kocka (iscrtana), bez animacije. Ne rotira ni na hover.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; emblem je 3D kocka u fiksnoj orijentaciji;
draw→fade loop radi brzo, bez zmijice; nema regresije u navbaru/footeru; reduced-motion statična.
- Prolazi: `git add -A && git commit -m "feat(logo): 3D kocka emblem sa brzim draw→fade loop-om"`.
- Ne prolazi posle razumnog truda: `git restore .` + `git clean -fd` (tvoji fajlovi), stablo čisto,
  ostavi stari emblem netaknut, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-03.md` (plan na vrhu + urađeno, fajlovi, build/lint, preskočeno).
