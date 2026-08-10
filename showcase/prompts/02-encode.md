# KORAK 2 — Enkodiranje frejmova u video za sajt

Radiš u repou `enigma-digital`. Ovo je automatski, nenadgledan rad. Niko ti neće odgovoriti
na pitanje — donosi odluke sam, zapiši ih u izveštaj i nastavi. Ne staj i ne traži potvrdu.

Pročitaj `AGENTS.md` i drži ga se. Pročitaj `showcase/REPORT-01.md` da vidiš šta je prethodni
korak uradio i koji projekti imaju ispravan capture.

Menjaš SAMO: `scripts/`, `package.json` (scripts + devDependencies), `public/showcase/`,
`.gitignore` ako treba, i pišeš `showcase/REPORT-02.md`. Ne diraj komponente i `app/`.

## Cilj

Od frame-sekvenci u `showcase/captures/<id>/desktop/` napravi gotove video fajlove koje sajt
servira. Snimci moraju da budu čist sadržaj klijentovog sajta, edge-to-edge, bez ikakvog rama,
pozadine, teksta ili vinjete — ram daje DOM kartice koji se prilagođava svetloj i tamnoj temi.

## ffmpeg

Ne oslanjaj se na sistemski ffmpeg. Instaliraj `ffmpeg-static` kao devDependency i koristi putanju
koju taj paket izvozi. Razlog: ovo mora da radi na čistoj mašini bez ručne instalacije.

## Šta enkodiraš

Za svaki projekat koji ima ispravan desktop capture, iz `showcase/captures/<id>/desktop/*.jpg`,
30 fps, bez zvuka, u `public/showcase/<id>/`:

- `card.mp4` — H.264, 1440x900, `-pix_fmt yuv420p`, `-crf 23`, `-preset slow`, `-movflags +faststart`
- `card.webm` — VP9, 1440x900, `-crf 34 -b:v 0 -row-mt 1`
- `card-sm.mp4` — isto kao card.mp4 ali skalirano na 720x450
- `card-sm.webm` — isto kao card.webm ali skalirano na 720x450
- `poster.webp` — prvi frejm, širina 1440, kvalitet 82

`yuv420p` i `faststart` nisu opcioni — bez njih video ne radi na delu iOS uređaja i ne počinje
da se prikazuje dok se ceo ne preuzme.

Mobilne frame-sekvence (390x844) NEMOJ enkodirati. Kartica je 16:10 na svim širinama, pa
uspravan snimak tu ne staje. Te sekvence ostaju na disku za kasnije (case study stranice).
Napomeni to u izveštaju da bude jasno da nisu zaboravljene nego namerno preskočene.

## Budžet veličine

Cilj: `card.mp4` ispod 1.5 MB, `card-sm.mp4` ispod 500 KB. Ako prvi prolaz probije budžet,
podigni crf za 3 i enkodiraj taj fajl ponovo, najviše dva puta. Ako i posle toga probija,
ostavi kako jeste i prijavi tačnu veličinu — nemoj da žrtvuješ kvalitet do neprepoznatljivosti
i nemoj tiho da prećutiš prekoračenje.

## Skripta

Napravi `scripts/encode-showcase.mjs` sa istim CLI ugovorom kao capture skripta
(`--project=<id>` i `--all`) i `"encode": "node scripts/encode-showcase.mjs"` u package.json.
Skripta preskače projekte koji nemaju frejmove, uz jasnu poruku.

`public/showcase/` IDE u git — to su produkcijski asseti sajta, ne privremeni fajlovi.
Proveri da `.gitignore` slučajno ne hvata taj folder.

## Verifikacija

Za svaki enkodovan projekat:
- potvrdi da fajl postoji i nije nulte veličine
- pomoću `ffprobe` (dolazi uz ffmpeg-static ili koristi `ffmpeg -i`) potvrdi trajanje, rezoluciju
  i da nema audio stream
- izvuci frejm iz sredine `card.mp4` u privremeni PNG i **otvori ga i pogledaj** — mora da se vidi
  stvaran sadržaj sajta, a ne crn ili beo ekran. Ovo je glavni kriterijum prijema, uradi ga za
  svaki projekat.

## Izveštaj

`showcase/REPORT-02.md`, na srpskom: tabela po projektu sa veličinama sva četiri video fajla i
postera, trajanjem, rezolucijom, brojem crf iteracija, i nalazom vizuelne provere sredine klipa.
Na kraju: ukupna veličina koju smo dodali u repo, i sve odluke koje si doneo sam.
