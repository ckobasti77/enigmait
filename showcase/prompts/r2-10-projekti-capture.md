⚙ PODEŠAVANJA: MODEL: claude-sonnet-5 · EFFORT: high · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 10/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Ovo je CAPTURE korak (koristi mrežu — sajtovi su živi). TS bez any.
Prvo otvori: constants/projects.ts (svaki projekat ima .url), showcase.config.json i showcase/ pipeline (već postoji
Playwright capture iz prošlog lanca — reuse pristup), components/ui/showcase-video.tsx (postojeći video po projektu).

═══ ZADATAK 10 — Auto-capture screenshotova sajtova na 4 veličine (za mockape) ═══
Za SVAKI projekat iz constants/projects.ts uslikaj njegov živi sajt (project.url) na 4 viewport-a i sačuvaj optimizovane slike:
  * desktop-large:  ~1920px šir (full-page ili gornji fold — vidi dole), sačuvaj kao webp, cap širine ~1600px
  * laptop:         ~1440px  (poster/fallback; laptop u mockapu ionako pušta postojeći video)
  * tablet:         ~834px portret, webp, cap ~800px
  * mobile:         ~390px,  webp, cap ~400px
- Snimi gornji deo stranice (viewport ili prvih ~1.5 ekrana), NE ceo beskonačan full-page (da slike ostanu lagane).
- Sačuvaj u `public/mockups/<projectId>/{desktop,laptop,tablet,mobile}.webp`. Drži ukupnu težinu malom (webp, kvalitet ~72,
  razumne dimenzije). Ako projekat već ima video, laptop slika je samo poster/fallback.
- Napravi manifest `constants/projectMockups.ts`: mapa projectId → { desktop, laptop, tablet, mobile } putanje (i marker
  da li laptop koristi video). Korak 11 čita ovaj manifest.
- Robusnost: ako se neki sajt ne učita / timeout, preskoči tu sliku, upiši placeholder u manifest i zabeleži u izveštaj.
  Postavi duže timeout-e za navigaciju (sajtovi znaju da budu spori).

VERIFIKACIJA (pre commit-a): slike postoje u public/mockups/*, manifest se importuje bez greške, npm run build + lint (+ tsc)
prolaze. (Slike su statički asset — ne moraju u review screenshot.)
- Prolazi: `git add -A && git commit -m "chore(projects): auto-capture mockup slike (4 veličine) + manifest"`.
- Ne prolazi / previše sajtova palo: sačuvaj šta si uspeo + manifest sa placeholder-ima, zabeleži u izveštaj, exit uredno
  (korak 11 ume da radi sa placeholder-ima). NE revert-uj uspešno uslikane slike bez razloga.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-10.md` (koji sajtovi uslikani/pali, veličine, ukupna težina).
