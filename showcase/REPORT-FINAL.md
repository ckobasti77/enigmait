# REPORT-FINAL — Neprijateljski review celog lanca (KORAK 5)

Datum: 2026-08-11. Pisano za čitanje uz prvu kafu, bez pretpostavke da si pratio ijedan korak.

## 1. Stanje u jednoj rečenici

Tehnički je gotovo i stabilno — lint/tsc/build prolaze, stranica `/projects` radi tačno po
zahtevima u obe teme, oba jezika i oba viewporta — ali **ne puštaj u produkciju dok ne potvrdiš
tačku 1 iz odeljka „Šta traži tvoju odluku"** (autorstvo šest sajtova) i ne odlučiš šta sa
klipovima koji probijaju budžet težine.

## 2. Šta je urađeno, po koracima

- **KORAK 1 (capture):** Snimljeno svih 6 aktivnih sajtova, 270 frejmova × 2 varijante
  (desktop 1440×900, mobile 390×844) po projektu — 3240 frejmova, ~223 MB, van git-a
  (`showcase/captures/` je u `.gitignore`). Automatsko skraćivanje skrol-prozora gde je
  stranica preduga, `content.txt` sa stvarnim tekstom svakog sajta. Kadenca vraćena na
  30fps/9s. `jeveux-travel` preskočen (URL 404).
- **KORAK 2 (encode):** `scripts/encode-showcase.mjs` + `ffmpeg-static`. Za svaki projekat
  5 fajlova u `public/showcase/<id>/`: `card.mp4`, `card.webm`, `card-sm.mp4`,
  `card-sm.webm`, `poster.webp`. Ukupno 25 MB. Budžetska petlja crf 23→26→29; 4/6 velikih
  mp4 i 1/6 malih probijaju budžet i na crf 29 (vidi odeljak 4).
- **KORAK 3 (sadržaj):** Sva četiri izmišljena case study-ja (Helios Labs, Orbit Airlines,
  Northwind Bank, Mercury Collective), oba izmišljena testimonijala (Amelia Rhodes, Jonas
  Richter) i sve tri izmišljene statistike (+120% / 12 / 97%) uklonjeni. Zamena: šest
  stvarnih projekata u `constants/projects.ts`, tekst pisan isključivo iz onoga što sajtovi
  sami kažu, bez ijednog broja. Prevodi u `lib/i18n.ts`.
- **KORAK 4 (video u karticama):** `components/ui/showcase-video.tsx` — `preload="none"`,
  `src` se kači tek na kadar + `load` + idle + prvi skrol; pauza van kadra i na skrivenom
  tabu; reduced-motion ne povlači nijedan bajt videa; ispod 768px ide mali encode.
  Mikro-potpis namerno izostavljen (obrazloženje u REPORT-04). Bez media zapisa kartica
  zadržava dizajnirani cover sa monogramom.
- **KORAK 5 (ovaj):** Sve tvrdnje iz izveštaja proverene na artefaktima, tri tehničke
  provere prolaze, 8 screenshotova napravljeno i pregledano, ponašanje videa izmereno u
  pravom browseru, nađeni problemi popravljeni (odeljak 3), commit na `feat/project-showcase`.

## 3. Šta je puklo i šta sam popravio

1. **`lib/i18n.ts` je i dalje sadržao izmišljen sadržaj** — testimonijal „Enigma didn't
   just present a new interface…" i potpis „VP Product, Northwind Ventures". REPORT-03 ga je
   prijavio kao mrtav unos, ali ga nije uklonio, a zahtev ovog koraka je nula pogodaka.
   Proverio sam da ga nijedna komponenta ne koristi i obrisao oba reda. Posle toga pretraga
   za `Helios`, `Orbit Airlines`, `Northwind`, `Mercury Collective`, `Amelia Rhodes`,
   `Jonas Richter`, `+120%`, `97%` pogađa **samo** showcase dokumentaciju (izveštaje i
   promptove koji opisuju šta je uklonjeno) — u kodu sajta nula.
2. **Lint upozorenje iz KORAKA 2** — nekorišćen parametar `label` u
   `scripts/encode-showcase.mjs`. Uklonjen iz potpisa funkcije i oba poziva; lint je sada
   potpuno čist (0 grešaka, 0 upozorenja).
