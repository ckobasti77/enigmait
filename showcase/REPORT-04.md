# REPORT-04 — ShowcaseVideo komponenta i ugradnja u kartice

Datum: 2026-08-11
Menjani fajlovi: `components/ui/showcase-video.tsx` (nov), `constants/showcaseVideoConfig.ts`
(nov), `app/(pages)/projects/page.tsx`, `app/globals.css`, ovaj izveštaj.
`constants/projects.ts`, capture/encode skripte i `showcase.config.json` nisu dirani.

## Šta je napravljeno

`ShowcaseVideo` je klijentska komponenta koja nosi jedan snimak i ništa više — bez ivice,
radijusa i pozadinske boje. Ram je DOM oko nje: browser chrome traka sa tačkicama je ostala
netaknuta u kartici (`border-theme`, dakle theme-aware), a video sedi u `absolute inset-0 top-9`,
edge-to-edge ispod trake. Traka je dobila `z-10`, jedina izmena na njoj — bez toga bi glow iz
null-grane mogao da je pregazi.

Kada je `project.media === null`, pane je tačno kakav je bio: grid, glow, monogram. To je
provereno stvarnim buildom (privremeno sam postavio `digist.media = null`, rebuild, snimak
ekrana — kartica 06 prikazuje „DG" monogram na grid podlozi, bez ijednog crnog pravougaonika),
pa je izmena vraćena. `git diff constants/projects.ts` je prazan.

Sve iz zahteva je ispunjeno: `preload="none"`, `muted`, `loop`, `playsInline`,
`disablePictureInPicture`, `tabIndex={-1}`, `aria-hidden`, `disableremoteplayback`, bez zvuka,
kontrola i fullscreen-a; `src` nigde u JSX-u; izbor izvora jednom pri montiranju po širini
viewporta; poster kao `background-image`; pauza van kadra i na skrivenom tabu; retry na
`pointerdown` ako je autoplay odbijen; `usePrefersReducedMotion` gasi video bez izuzetka.

## Gde sam odstupio od `video-background.tsx` i zašto

**1. Nema `mix-blend-mode`, `filter` ni ijedne palete-varijable.**
Pozadina se blenduje zato što je klip crn sa svetlim talasima i crno mora da izađe — to je
mehanizam, ne dekoracija. Ovde je klip snimak tuđeg sajta i mora da se vidi tačno onakav kakav
jeste, u obe teme. Svaki blend ili `filter` bi značio da klijentu pokazujemo njegov sajt u
pogrešnim bojama. Zato `.showcase-video-layer` nema ni `isolation: isolate` ni neprozirnu
podlogu — nema šta da izoluje.

**2. Kačenje `src`-a ima tri uslova, a ne jedan.**
Pozadina je jedna i uvek u kadru, pa joj je dovoljan `load` + idle. Ovih je šest, ukupno ~9 MB,
i najčešće se vide jedan do dva. Uslovi su: kadar (`IntersectionObserver`, `rootMargin: 200px`),
`load` + idle, i **prvi skrol** — treći je objašnjen ispod, i to je jedino mesto gde sam dodao
nešto čega u brief-u nema.

**3. `object-position: top center` umesto centriranja.**
Snimak je skrol kroz stranicu u 16:10 kadru; kada `object-fit: cover` mora da odseče, uvek je
bolje da odseče dno nego vrh — vrh je navigacija i naslov, po čemu se sajt prepoznaje.

**4. Parallax na kursor nije prenet.** Pozadina se pomera jer je pozadina. Kartica je sadržaj i
nema razloga da klizi ispod kursora.

Sve ostalo je doslovno isti obrazac: `onIdle` helper sa `setTimeout` fallback-om, ista struktura
`tryPlay` / `attach` / cleanup, isti `data-playing` prekidač za `opacity` (poster stoji dok prvi
frejm ne dekoduje, a poster JE prvi frejm, pa se prelaz ne vidi), isti `visibilitychange` efekat.

## Prvi skrol kao uslov — odluka koju sam doneo sam

Brief traži dve stvari koje se, na ovoj stranici, međusobno isključuju: da se `src` kači kada
kartica uđe u viewport, i da otvaranje `/projects` bez skrolovanja ne povuče **nijedan** video
bajt (izričito označeno kao tvrd zahtev).

Izmerio sam geometriju u browseru: na 1440×900 prvi red kartica počinje na **y = 771px**, dakle
oko 130px medija pane-a je iznad preloma. Sam `IntersectionObserver` to čita kao „u kadru" i
povlači dva klipa (~3.5 MB) na otvaranju stranice — što sam i video u prvoj verziji, pre nego
što sam dodao uslov. Sa `rootMargin: 200px` situacija je još gora.

Rešenje: pored kadra i `load`-a, prvi video čeka i da korisnik makar jednom skroluje
(`deferUntilScroll` u konfiguraciji). Ovo ne košta ništa u iskustvu — da bi se kartica uopšte
videla, mora da se skroluje — a tvrd zahtev postaje merljiv i tačan. `window.scrollY > 0` pri
montiranju već važi kao skrol, da reload na sredini stranice ne ostavi kartice zaključane na
posteru.

**Ovo treba znati u koraku 5:** ako se u mrežnom panelu otvori `/projects` i ne skroluje, video
zahteva neće biti — to je namerno, a ne kvar.

## WebM/MP4 bez `<source>` elemenata

Izbor formata se pravi u JS-u preko `video.canPlayType('video/webm; codecs="vp9"')`, pa se bira
`webm` ili `mp4` u odgovarajućoj veličini. Nisam koristio `<source>` decu u JSX-u, iako bi to
bio prirodan način za fallback: `<source src>` u markup-u browser počne da rešava čim ga vidi,
a ceo ovaj korak postoji da se to ne desi. Dinamičko ubacivanje `<source>` čvorova u DOM ispod
`<video>` koji React drži bilo bi mešanje vlasništva nad DOM-om, pa je jedno dodeljivanje
`video.src` — tačno kao u `video-background.tsx` — i jednostavnije i bezbednije.

## Mikro-potpis — izostavljen

Napravio sam ga, pogledao i **sklonio**. Brief to izričito dozvoljava („ako proceniš da izgleda
kao smetnja, radije ga izostavi"). Tri konkretna razloga, sva tri viđena na ekranu, ne
pretpostavljena:

1. **Kontrast ne postoji ni u jednoj temi.** `EnigmaLogo` ima fiksne boje: gradijent
   cyan→ljubičasto za „ENIGMA" i belo (`light`) odnosno `#0b1221` (`dark`) za „digital".
   Podloga nije naša — to je snimak tuđeg sajta, koji u istih 9 sekundi prelazi preko belih
   sekcija, fotografija kose i tamnoplavih hero blokova. Preko svetle fotografije Studija Lady
   Gaga belo „digital" je nestalo, a gradijent se pretvorio u mrlju koja liči na artefakt
   kompresije.
2. **Lockup se ne smanjuje.** „digital" je zakucan na `0.7rem` i `letter-spacing: 0.4em`, dok
   „ENIGMA" prati `font-size` iz `className`. Ispod ~24px wordmark-a potpis postaje širi od
   logotipa iznad sebe. „Mikro" i „ovaj lockup" se isključuju.
3. **Nema ugla u koji staje.** Podnaslov je pozicioniran van svog boksa (`right: -0.65rem`,
   `bottom: -0.7rem`), pa u `overflow-hidden` pane-u curi preko ivice; u chrome traku (36px) ne
   staje jer bi ispao ispod nje, na video.

Ono što bi ovo otključalo je varijanta `EnigmaLogo`-a bez podnaslova i sa bojom iz teme
(`currentColor` umesto fiksnih heksova) — izmena u `components/EnigmaLogo.tsx`, koji nije u
spisku fajlova za ovaj korak i koristi se i drugde. Nisam ga dirao. Praktično: kartica ionako
već nosi našu tvrdnju o autorstvu (naslov sekcije „Sajtovi koje smo izradili"), pa potpis preko
klijentovog sadržaja ne dodaje dokaz — samo smeta snimku.

## Verifikacija

Sve provere su rađene na **produkcijskom buildu** (`next start`), ne na dev serveru: dev server
koji je već radio u ovom repou (port 3002, tuđi proces) nije preuzeo izmenu u `globals.css` —
serviran CSS je i dalje bio bez `.showcase-video-*` pravila — a Next odbija drugu `dev`
instancu. Nisam gasio tuđi proces; umesto toga sam digao `next start` na slobodnom portu, što
je i vernija slika performansi.

- `npx tsc --noEmit` — prolazi, bez izlaza.
- `npm run lint` — 0 grešaka. Ostaje isto **postojeće** upozorenje iz REPORT-02
  (`scripts/encode-showcase.mjs:60`, `'label' is defined but never used`).
- `npm run build` — prolazi, `/projects` se i dalje prerenderuje statički (`○ /projects`).
- **Mreža, 1440×900, bez skrola, 3s posle load-a:** 0 video zahteva, 6 postera, ukupno 337 KB.
  Svih šest `<video>` elemenata ima `src === null`. Tvrd zahtev ispunjen.
- **Posle skrola na y=950:** kačе se 4 klipa (prva dva reda, `rootMargin` povlači i drugi red),
  kartice 5 i 6 ostaju netaknute. Na y=2100 kаče se i one. Na dnu stranice sve šest je
  pauzirano — pauza van kadra radi.
- **Reduced motion** (`emulateMedia reducedMotion: 'reduce'`), pun prolaz kroz celu stranicu:
  **0 video bajtova**, sva šest `src === null`, posteri stoje.
- **390×844:** bira `card-sm.webm`, dakle mali encode ispod 768px.
- **Obe teme:** snimci se iscrtavaju edge-to-edge ispod chrome trake, kartica i traka se menjaju
  sa temom, nigde nema praznog crnog pravougaonika. Snimci ekrana su napravljeni i pregledani;
  nisu ostavljeni u repou.
- **Konzola:** jedina greška je `favicon.ico 404`, postoji i pre izmene. Na 390px se javljaju i
  dva `link preload ... not used` upozorenja za `/logos/logo-emblem.png` i `/logos/logo-text.png`
  — to je navbar, postojeće, nema veze sa ovim korakom.

## Na šta da obratiš pažnju

- **Klipovi su teški i to se sada vidi u mreži.** Četiri kartice u kadru povuku **~8.9 MB**
  (`card.webm`, 1.3–2 MB po komadu). Ovo je direktna posledica onoga što je REPORT-02 već
  prijavio: 4 od 6 `card.mp4` probijaju budžet i na maksimalnom crf-u, jer je sadržaj 9 sekundi
  realnog skrola, a ne looping motion graphics. Komponenta radi svoj deo (ništa se ne vuče
  unapred, ništa van kadra), ali ako je cilj lakša stranica, potez je u enkodiranju — kraći
  `durations.card` ili niži FPS — ne u komponenti.
- **Šest postera se učitava odmah, 337 KB.** To je namerno („samo poster slike") i to je ono što
  drži pane popunjenim pre videa. Ako i to smeta, sledeći korak je `loading="lazy"` preko
  `<img>` umesto `background-image` — ali time se gubi poster pre nego što video dobije `src`,
  što je razlog zbog kog je pozadinski obrazac uopšte ovakav.
- **`deferUntilScroll` je moja odluka, ne stavka iz brief-a.** Ako se u koraku 5 proceni da video
  treba da krene i bez skrola, prekidač je jedan `false` u `constants/showcaseVideoConfig.ts` —
  ali time pada tvrd zahtev iz ovog koraka, jer prvi red kartica je delom iznad preloma.
- **Mikro-potpisa nema.** Ako se traži, prvo treba `EnigmaLogo` koji ume da bude mali i
  theme-aware; bez toga svaka varijanta izgleda kao mrlja preko klijentovog sajta.
