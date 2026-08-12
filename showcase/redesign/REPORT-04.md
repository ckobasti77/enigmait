# REPORT-04 — Usluge: kompaktan panel + beskonačan carousel, korak 04/07

Grana: `feat/redesign-clean`. Spec: `enigma-claude-code-promptovi.md` → **PROMPT 3**.
Vizuelna referenca: `enigma-proto.html`, sekcija „03" (`.arrow`, `.track`, `slide()`/`goto()`).

## Plan (napisan pre koda)

1. **Nema izmena u SEO putanji.** `app/(pages)/services/<slug>/page.tsx` ostaju server
   komponente sa `buildServiceMetadata` + plain `<script type="application/ld+json">`.
   Menja se samo ono što `ServicePageTemplate` renderuje ispod njih.
2. **Novi fajlovi:** `_components/ServicePanel.tsx` (kompaktan panel za jedan slug, iz istog
   `servicePages[slug]`) i `_components/ServiceCarousel.tsx` (client, drži indeks, strelice,
   dots, tastere, swipe, URL sync). `ServicePageTemplate.tsx` postaje jedan red:
   `<ServiceCarousel initialSlug={slug} />`.
3. **Push mehanika = prototip.** Stage sa `overflow:hidden`, unutra track `width:200%` i dva
   slot-a po 50%. `next`: `[tekući, sledeći]`, track 0% → −50%. `prev`: `[prethodni, tekući]`,
   −50% → 0%. Animacija je Web Animations API (eksplicitni from/to, bez `void offsetWidth`
   trika), na `finish` `flushSync` commit pa `animation.cancel()` — commit mora da se oboji
   pre nego što animacija prestane da drži track, inače se vidi frejm starog panela.
4. **Beskonačno u oba smera** preko modula nad `DISCIPLINE_ORDER`; dots skaču preko
   `goTo` sa kraćim smerom (isti račun kao `goto()` u prototipu).
5. **URL sync bez rutiranja:** `window.history.replaceState(window.history.state, "",
   disciplineHref(next))` na početku koraka — Next-ov `history.state` se prenosi, pa router
   ostaje konzistentan, a nema remount-a usred animacije.
6. **Slajdovi su ključevani slug-om**, pa React zadrži DOM panela koji ulazi kad postane
   jedini — 3D canvas se ne remount-uje i otkrivena kopija ne trepće.
7. **Performanse:** `ServiceModelStage` postoji samo za slug-ove koji su u DOM-u (1 u miru,
   najviše 2 u toku animacije); susedi se greju preko `preloadDiscipline` na tajmer.
8. **Pristupačnost / sistem:** `prefers-reduced-motion` → trenutna zamena bez klizanja;
   mobilni → swipe + stack layout; strelice `position:fixed`, vertikalno centrirane, gase se
   kad stage nije u ekranu; kopija je plain markup (site-wide text reveal je vlasnik).

Plan je izveden kompletno. Jedina stavka koja nije bila u planu, a morala je da uđe, jeste
popravka trkalice u `useBorderTraceReveal` (korak 03) — vidi „Popravka koja nije planirana".

---

## Urađeno

Stranica usluge više nije osam sekcija nego **jedan panel u ~1 ekran + FAQ**, a šest usluga
su povezane u **beskonačan carousel**: fiksne strelice na ivicama ekrana, dots, tasteri
← →, swipe na dodir, i push animacija u kojoj usluga koja ulazi izgura tekuću. Ruta se i
dalje ponaša kao ruta — direktan ulazak na `/services/<slug>` SSR-uje svoj metadata i
JSON-LD, a korak u stranu prepiše adresu bez navigacije.

### Fajlovi

| Fajl | Status | Šta |
|---|---|---|
| `app/(pages)/services/_components/ServiceCarousel.tsx` | **nov** | Client komponenta: indeks, push (WAAPI), strelice, dots, tasteri, swipe, URL sync, prefetch suseda, FAQ ispod. |
| `app/(pages)/services/_components/ServicePanel.tsx` | **nov** | Kompaktan panel za jedan slug — `RevealCard` sa naslovom, ledeom, 3 capability stavke, 1 CTA, 3 proof broja i `ServiceModelStage`. |
| `app/(pages)/services/_components/ServicePageTemplate.tsx` | izmenjen | 8 sekcija → `<ServiceCarousel initialSlug={slug} />`. Skinut `"use client"` (nema više ničeg klijentskog u njemu). |
| `app/globals.css` | izmenjen | Novi blok `Services carousel` odmah ispod `.ui-card` bloka: stage/track/slide, panel, glow, strelice, dots. |
| `hooks/useBorderTraceReveal.ts` | izmenjen | Rebuild timeline-a nastavlja otkrivanje umesto da ga preskoči — vidi dole. |
| `lib/i18n.ts` | izmenjen | 2 nova para: `Previous service` / `Next service`. |

