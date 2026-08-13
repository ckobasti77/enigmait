# REPORT-11 — Projekti: klaster device-mockapa po projektu

Krug 2, korak 11/12. Grana `feat/redesign-round2`. Lokalno, bez push-a.

## Plan (napisan pre koda)

1. **Preduslov / korak 10.** `constants/projectMockups.ts` nije postojao, a `public/mockups/`
   je imao jednu jedinu sliku (`lady-gaga-studio/desktop.webp`) — korak 10 je pao/prekinut
   usred prvog projekta. Skripta `scripts/capture-mockups.mjs` je ipak bila cela i ispravna,
   pa je plan da se ona **pusti ponovo** pre kodiranja umesto da se ide na monogram-fallback;
   ako padne, komponenta ionako mora da radi bez manifesta (monogram u ekranu).
2. **Nova komponenta** `components/ui/project-mockup-cluster.tsx` — četiri frame-a izgrađena
   u kodu (CSS, bez ijedne gotove slike mockapa): monitor, laptop, tablet, mobilni.
3. **Geometrija u jednoj jedinici.** Kompozicija se opisuje u „u" jedinicama
   (`--u: min(1cqw, 1.25cqh)`) na `container-type: size` korenu, pa klaster **staje** u bilo
   koji oblik korice — i u `aspect-[5/4]` kartice u mreži i u razvučenu featured kolonu —
   bez ijednog JS mernog koraka. Unutrašnjost svakog uređaja je u `em`, gde je
   `font-size: calc(var(--w) / 100)`, tj. 1em = 1% širine tog uređaja: ivice, radijusi i
   kamere ostaju samoslični i kad se uređaj skalira.
4. **Raspored:** cik-cak L-D-L-D, svaki sledeći preklapa prethodni i prelazi centralnu
   vertikalu — monitor (levo, najveći, pozadi) → laptop (desno) → tablet (levo) → mobilni
   (desno, najbliži). z-index raste tim redom, pa manji uređaj uvek stoji ispred većeg.
5. **Sadržaj:** laptop = `ShowcaseVideo` (postojeći scroll snimak, lazy/poster/pauza van
   kadra); monitor/tablet/mobilni = statične `next/image` slike iz manifesta, svaka u svojoj
   veličini. Slike se **montiraju tek kad klaster uđe u kadar** (`useIntersectionActive`,
   latch), pa otvaranje stranice ne košta nijedan mockup bajt.
6. **Responsive:** ispod `sm` klaster se pojednostavljuje na laptop + mobilni; ta dva se
   prerasporede da popune isti prostor. Prag je jedan (639px) i stoji na dva mesta — u CSS
   media query-ju i u `useMediaQuery` — jer JS ne sme ni da montira slike koje CSS krije.
7. **Korica** (`ProjectCover`) gubi browser-chrome traku (monitor je sad ram) i zadržava
   rešetku + glow kao pozadinu klastera; monogram ostaje kao vodeni žig u ekranu monitora,
   što je istovremeno i fallback ako manifest ikad nestane.
8. **Ne dira se:** pozadina, `RevealCard` trace/glow, text reveal ugovor (klaster je
   `aria-hidden` + `data-reveal="off"`, nema nove kopije → nema novih i18n parova).
9. **Verifikacija:** `npm run build`, `npm run lint`, `tsc --noEmit`, pa Playwright prolaz
   kroz `/projects` na desktopu i telefonu (screenshot + konzola).

## Odstupanja od plana

Tri, sva tri iz merenja a ne iz ukusa:

- **`em` → `--px`.** Unutrašnje mere uređaja idu preko `--px` (1% širine tog uređaja, kao
  dužina), ne preko `font-size`/`em`. Razlog: korisnikova minimalna veličina fonta u
  browseru zaključava donju granicu `font-size`-a, a mobilni u klasteru je ~77px širok, pa
  bi mu 1em bilo 0.77px — tačno u zoni koju to podešavanje razvuče. Rezultat je isti
  (samoslične ivice), ali ga ništa spolja ne može pomeriti.