3. **`favicon.ico` 404 u konzoli na svakoj stranici.** Postojalo i pre ovog lanca, ali
   zahtev je bio konzola bez grešaka. Napravljen `app/icon.png` (64×64, 8.4 KB, umanjeni
   postojeći `public/logos/logo-emblem.png` — nikakav nov dizajn); Next ga sam servira i
   upisuje `<link rel="icon">`, pa browser više ne traži `/favicon.ico`. Provereno posle
   rebuild-a: konzola na 1440×900 je potpuno čista.
4. **`.playwright-mcp/` dodat u `.gitignore`** — session logovi browser alata su se gomilali
   kao untracked fajlovi (stotine), a stari su već bili obrisani sa diska. Bez ovoga bi
   commit poneo gomilu dnevnika bez vrednosti.

## 4. Šta traži tvoju odluku

1. **Autorstvo i obim posla (blokada za objavu).** Cela stranica tvrdi „Sajtovi koje smo
   izradili", a `scope` pilule tvrde šta je tačno bio naš posao — izvedeno iz onoga što
   sajtovi vidljivo rade, ne iz ugovora. Opcije: (a) potvrdi da je svih šest naš rad u
   navedenom obimu i stranica ide takva kakva je; (b) za sporne projekte suzi `scope` ili
   izbaci karticu.
2. **4/6 `card.mp4` (i gbmt `card-sm.mp4`) probijaju budžet težine** i posle maksimalna dva
   crf bump-a (1.5 MB / 500 KB; najveći je gbmt sa 2.8 MB). U praksi: četiri kartice u kadru
   povuku ~8.9 MB webm-a. Sadržaj je 9 s stvarnog skrola, ne loop — H.264/VP9 to ne mogu
   jače da stisnu bez vidljive degradacije. Opcije: (a) prihvati težinu — video se ionako
   vuče tek na skrol i samo za kartice u kadru; (b) skrati `durations.card` sa 9 na ~6 s i
   ponovi encode (manje jedinstvenog sadržaja po klipu → manji fajl, ali klip prikazuje manje
   stranice).
3. **Tri projekta stoje na `*.vercel.app` adresama** (`the-original-way`, `fides-gradnja`,
   `digist`), a stranica ih zove „sajt uživo". Opcije: (a) upiši prave klijentske domene ako
   postoje; (b) ostavi vercel adrese, ali ublaži formulaciju za te tri kartice.
4. **Preload upozorenja za logotipe navbara** (`logo-emblem.png`, `logo-text.png`) na uskim
   viewportima — postojeće, nije iz ovog lanca. Opcije: (a) ignoriši (bezopasno je);
   (b) zaseban mali zadatak: preload vezati za breakpoint ili skinuti `priority` sa
   varijante koja se na mobilnom ne renderuje.
5. **`ablux-travel` desktop klip je tačno na pragu brzine skrola** (45 px/frejm). Ako ti u
   pregledu deluje prebrzo: spusti `maxPxPerFrame` na 40 u configu i ponovi capture+encode
   za taj projekat; inače ostavi.

## 5. Kontrolna lista neproverljivih tvrdnji koje su OSTALE na sajtu (iz REPORT-03)

Na `/projects`:
- „Sajtovi koje smo izradili" + svaka `scope` stavka — tvrdnja o autorstvu i obimu (tačka 1 gore).
- „adresa vodi na sajt uživo" / „možete otvoriti i proveriti" — za tri vercel.app adrese (tačka 3 gore).
- `lady-gaga-studio` → „Upit za termin" — ne zna se da li je iza dugmeta forma, kalendar ili telefon.
- `digist` → „Kontakt forma" — možda je samo `mailto:`.
- Obećanja o načinu rada: „ostajemo dostupni za izmene…", „Vraćamo se sa predlogom opsega,
  rokom i cenom", „Prvo razumemo posao…" — neko iz firme mora da stoji iza njih.

Van `/projects` (nije diran, isti tip problema):
- `app/(pages)/services/page.tsx`: „30+ Isporučena lansiranja", „8 wks Prosečna isporuka",
  „98% Zadržavanje klijenata".