**Bez novih tokena i bez nove pozadine.** Sve boje su postojeće: `--card-trace`,
`--card-trace-glow`, `--border-strong`, `--border-soft`, `--surface-card-muted`,
`--surface-overlay`, `--primary`, `--text-primary`, `--text-secondary`, plus `.glow-accent`.
Globalna video pozadina i njeni parametri nisu dirani.

### Šta je ostalo u panelu, a šta je izbačeno

Ostalo (sve iz istog `servicePages[slug]`): eyebrow + brojač `01 / 06`, `h1`, kratak lede,
**3** capability stavke kao linije sa ikonicom, **1** CTA (`hero.ctas[0]`), **3** proof broja
kao `dl` iznad tanke linije, i `ServiceModelStage` desno (ispod `lg` stack, model ide dole).

Izbačeno kao sekcije: `ServiceHero`, `ServiceProofStrip`, `ServiceCapabilities`,
`ServiceProcess`, `ServiceDifferentiators`, `ServiceDeliverables`, `ServiceFinalCta`.
Komponente **nisu obrisane** — stoje u stablu nemontirane, isto pravilo koje
`DotFieldBackgroundGlobal` već ima u `.claude/rules/architecture.md`. Podaci u
`constants/services/*` su netaknuti; panel samo prestaje da renderuje većinu njih.

**FAQ je zadržan** kao jedna kompaktna sekcija ispod carousela, vezana za aktivnu uslugu
(`key={current}` resetuje koje je pitanje otvoreno). Razlog nije ukus nego tvrdo pravilo o
SEO-u: `buildServiceJsonLd` štampa `FAQPage` iz istog niza, a strukturirani podaci bez
vidljivog parnjaka na stranici su tačno ono što se izbacuje iz indeksa. PROMPT 4 ga ionako
redizajnira sledeći.

**Proces nije ušao ni kao tri sitna koraka.** Spec ga navodi u „izbaci" listi sa dozvolom
„ako baš mora"; keep-lista ga ne pominje, a cilj je ~1 ekran za mešovitu publiku. Odluka je
bila manje, ne više.

### Push, tačno kako radi

Stage klipuje, track je duplo širi od njega i ima dva slota po 50%, pa je korak tačno
`translateX(-50%)` — jedna širina stage-a. U miru je u track-u **jedan** slot; drugi postoji
samo dok traje animacija. Smer diktira geometrija: za „sledeća" panel koji ulazi mora da
stoji desno (`[tekući, sledeći]`, 0% → −50%), za „prethodna" levo (`[prethodni, tekući]`,
−50% → 0%).

Tri odluke koje su se same nametnule kad je prototip prešao u React:

- **WAAPI umesto CSS tranzicije.** Prototip forsira reflow između dva upisa klase
  (`void track.offsetWidth`); u Reactu to znači ili `useLayoutEffect` sa setState-om usred
  commit-a, ili trkanje sa paint-om. `element.animate([from, to])` navodi oba kraja
  eksplicitno, pa nema šta da se forsira ni da se pogađa na `transitionend`.
- **`flushSync` na kraju.** Animacija sa `fill: "forwards"` drži track na `-50%` i posle
  kraja. Da se prvo pusti `cancel()`, videla bi se jedna slika starog panela; da se pusti
  posle asinhronog re-rendera, videla bi se prazna. Zato: sinhroni commit (jedan slot,
  inline transform `0%`), pa `cancel()` — bez paint-a između.
- **`key={slug}` na slotu.** Kad se track vrati na jedan slot, React nađe već montiran ključ
  i **premesti** taj DOM umesto da ga sagradi ponovo. Posledice su konkretne: WebGL kontekst
  se ne pravi drugi put, a kopija koju je text reveal upravo otkrio ne biva sakrivena pa
  otkrivena opet.

Rapid klik je blokiran `busyRef`-om (isto kao `busy` u prototipu). Provereno: tri klika
zaredom = jedan korak, track na 0, jedan slot.

### Performanse

`ServiceModelStage` se montira samo za slug-ove koji su u DOM-u: **1 canvas u miru, najviše 2
dok traje push**. Susedi (±1, sa wrap-om) se greju `preloadDiscipline`-om na tajmeru od 400ms
posle svakog koraka. Eviction se namerno ne radi — `ServiceModelStage` već dokumentuje zašto
(radni set svih šest GLB-ova je mali, a homepage reel ionako čisti iza sebe).