- **`useInViewOnce` umesto `useIntersectionActive`.** Postojeći hook prati stanje i vraća
  `false` na izlazak iz kadra; vrednost koja MONTIRA sliku ne sme da se vraća, jer bi svaki
  prolazak gore-dole značio nov fetch. Uz to, lint pravilo `react-hooks/set-state-in-effect`
  odbija latch napisan kao `useEffect(() => { if (visible) setArmed(true) })` — i s pravom.
  Novi hook drži latch u samom observer callback-u i gasi observer na prvom preseku.
- **Izdvojeni projekat dobija `priority` na monitoru.** Izmereno: na 1440×900 korica
  izdvojenog projekta počinje na **524px**, dakle iznad preloma, i Next ju je prijavio kao
  LCP element (`Image ... was detected as the Largest Contentful Paint`). Lenjo učitan LCP
  je najgori mogući raspored, pa ta jedna slika ide eager; sve ostalo je i dalje lenjo.
  Time je i konzola čista.

## Urađeno

### Novi fajlovi

| fajl | šta je |
|---|---|
| `components/ui/project-mockup-cluster.tsx` | Klaster: četiri uređaja, jedan video + tri slike, lazy montiranje, uski raspored. |
| `constants/mockupClusterConfig.ts` | Samo ono što mora da zna JS: `rootMargin`, prag uskog rasporeda, `sizes` po ekranu. Geometrija NIJE ovde — vidi ispod. |
| `hooks/useInViewOnce.ts` | „Video sam te jednom" observer, gasi se posle prvog preseka. |
| `constants/projectMockups.ts` | Manifest slika (generisan skriptom iz koraka 10). |
| `public/mockups/<id>/{desktop,laptop,tablet,mobile}.webp` | 24 snimka, 6 projekata × 4 veličine, ukupno **1.1 MB** na disku. |
| `showcase/redesign-round2/REPORT-10.md` | Izveštaj koji piše sama skripta iz koraka 10. |

### Izmenjeni fajlovi

- `app/globals.css` — blok `.mockup-*` u `@layer components` (posle `showcase-video`).
- `app/(pages)/projects/page.tsx` — `ProjectCover` sad renderuje klaster; korice su
  `aspect-[5/4]` (bilo `16/10`, i `lg:aspect-auto lg:min-h-[24rem]` na featured-u);
  browser-chrome traka uklonjena; `priority` na izdvojenom.

### Ponovo pokrenut korak 10

`node scripts/capture-mockups.mjs` — **24/24 snimka OK**, bez ijednog placeholder-a, ukupno
1038 KB. Manifest i `REPORT-10.md` su napisani time. Fallback iz preduslova (monogram
korica) nije bio potreban, ali je **ostao ugrađen**: `PROJECT_MOCKUPS[id]` se čita kao
`ProjectMockup | undefined`, a ekran monitora ima monogram kao vodeni žig ispod slike — nema
li manifesta, klaster je i dalje četiri ispravna rama sa monogramom u velikom ekranu i
snimkom u laptopu.

### Geometrija — gde stoji i zašto

Cela kompozicija je opisana u **jednoj jedinici**: `--u: min(1cqw, 1.25cqh)` na
`.mockup-stage`, scena je 100u × 80u. `min()` čita obe strane korice, pa se klaster uklapa i
u karticu sa fiksnim odnosom 5/4 (poklapa se tačno) i u bilo koju drugu visinu, bez JS
merenja. Zato koren nosi `container-type: size`, a ne `inline-size`.

