# REPORT-02 — Enkodiranje frejmova u video za sajt

Datum: 2026-08-11
Menjani fajlovi: `scripts/encode-showcase.mjs` (nov), `package.json` (`encode` script +
`ffmpeg-static` devDependency), `public/showcase/**` (izlaz), ovaj izveštaj.
Komponente i `app/` nisu dirani.

## ffmpeg

`ffmpeg-static@5.3.0` instaliran kao devDependency. Instalacioni skript paketa je bio blokiran
allow-scripts politikom (`npm warn allow-scripts ... ffmpeg-static@5.3.0`), ali binarni fajl je
ipak stigao na disk (`node_modules/ffmpeg-static/ffmpeg.exe`, verzija 6.1.1-essentials, ima i
`libx264` i `libvpx-vp9`) — proverio sam da radi pre nego što sam mu verovao. Skripta uvozi
putanju direktno iz paketa (`import ffmpegPath from "ffmpeg-static"`), ne oslanja se na sistemski
`ffmpeg` ni na PATH.

## Skripta — `scripts/encode-showcase.mjs`

Isti CLI ugovor kao capture skripta: `--project=<id>` i `--all`, čita
`showcase/showcase.config.json` da zna koji projekti su `enabled` i preskače disabled
(`jeveux-travel`) i projekte bez `desktop/` frejmova. Za svaki ostali čita
`showcase/captures/<id>/desktop/*.jpg` i piše u `public/showcase/<id>/`:

- `card.mp4` (H.264, 1440×900, yuv420p, preset slow, faststart, bez zvuka)
- `card.webm` (VP9, 1440×900, crf 34, b:v 0, row-mt 1)
- `card-sm.mp4` (isto kao card.mp4, 720×450)
- `card-sm.webm` (isto kao card.webm, 720×450)
- `poster.webp` (prvi frejm `0001.jpg`, širina 1440, kvalitet 82)

`npm run encode -- --all` odn. `--project=<id>` pokreće.

### Budžet i crf-bump

`card.mp4` i `card-sm.mp4` prolaze kroz `encodeWithBudget`: enkoduju se na `crf 23`; ako fajl
probije budžet (1.5 MB / 500 KB), crf se diže za 3 i enkodira se ponovo, najviše dva puta
(23 → 26 → 29). Ako i na 29 probija, fajl ostaje takav — funkcija vraća `over: true` i skripta
to štampa uz tačnu veličinu, ništa se ne prećutkuje niti se crf diže dalje (dalje bi već vidno
degradiralo sliku). `.webm` fajlovi nemaju budžetsku petlju — brief ne postavlja budžet za njih,
samo za `card.mp4`/`card-sm.mp4`.

## Rezultat po projektu

Svih 6 aktivnih projekata enkodirano. `jeveux-travel` preskočen (`enabled:false`).

| Projekat | card.mp4 | card.webm | card-sm.mp4 | card-sm.webm | poster.webp |
|---|---|---|---|---|---|
| `lady-gaga-studio` | 2416 KB @ crf29 **PREKO** | 2039 KB | 428 KB @ crf29 OK | 334 KB | 64 KB |
| `ablux-travel` | 2195 KB @ crf29 **PREKO** | 1329 KB | 425 KB @ crf29 OK | 261 KB | 64 KB |
| `gbmt` | 2785 KB @ crf29 **PREKO** | 1834 KB | 523 KB @ crf29 **PREKO** | 370 KB | 104 KB |
| `the-original-way` | 758 KB @ crf23 OK | 454 KB | 191 KB @ crf23 OK | 125 KB | 29 KB |
| `fides-gradnja` | 1233 KB @ crf29 OK | 1887 KB | 404 KB @ crf26 OK | 304 KB | 66 KB |
| `digist` | 2266 KB @ crf29 **PREKO** | 1914 KB | 473 KB @ crf29 OK | 345 KB | 8 KB |

Budžet: `card.mp4` < 1536 KB (1.5 MB), `card-sm.mp4` < 500 KB. Ukupno `public/showcase/`: **26 MB**.

**4 od 6 `card.mp4` probijaju budžet čak i na crf 29** (maksimalni dozvoljeni bump), a `gbmt`
probija budžet i na `card-sm.mp4`. Ovo nije bag u skripti — proverio sam da je crf zaista 29 i
da dalji bump nije primenjen jer je limit od 2 pokušaja dostignut, tačno kako brief traži.
Uzrok je sadržaj: ovo je 9 sekundi realnog skrola preko fotografija/teksta/gradijenata, ne
looping motion-graphics klip, pa je entropija po frejmu visoka i H.264 na 1440×900/30fps ne
može da je stisne pod 1.5 MB bez vidljivog bloka na crf preko 29. `gbmt` je najveći (2785 KB)
jer prelazi *celu* stranicu (`journey` 0–1, iz REPORT-01) i ima najviše različitog sadržaja u
9 sekundi.

## Šta NIJE enkodirano (namerno)

`showcase/captures/<id>/mobile/*.jpg` (390×844) nisu dirane. Kartica je 16:10 na svim
širinama pa uspravan snimak ne staje u taj format — mobilne sekvence su namenjene case-study
stranicama iz kasnijeg koraka i ostaju na disku netaknute za tada.

## Na šta da obratiš pažnju

- **4/6 `card.mp4` i 1/6 `card-sm.mp4` su preko budžeta i posle max crf.** Ako je 1.5 MB/500 KB
  tvrd limit za produkciju, sledeći potez nije treći crf bump (traženo je najviše dva) nego
  jedan od: (a) skratiti `durations.card` ispod 9s tako da journey window nosi manje jedinstvenog
  sadržaja po klipu, (b) sniziti FPS izlaznog videa (frame source ostaje 30fps capture, output
  može biti 24), ili (c) pustiti da budžet važi samo kao meko ciljno stanje za ovaj set. Nisam
  menjao nijedan od ova tri jer brief eksplicitno kaže "ostavi kako jeste i prijavi" — ne
  žrtvovati kvalitet dalje bez novog uputstva.
- **`allow-scripts` je blokirao `ffmpeg-static`-ov install script.** Binarni fajl je ipak stigao
  (paket ga povlači i van postinstall hook-a), ali ako se repo klonira na čistu mašinu gde npm
  install script politika strože blokira preuzimanje, `node_modules/ffmpeg-static/ffmpeg.exe`
  možda neće postojati. Vredi proveriti pre KORAK-a koji zavisi od ovog izlaza na CI-ju/drugoj
  mašini — nisam ovo mogao testirati van trenutnog okruženja.
- **`poster.webp` za `digist` je 8 KB** — očekivano, prvi frejm je taman minimalistički splash
  (isto zapaženo u REPORT-01 za stdDev proveru), nije prazan fajl.
- **Nisam dirao `showcase.config.json` ni capture skriptu.** Ulaz u ovaj korak su isključivo
  postojeći `.jpg` frejmovi iz `showcase/captures/*/desktop/`.
