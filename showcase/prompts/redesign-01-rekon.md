⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-sonnet-5 · EFFORT: medium · MODE: bypassPermissions (autonomno — bez plan/goal, bez odobrenja)

Radiš NOĆU, potpuno AUTONOMNO (bypassPermissions), bez čoveka za stolom. Projekat: Next.js (App
Router) + React + TypeScript + Tailwind + GSAP, repo "enigma-digital". Ovo je KORAK 01/07.

Detaljan spec za ceo redizajn stoji u repou: `enigma-claude-code-promptovi.md` (root). Vizuelna
referenca: `enigma-proto.html` (root). Otvori ih po potrebi.

═══ TVRDA PRAVILA (važe za SVE korake, nikad ne krši) ═══
- NE push-uj NIŠTA. `git push` je zabranjen. NE deploy-uj (bez `vercel`, bez `npx convex deploy`).
  Sve ostaje LOKALNO.
- Radi na grani `feat/redesign-clean` (praviš je u ovom koraku). NE diraj `main`.
- POČETNA SE NE DIRA: app/_components/Hero.tsx, TechSection (components/logo-marquee), Timeline,
  components/sections/disciplines/* — to je referenca kvaliteta, ne menja se.
- POZADINA ostaje ista svuda i GLOW OSTAJE (isti fazon reveal/glow kao početna i kao services dropdown).
  „Čišćenje" znači MANJE sadržaja, sekcija i sitnica — NE manje glowa.
- AGENTS.md važi: minimalne, hirurške izmene; ništa spekulativno; verifikuj pre nego što kažeš gotovo.

═══ ZADATAK 01 — Rekon + grana + plan (skoro bez menjanja koda) ═══
1) Grana i sigurnosni snapshot:
   - `git status`. Ako radno stablo NIJE čisto: `git switch -c feat/redesign-clean` pa
     `git add -A && git commit -m "wip: snapshot pre redizajna"` (da se ništa ne izgubi).
   - Ako je čisto: `git switch -c feat/redesign-clean`.
   - Ako grana već postoji: `git switch feat/redesign-clean`.
2) Identifikuj „staru verziju" kroz GIT ISTORIJU (ne po datumu fajla — klon je pobrisao mtime):
   - Za ključne fajlove u app/(pages)/** (about, brand, contact, privacy, terms, projects, services)
     i app/_components/** koje te stranice koriste: `git log -1 --format="%ci %s" -- <putanja>`.
   - Uporedi sa datumima početnih fajlova (Hero/Timeline/Disciplines/TechSection) da vidiš šta je staro.
3) Za svaku takvu stranicu prebroj sekcije i „elemente" (kartice, čipove, dekorativne divove, hairline
   linije) i predloži sažimanje.
4) Napravi folder `showcase/redesign/` (i `showcase/redesign/review/`) ako ne postoje. Upiši `showcase/redesign/REPORT-01.md`:
   - tabela: stranica | poslednja prava izmena (git) | # sekcija sad | predlog # sekcija | šta spojiti/skratiti
   - koje su stranice očigledno „stara verzija" i idu u redizajn (koraci 02–06)
   - napomenu: glow/reveal se zadržava; smanjuje se sadržaj/sitnice.
5) Commit LOKALNO (bez push): `git add -A && git commit -m "docs(redesign): rekon + plan (REPORT-01)"`.

Ovaj korak NE menja komponente — samo grana + snapshot + izveštaj. Ostavi radno stablo čisto.