Izmereno u browseru (u „u" jedinicama, scena 100 × 80):

| uređaj | x | y | š | desna ivica | donja ivica |
|---|---|---|---|---|---|
| monitor | 1 | 2.5 | 60 | 61 | 46.2 |
| laptop | 38 | 21 | 57 | 95 (baza 97.3) | 60.2 |
| tablet | 10 | 35 | 31 | 41 | 75.5 |
| mobilni | 55 | 43 | 16 | 71 | 76.4 |

Cik-cak drži: monitor prelazi centralnu vertikalu za 11u, laptop upada levo od nje za 12u i
preklapa monitor 23u široko, tablet upada laptopu u kolonu 3u, a mobilni celom širinom stoji
preko laptopa. Ništa ne izlazi iz scene (max desno 97.3, max dole 76.4).

### Težina i lenjost (mereno na produkcijskom build-u)

- Otvaranje `/projects` bez skrola: **3 zahteva za mockape** — i to samo izdvojeni projekat,
  čija je korica stvarno u kadru. Ostalih 15 slika ne postoji ni u DOM-u.
- Skok na dno stranice: ukupno **6 zahteva** — učita se samo ono kroz šta je kadar prošao,
  redovi koje je skok preskočio ostaju neučitani.
- Po klasteru na desktopu, kroz `next/image`: desktop 19 KB + tablet 12 KB + mobilni 17 KB
  ≈ **48 KB** (izvorni fajlovi su veći; `sizes` bira 640w/256w varijante).
- Video je i dalje jedan po kartici i zadržava celu staru logiku (`load` + idle + prvi skrol
  + kadar, pauza van kadra i kad tab nije u fokusu).

### prefers-reduced-motion

Provereno emulacijom: `videoSrc: (none)`, **0 zahteva za `.webm`/`.mp4`**, a u ekranu laptopa
stoji poster (`showcase/<id>/poster.webp`) kao `background-image`. Klaster sam po sebi nema
nijednu animaciju, tranziciju ni transformaciju, pa nema šta da se gasi.

## Verifikacija

| provera | rezultat |
|---|---|
| `npx tsc --noEmit` | prolazi, bez ijednog `any` u novom kodu |
| `npm run lint` | prolazi (0 problema) |
| `npm run build` | prolazi, 16/16 strana, `/projects` i dalje statična |
| Konzola na `/projects` (prod) | **0 grešaka, 0 upozorenja** |
| Svaki projekat ima klaster | 6/6, `document.querySelectorAll('.mockup-cluster').length === 6` |
| Laptop pušta video | da, na svih 6 (u screenshot-ovima se vidi drugi kadar snimka nego na statičnim slikama) |
| Ostali ekrani statične slike | da, svaki u svojoj veličini (desktop/tablet/mobile capture) |
| Lazy-load | da, mereno gore |
| Telefon (390×844) | monitor i tablet `display: none`, ostaju laptop + mobilni, ništa se ne lomi |
| Svetla/tamna tema | obe provereno; ram, ivica, senka i ekran se izvode iz palete (`--text-primary`, `--surface-section`, `--shadow-elevated`) preko `color-mix`, pa i alt mood radi bez izmene |

## Kako izgleda

Korica više nije jedan snimak iza lažne browser trake nego **kompozicija četiri uređaja koji
se preklapaju**: veliki ekran gore levo, malo bleeduje ka levoj ivici; laptop mu ulazi u
desnu trećinu i pušta scroll snimak sajta; tablet stoji ispred oba, dole levo; telefon je
najbliži oku, preko laptopove palube. Ispod svega ostaje stara rešetka i cyan glow, sad kao
pod na kome uređaji stoje. Sve četiri slike su pravi snimci tog sajta na toj širini, pa se u
tabletu i telefonu vidi njegov stvarni responsive raspored, a ne isti desktop umanjen.

Izdvojeni projekat je najveći jer je njegova kolona najšira — klaster se skalira sa koricom,
nema drugu geometriju. Korice su porasle sa `16/10` na `5/4` (kartica u mreži na 1280px:
298px → 381px visine medija).

## Preskočeno / svesno nije rađeno

- **Hover efekat na klasteru** (blago uvećanje) — probano u glavi, odbačeno: monitor već
  dodiruje levu ivicu, a `overflow: hidden` korice bi uvećanje odsekao. Kartica ionako ima
  svoj `card-lift` i trace na hover.
- **Odsjaj (glass sheen) preko ekrana** — odsjaj je uvek svetao, a paleta nema promenljivu
  koja je svetla u obe teme; jedina poštena varijanta bila bi nova `--mockup-sheen` u sve tri
  palete, za efekat koji preko pravog screenshot-a više prlja nego što pomaže.
- **Prazan prostor u tekstualnoj koloni izdvojenog projekta** — sa `aspect-[5/4]` medija je
  548px visok na 1280px, pa između čipova i CTA ostaje vazduha. Ostavljeno namerno: `mt-auto`
  drži CTA na dnu, pa panel čita kao „naslov gore, akcija dole". Ako smeta, jedina izmena je
  odnos kolona u `lg:grid-cols-[...]`.
- **Nema novih i18n parova** — klaster ne unosi nijednu novu vidljivu nisku (monogram i
  postojeći tekst kartice su nepromenjeni), pa `lib/i18n.ts` nije diran.