- `constants/services/*.ts`: ~24 statistike tipa „95% Usklađenost stakeholder-a",
  „+40% Prosečan rast konverzije" na šest stranica usluga. **Ako je `/projects` čišćen jer
  izmišljeni brojevi ne smeju napolje, ovo traži isti prolaz pre objave sajta.**

## 6. Brojke

- **Prvo učitavanje `/projects` (1440×900, bez skrola):** ukupno ~4.5 MB, od čega 3.26 MB
  nosi postojeći globalni `background.webm` (nije deo ovog lanca; učitava se posle `load`).
  Showcase deo: **0 video zahteva, 6 postera = 337 KB.** Svih šest `<video>` bez `src`-a,
  pauzirani. Posle prvog skrola: kartice u kadru + `rootMargin` (4 klipa, ~8.9 MB webm);
  van kadra se pauzira; na dnu stranice svih šest pauzirano. Reduced-motion pun prolaz:
  0 video bajtova. Ispod 768px bira se `card-sm` (~260–380 KB po klipu).
- **Video asseti u repou (`public/showcase/`):** 25.0 MB, 30 fajlova (6 × 5). Klipovi su
  9.00 s, 30 fps, 1440×900 odn. 720×450. Frejmovi za capture (223 MB) su van git-a.
- **Provere:** `npm run lint` — 0 grešaka, 0 upozorenja; `npx tsc --noEmit` — čisto;
  `npm run build` — prolazi, `/projects` statički prerenderovan.
- **Konzola:** 0 grešaka (favicon popravljen); jedina upozorenja su 2 postojeća preload
  upozorenja navbar logotipa na uskim viewportima (tačka 4 u odeljku 4).
- **Screenshotovi:** 10 u `showcase/review/` — 8 traženih kombinacija
  (`{dark,light}-{sr,en}-{1440x900,390x844}.png`, pun scroll-through pre snimka, svi
  pregledani) + 2 uvećana isečka na 390px (`_detail-*.png`). Na svima: kartice se iscrtavaju
  sa stvarnim frejmovima snimaka; krem sajt (Lady Gaga) i tamni sajtovi (gbmt, digist) su
  ispravni u OBE teme — nigde crn pravougaonik; raspored 2×3 na desktopu i 1 kolona na
  mobilnom deluje uravnoteženo; mikro-potpisa nema (namerno, REPORT-04); EN prevodi kompletni.
- **Commit:** grana `feat/project-showcase`, bez push-a, `main` netaknut. Napomena: commit
  nosi i ranije nekomitovane izmene iz radnog stabla koje prethode ovom lancu (redizajn
  stranica usluga, navbar/footer izmene, brisanje starih `.playwright-mcp` logova) — brief
  je tražio `git add -A`, pa je sve na jednoj grani; ako hoćeš čistiju istoriju, to se
  posle deli interaktivno.

## 7. Šta dalje

1. Odluči tačke 1–3 iz odeljka 4 (autorstvo, budžet klipova, vercel adrese) — tačka 1 je
   jedina stvarna blokada.
2. **`jeveux-travel` i dalje čeka ispravan URL** — `https://jeveuxtravel.vercel.app/` vraća
   404 i danas (provereno). Kad URL proradi: uključi ga u `showcase/showcase.config.json`
   (`enabled: true`), pusti `node scripts/capture-showcase.mjs --project=jeveux-travel`,
   `npm run encode -- --project=jeveux-travel`, dodaj unos u `constants/projects.ts` +
   parove u `lib/i18n.ts`.
3. **Mobilne frame-sekvence (390×844, 270 frejmova × 6 projekata) stoje neiskorišćene** u
   `showcase/captures/*/mobile/` — namenski ostavljene za buduće case-study stranice
   (uspravan format ne staje u 16:10 karticu).
4. Prolaz kroz `/services` statistike (odeljak 5) pre objave sajta.
5. Ako se traži mikro-potpis preko snimaka: prvo varijanta `EnigmaLogo` bez podnaslova i sa
   `currentColor` umesto fiksnih boja — bez toga svaka varijanta izgleda kao mrlja (REPORT-04).
