# KORAK 4 — ShowcaseVideo komponenta i ugradnja u kartice

Radiš u repou `enigma-digital`. Ovo je automatski, nenadgledan rad. Niko ti neće odgovoriti
na pitanje — donosi odluke sam, zapiši ih u izveštaj i nastavi. Ne staj i ne traži potvrdu.

Pročitaj `AGENTS.md` i `showcase/REPORT-03.md`.

**Obavezno pročitaj `components/ui/video-background.tsx` i `constants/backgroundVideoConfig.ts`
pre nego što napišeš ijednu liniju.** To je već rešen obrazac za video na ovom sajtu i ti ga
ovde ponavljaš, ne izmišljaš novi. Ako odstupiš od njega, moraš da objasniš zašto u izveštaju.

Menjaš: `components/ui/showcase-video.tsx` (nov), `constants/showcaseVideoConfig.ts` (nov),
`app/(pages)/projects/page.tsx`, po potrebi `app/globals.css`, i pišeš `showcase/REPORT-04.md`.

## Gde ide

U `app/(pages)/projects/page.tsx`, u kartici, media pane je `aspect-[16/10]` i u kodu stoji
komentar da je to dizajnirani cover dok ne stigne prava slika. Sada stiže.

Struktura koju zadržavaš: **browser chrome traka sa tačkicama ostaje u DOM-u** (ona je
theme-aware, `border-theme`, i prilagođava se svetloj i tamnoj temi). Video ide u prostor
ISPOD te trake, edge-to-edge. Video ne nosi svoj ram — ram je DOM.

Kada projekat nema `media` (null), pane ostaje tačno kakav je danas: grid, glow, monogram.
Ne sme da se pojavi prazan crn pravougaonik.

## Zahtevi za komponentu

`ShowcaseVideo`, `"use client"`, po gramatici `video-background.tsx`:

- `preload="none"`, `muted`, `loop`, `playsInline`, `disablePictureInPicture`,
  `tabIndex={-1}`, `aria-hidden`, atribut `disableremoteplayback`
- `src` se NE kači u JSX. Kači se tek kada kartica uđe u viewport, preko `IntersectionObserver`
  (rootMargin oko 200px), pa `load()` pa `play()`. Sa 6 kartica na stranici, kačenje svih src-ova
  odjednom bi povuklo ~9 MB pri otvaranju stranice.
- Kada kartica izađe iz viewporta — pauza. Kada se tab sakrije (`visibilitychange`) — pauza.
  Isto kao u `video-background.tsx`.
- Izbor izvora po širini viewporta, JEDNOM pri montiranju (ne preko `<source media>` —
  u `backgroundVideoConfig.ts` piše zašto): ispod 768px ide `card-sm`, iznad `card`.
  Prvo `webm`, pa `mp4` kao fallback.
- `poster.webp` kao `background-image` na kontejneru, ne kao `poster` atribut — isti razlog
  kao kod pozadine: vidljiv je i pre nego što video dobije `src`.
- `usePrefersReducedMotion` (hook već postoji u `hooks/`): kada je uključeno, video se nikad
  ne kači, ostaje poster. Bez izuzetka.
- Ako `play()` bude odbijen (iOS Low Power Mode), ne rušiti se — poster ostaje, i probaj ponovo
  na prvi `pointerdown`, tačno kao što `video-background.tsx` već radi.
- Bez zvuka, bez kontrola, bez fullscreen-a. Ovo je dekorativni medij.

`constants/showcaseVideoConfig.ts` drži: prag širine za mali encode, rootMargin, da li se
pauzira van viewporta, da li se pauzira na skrivenom tabu. Isti stil komentara kao
`backgroundVideoConfig.ts` — objašnjava ZAŠTO, ne ŠTA.

## Mikro-potpis

U uglu media pane-a ide diskretan Enigma potpis. **Kao DOM element, ne pečen u video.**
Razlozi: sajt ima svetlu i tamnu temu pa potpis mora da se menja sa temom; sajt je dvojezičan;
i menjanje logotipa ne sme da znači ponovno renderovanje šest videa.

Koristi postojeći `components/EnigmaLogo.tsx`. Diskretno: mali, oko 30-40% neprozirnosti,
malo jači na hover kartice. Ne sme da zaklanja sadržaj snimka niti da vuče pažnju sa njega.
Ako proceniš da izgleda kao smetnja, radije ga izostavi i to napiši u izveštaju.

## Performanse — tvrd zahtev

Otvaranje `/projects` bez skrolovanja ne sme da povuče nijedan video bajt. Samo poster slike.
Ovo posle proveravaš mrežnim panelom u koraku 5, pa nemoj da ga prekršiš zbog jednostavnosti koda.

## Verifikacija pre nego što javiš da si gotov

- `npm run lint` prolazi
- `npx tsc --noEmit` prolazi
- `npm run build` prolazi
- pusti `npm run dev`, otvori `/projects` Playwright-om, i **napravi screenshot** — potvrdi
  da se kartice iscrtavaju, da poster stoji i da nema praznih crnih pravougaonika

## Izveštaj

`showcase/REPORT-04.md`, na srpskom: šta si napravio, gde si odstupio od obrasca iz
`video-background.tsx` i zašto, kako si rešio mikro-potpis, rezultat lint/tsc/build,
i sve odluke koje si doneo sam.