### Popravka koja nije planirana: `useBorderTraceReveal`

Prvi prolaz hook-a se izvršava **pre** nego što `ResizeObserver` javi veličinu, pa nema
putanje za trag; kartica koja je već u ekranu tada dobije `onEnter` na toj (praznoj) verziji,
a merenje stigne frejm kasnije i rebuild-uje timeline. Stara grana je na rebuild-u radila
`timeline.progress(1).pause()` — što je za **svaku karticu iznad preloma pojelo ceo reveal**:
ni traga ni blura, panel se prosto pojavi. Izmereno pre popravke: `strokeDashoffset` skoči
`0 → -1000` za 10ms.

Popravka je da rebuild **nastavi** otkrivanje od proteklog vremena umesto da ga završi
(`elapsed >= duration` i dalje znači „gotovo je", pa resize i dalje ne zaključava karticu
iznad koje je čitalac već prošao). Posle: 37 međukoraka kroz `170 → −1000` za ~1.05s.

Dirnut je fajl iz koraka 03, ali je popravka uslov da ovaj korak uopšte ima „jedan jak
reveal" koji spec traži, i istim potezom vraća trag na `projects` karticama iznad preloma i
u `PageHero`-u. Projects stranica je posle izmene proverena od vrha do dna: 9/9 kartica
otključano, 0 sakrivene kopije, 0 `pending`.

## Verifikacija

`npm run build` ✅ · `npm run lint` ✅ · `npx tsc --noEmit` ✅ (16/16 stranica statički,
svih šest ruta usluga).

Sve ostalo je provereno u pravom browseru (Playwright, produkcijski build na `next start`):

| Provera | Rezultat |
|---|---|
| Strelice fiksne na ivicama, vertikalno centrirane | ✅ desktop i mobilni; gase se kad stage izađe iz ekrana (`visible → hidden → visible` na skrol dole/gore) |
| Push animacija | ✅ track `0 → −73px → −1152px → 0` uz 2 slota, pa 1 slot na kraju |
| Beskonačno u oba smera | ✅ `1 → 0 → social-media` (unazad), `social-media → web-development` (unapred) |
| Tasteri ← → | ✅ ; ignorišu se u `input`/`textarea`/`contenteditable` i uz modifikatore |
| Dots | ✅ skok kraćim smerom; aktivna tačka prati odredište odmah, ne posle animacije |
| Swipe (touch) | ✅ levo = sledeća, desno = prethodna; pretežno vertikalni potez se ignoriše |
| URL sync | ✅ `replaceState` na svaki korak, bez remount-a |
| Direktan load rute | ✅ `<title>`, `description`, `Service` + `FAQPage` + `BreadcrumbList` JSON-LD prisutni u serviranom HTML-u za svih 6 slug-ova |
| `prefers-reduced-motion` | ✅ trenutna zamena: 1 slot, `translateX(0)`, bez klizanja |
| Mobilni (390×844) | ✅ stack: kopija gore, model dole, dots ispod |
| i18n | ✅ EN/SR menja i kopiju panela i `aria-label` strelica i dots; panel koji se montira dok je sajt na EN stiže na EN (MutationObserver); posle povratka na SR `.reveal-word` = 0, tekst ceo |
| Text reveal | ✅ posle skrola kroz celu stranicu: 0 sakrivenih elemenata, 0 `pending` |
| Dužina stranice | 2027px na 1440×900 = **2.25 ekrana**, 2 sekcije (panel + FAQ) umesto 8 |
| Teme | ✅ tamna, svetla (skrinšotovi u `showcase/redesign/review/svc-*.png`) |
| `/services` indeks | ✅ netaknut (nema strelica, svoj `h1`) |

## Preskočeno i zašto

- **`document.title` se ne menja na korak.** URL se ažurira, naslov dokumenta ostaje onaj
  koji je ruta SSR-ovala. Crawler vidi SSR verziju, pa je ovo isključivo kozmetika u tabu; a
  „ne diraj SEO" je tvrdo pravilo i nisam hteo da mu prilazim sa klijentske strane.
- **Stare sekcije nisu obrisane.** Nemontirane su, po presedanu iz `architecture.md`. Brisanje
  je odluka za posle celog lanca, ne usput.
- **Nema `aria-live` regiona za promenu panela.** Panel nosi `h1`, dots nose `aria-current`, a
  `aria-roledescription="carousel"` stoji na sekciji; dodatni live region bi bio više
  mašinerije nego što ovaj kontrol traži.
- **Nema queue-a za brze klikove** — korak je blokiran dok traje prethodni, isto kao u
  prototipu. 620ms je kratko dovoljno da se to čita kao odziv, ne kao zaglavljivanje.
