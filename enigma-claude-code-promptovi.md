# Enigma Digital — Prompt pack za Claude Code

Ovo su gotovi promptovi za **Claude Code** (CLI u tvom repou `enigma-digital`).
Ja (Claude, Cowork) sam pročitao kod i napisao ih; Claude Code izvršava.

Izabrani pravac za CTA: **A — Trace glass** (plavi border + svetlosni streak na hover).

---

## GLAVNI PRINCIP (najvažnije — vazi za svaki prompt)

**Čistije i kompaktnije kroz MANJE SADRŽAJA I DETALJA — a NE kroz manje glowa.**
Sajt je prenatrpan sitnicama i sekcijama; to se seče. Glow i reveal ostaju — oni su potpis.

1. **Glow/reveal potpis OSTAJE i primenjuje se dosledno.** Isti fazon glowa na reveal kao na
   POČETNOJ i na DROPDOWN-u za usluge u navbaru: borderTrace „unlock" + prateći glow (cyan/ljubičasta).
   Ne smanjivati glow, ne skidati ga. Naprotiv — dovodi ga na redizajnirane stranice da budu u istom
   jeziku kao početna. (Ranije sam pogrešno tražio „manje glowa" — ignoriši to; glow se ZADRŽAVA.)
2. **Čišćenje = manje sitnica.** Skida se višak DETALJA: previše kartica u redu, previše čipova,
   duple/nepotrebne linije, sekcije koje govore isto. Manje elemenata, više vazduha — ali glow ostaje.
3. **Pozadina ostaje ista svuda.** Globalna pozadina (DotField/Video/`--background`) se NE menja i
   NE dodaje se nova. Ambijentalni glow koji ide uz nju (isti kao na početnoj) je OK i poželjan.
4. **Menja se SAMO „stara verzija" sajta.** Početna (Hero, TechSection, Timeline, Disciplines) je
   dizajn-referenca i NE dira se. Menjaju se stare, prenatrpane stranice. Koji su to fajlovi —
   Claude Code utvrđuje kroz `git log` (vidi Prompt 0), ne po datumu fajla (klon je pobrisao mtime).
5. **Sažimaj sekcije.** Gde postoji 6–8 sekcija, spusti na 2–3, ili na jednu kompaktnu koja je
   „prebrutalna". Isti sadržaj, kraće i jače — uz zadržan glow/reveal.

---

## Kako da koristiš ovo (pročitaj prvo)

1. **Ubaci prototip u repo kao vizuelnu referencu.** Stavi `enigma-proto.html` u root repoa
   (`enigma-digital/enigma-proto.html`). U promptovima Claude Code-u kažem da ga otvori — tu su
   tačne CSS/JS vrednosti za dugme (sweep), trace geometriju i carousel logiku, pa ne mora da pogađa.

2. **Idi redom, jedan po jedan prompt.** Ovaj redosled je namenski:
   `1 (temelj: dugme) → 2 (Card + trace reveal) → 3 (usluge carousel) → 4 (FAQ) → 5 (projekti) → 6 (QA)`.
   Prompt 3, 4 i 5 koriste komponente iz 1 i 2, zato temelj ide prvi.

3. **Posle svakog prompta pusti build.** Reci Claude Code-u da uradi `npm run build` (ili `next build`)
   i `npm run lint` pre nego što kaže da je gotovo. Ako pukne — neka popravi u istoj sesiji.

4. **Ako otvoriš svežu Claude Code sesiju**, prekopiraj prvo blok „ZAJEDNIČKI KONTEKST" ispod,
   pa onda konkretan prompt. Ako je sesija već topla (isti chat), ne moraš da ponavljaš kontekst.

5. **Ništa se ne briše bez zamene.** Stari „liquid glass" stil dugmeta ostaje kao varijanta.

> Napomena o deploy-u: kad budeš zadovoljan, imaš svoj `deploy-to-production` flow
> (Vercel + Convex) — ne diramo ga ovde.

**Model / Effort / Mode — piše uz SVAKI prompt.** Konvencija:
- **Model:** *Opus* = najjači, za složeno rezonovanje / arhitekturu / osetljive refaktore;
  *Sonnet* = za većinu izvršnog koda; *Haiku* = trivijalno (ovde se ne koristi).
- **Effort (thinking):** *visok* = ukucaj `ultrathink` (ili `think hard`) u poruku; *srednji* = normalno;
  *nizak* = kratki mehanički zadaci.
- **Mode:** *Plan* = Claude Code prvo napravi plan pa čeka tvoje „ok" (za analizu i rizične korake);
  *Goal* = vodi zadatak do cilja po kriterijumima prihvatanja; *Normal* = bez posebnog moda.
  Podešavaš u Claude Code-u pre nego što pošalješ prompt.

---

## ZAJEDNIČKI KONTEKST (prekopiraj na vrh ako je sesija sveža)

```
Radiš na Next.js (App Router) + React + TypeScript + Tailwind + GSAP projektu "enigma-digital".
Sajt ima potpisnu animaciju: "borderTrace unlock" — dva svetlosna traga krenu iz sredine ivice
kartice, pretrče border u suprotnim smerovima i sretnu se na suprotnoj ivici, a sadržaj izranja
unutar tog traga. Cilj je da taj isti jezik (plavi border + trace) bude dosledan na CELOM sajtu.

Pre nego što bilo šta menjaš, OTVORI i pročitaj ove fajlove da ne razbiješ postojeće obrasce:
- lib/borderTrace.ts                          (buildBorderTracePaths, TRACE_LENGTH=1000; pathLength trik)
- app/_components/ProcessCard.tsx             (GSAP ScrollTrigger trace unlock; TRACE_DASH, SEQUENCE_SPEED)
- app/_components/ServicesDropdown.tsx        (isti trace, na open state; nav-trace-* tokeni)
- hooks/usePrefersReducedMotion.ts            (koristi { includeDataAndBattery: false } za jednokratne ulaze)
- components/ui/liquid-glass-button.tsx       (LiquidButton; varijante primary/secondary; velicine)
- components/ui/cta-button.tsx                (CtaButton — JEDINI levak kroz koji idu sva CTA dugmad)
- components/ui/button.tsx                    (shadcn Button; ima "enigma" neon varijantu)
- app/globals.css                             (SVE palete tokena; trazi --primary, --border-strong,
                                               --border-soft, --card, .theme-card, .card-lift, glow-accent)
- constants/services/index.ts + constants/services/types.ts   (servicePages: Record<DisciplineKey, ...>)
- constants/disciplines.ts                    (DISCIPLINE_ORDER, disciplineHref, disciplines)
- enigma-proto.html                           (u rootu — vizuelna referenca za dugme/kartice/carousel)

OBAVEZNA PRAVILA (guardrails), vaze za sve zadatke:
0a. GLAVNI CILJ = MANJE. Cistije, minimalistickije, manje elemenata i sekcija, vise vazduha.
    Kad biras izmedju "dodaj" i "skini" — skini. Spajaj sekcije, izbacuj dekoraciju.
0b. POZADINA SE NE MENJA i GLOW OSTAJE. Globalna pozadina (DotFieldBackgroundGlobal /
    VideoBackgroundGlobal / --background) ostaje ista i nova se NE uvodi. Glow (ambijentalni +
    reveal/trace glow) se ZADRZAVA — isti fazon kao pocetna i kao dropdown za usluge. NE smanjuj glow.
    Cisti se samo VISAK sitnica: duple/nepotrebne gradient-hairline linije i pretrpani detalji.
0c. POCETNA SE NE DIRA. Hero, TechSection, Timeline, Disciplines su referenca kvaliteta. Menjaju se
    samo stare/prenatrpane stranice (vidi Prompt 0 — identifikacija kroz git istoriju).
1. NE brisi postojece varijante. Liquid-glass dugme i "enigma" varijanta ostaju dostupne.
2. Svaki NOVI CSS token dodaj u SVE palete u globals.css (svetla :root, tamna tema, i "matrix"/green
   tema). Ne ostavljaj token definisan samo u jednoj temi.
3. Postuj i18n "text reveal" ugovor: vrednosti/labeli moraju biti u blok <span>-ovima, nikad go tekst
   direktno u grid celiji. Gde treba iskljuciti reveal, koristi data-reveal="off". Vidi komentare u
   ServiceProofStrip.tsx i ProcessCard.tsx.
4. Sve trace/GSAP ulazne animacije su JEDNOKRATNE i moraju da postuju prefers-reduced-motion preko
   usePrefersReducedMotion({ includeDataAndBattery: false }). Kad je reduce-motion, sadrzaj je odmah vidljiv.
5. Meri border-box (ne content-box) kad crtas trace preko bordera — inace 1px stroke ispadne sa coska.
6. Cuvaj tipove: bez `any`, popuni postojece TS tipove. Na kraju: `npm run build` i `npm run lint` moraju proci.
7. Zadrzi pristupacnost: focus-visible ring, aria-* gde vec postoji, tap-target >= 44px za dugmad/strelice.
8. Ne diraj SEO: service rute su server komponente sa metadata + JSON-LD; ne pretvaraj ih u client bez
   ocuvanja metadata.
```

---

## PROMPT 0 — Rekon: pronađi „staru verziju" i napravi plan čišćenja

> **⚙︎ Podešavanja:** Model **Sonnet** · Effort **visok** (`think hard`) · Mode **Plan**
> — read-only analiza; izbacuje plan, ništa ne menja.

```
ZADATAK (samo analiza — NISTA ne menjaj u ovom koraku): mapiraj sta je "stara verzija" sajta i sta je
prenatrpano, pa vrati plan sazimanja. Ovo je osnova za sve ostale promptove.

1) Pomocu GIT ISTORIJE (ne po mtime — klon je pobrisao datume fajlova) nadji koje su stranice/komponente
   poslednji put realno menjane davno u odnosu na pocetnu:
     - za svaki fajl: `git log -1 --format="%ci %an" -- <putanja>`
     - fokus: app/(pages)/** (about, brand, contact, privacy, terms, projects, services) i app/_components/**
       koje te stranice koriste. Uporedi sa datumima pocetnih fajlova (Hero, Timeline, Disciplines,
       TechSection) da vidis sta je "staro".
2) Za svaku takvu stranicu prebroj SEKCIJE i "elemente" (kartice, glow-kugle, hairline linije, cipove,
   dekorativne divove) i oznaci sta je visak / sta se moze spojiti.
3) Vrati kratak izvestaj u markdownu:
     - tabela: stranica | poslednja prava izmena (git) | # sekcija sada | predlog # sekcija | sta spojiti/izbaciti
     - lista svih `glow-accent blur-[...]` i suvisnih hairline mesta koje treba skloniti (putanja + linija)
     - koje stranice su ocigledno "stara verzija" i kandidati za modernizaciju
   NE menjaj kod. Samo izvestaj. Ja (Jovan) cu potvrditi, pa idemo na Prompt 1+.

Cilj cele akcije: cistije, minimalistickije, manje sekcija. Pozadina ostaje ista. Pocetna se ne dira.
```

---

## PROMPT 1 — Novo CTA dugme: „Trace glass" (varijanta A)

> **⚙︎ Podešavanja:** Model **Sonnet** · Effort **srednji** · Mode **Goal**
> — jasan izvršni zadatak (komponenta + tokeni), pravolinijski.

```
ZADATAK: Dodaj novu CTA varijantu "trace" (plavi border + svetlosni streak na hover) i ucini je
podrazumevanim izgledom za sva CTA dugmad na sajtu. Postojeci liquid-glass izgled OSTAJE dostupan
kao varijanta — ne brisati.

Prvo otvori: components/ui/cta-button.tsx, components/ui/liquid-glass-button.tsx, app/globals.css,
i enigma-proto.html (klase .cta-a i @keyframes sweep su tacna referenca za izgled).

1) TOKENI u app/globals.css:
   - Dodaj token --cta-line (statični plavi border dugmeta). U tamnoj temi = rgba(88,196,255,0.55);
     u svetloj temi izvedi analognu plavu na svetloj pozadini; u "matrix" temi koristi zeleni akcenat.
   - Reuse postojece: --primary (#58c4ff tamna), --border-strong, --glow-accent-1 (cyan glow).
   - Dodaj token u SVE tri palete.

2) NOVA VARIJANTA dugmeta:
   - Napravi novu komponentu components/ui/trace-button.tsx PO UZORU na liquid-glass-button.tsx
     (isti cva pristup, iste velicine sm/default/lg/xl/icon, asChild preko @radix-ui/react-slot,
     Slottable za dodatne slojeve).
   - Izgled "trace" (primary):
       * pozadina: suptilan plavi gradijent (linear-gradient(180deg, rgba(88,196,255,.10), rgba(88,196,255,.02)))
       * border: 1px solid var(--cta-line); rounded-xl; inset hairline gore (box-shadow inset 0 1px 0 rgba(255,255,255,.06))
       * na hover: translateY(-2px), cyan glow (box-shadow 0 10px 30px rgba(56,189,248,.22) + 0 0 0 1px rgba(88,196,255,.25)),
         i svetlosni "sweep" preko bordera preko maskiranog ::before gradijenta (vidi .cta-a::before i @keyframes sweep u prototipu).
       * strelica/ikonica se pomeri +3px na hover (kao u prototipu).
   - Izgled "secondary" = ghost: transparent, border var(--border-soft) -> na hover var(--cta-line), tekst muted -> primary.
   - active:scale(.98); focus-visible ring (zadrzi kao kod liquid dugmeta).
   - prefers-reduced-motion: iskljuci sweep animaciju (ostaje samo promena boje bordera/glow bez kretanja).

3) LEVAK: u components/ui/cta-button.tsx
   - CtaButton neka koristi novu TraceButton po defaultu.
   - Dodaj opcioni prop `look?: "trace" | "glass"` (default "trace"); "glass" renderuje stari LiquidButton.
     Tako je stari stil sacuvan i dostupan po potrebi, a ceo sajt automatski dobija novi izgled jer sva
     CTA idu kroz CtaButton (hero, PageHero, ServiceHero, ServiceFinalCta, projects, footer).
   - Zadrzi postojeci API: href, text/children, variant "primary"|"secondary", size, target, rel, aria-label.

KRITERIJUMI PRIHVATANJA:
- Sva postojeca CTA na sajtu sada imaju "trace" izgled bez menjanja poziva (jer idu kroz CtaButton).
- <CtaButton look="glass"> i dalje daje stari liquid-glass izgled.
- Radi u sve tri teme i u reduced-motion rezimu.
- npm run build i npm run lint prolaze. Nema TS gresaka.
```

---

## PROMPT 2 — Card primitiv + „trace reveal" na scroll (jedan izvor istine)

> **⚙︎ Podešavanja:** Model **Opus** · Effort **visok** (`ultrathink`) · Mode **Plan**
> — osetljiv refaktor deljive GSAP/trace logike; pregledaš plan pa pustiš izvršenje.

```
ZADATAK: Napravi jednu deljivu Card komponentu sa statičnim plavim borderom i (opciono) borderTrace
"unlock" animacijom na ulasku u ekran, pa je primeni na kartice na sajtu. Cilj: prestati sa
kopiranjem border/radius/hairline kroz 8+ fajlova.

Prvo otvori: app/_components/ProcessCard.tsx (odatle vadimo scroll-trace logiku), lib/borderTrace.ts,
hooks/usePrefersReducedMotion.ts, app/globals.css (.theme-card, .card-lift, --border-strong),
i enigma-proto.html (sekcija "02", klase .rcard/.trace i @keyframes streak — referenca).

1) IZVUCI DELJIVU LOGIKU:
   - Napravi hook hooks/useBorderTraceReveal.ts koji: meri border-box elementa (ResizeObserver),
     gradi putanje preko buildBorderTracePaths(w,h,radius,"top"), i na ScrollTrigger ulazak pusta
     jednokratnu animaciju (strokeDashoffset od TRACE_DASH do -TRACE_LENGTH) + fade/blur-in sadrzaja.
     Reuse tacan tempo iz ProcessCard.tsx (TRACE_DASH = TRACE_LENGTH*0.17, ease power1.inOut za trag).
   - Postuj prefers-reduced-motion: tada nema animacije, sadrzaj odmah vidljiv (kao ProcessCard).
   - onLeaveBack sme da resetuje ako zelis, ali default: jednom otkljucano ostaje otkljucano
     (vidi openedRef obrazac u ProcessCard).

2) NAPRAVI KOMPONENTU components/ui/card.tsx:
   - <Card> (staticka): rounded-[16px], border 1px solid var(--border-strong) (mirni plavi),
     background var(--card) (theme-card), cyan hairline gore (linear-gradient(90deg,transparent,cyan,transparent)),
     hover: card-lift + border -> jaca plava + suptilan glow. Props: className, children, as (element).
   - <RevealCard> ili prop `reveal`: obmota <Card> hookom useBorderTraceReveal i doda SVG trace sloj
     (kao ProcessCard: <svg class="trace"> sa dve <path> pathLength=1000).
   - Dodaj opcioni cursor-glow (radial-gradient koji prati misa preko CSS custom props --glow-x/--glow-y),
     isti trik kao u ServicesDropdown DropdownItem (bez React state-a).
   - CISTOCA (ne na racun glowa): border + reveal glow su glavni signal — ISTI fazon kao process
     kartice na pocetnoj (trace + prateci glow/halo OSTAJE). Secis samo VISAK sitnica: duple
     dekorativne linije, previse cipova, pretrpane celije. Glow se zadrzava, detalji se smanjuju.

3) PRIMENI (refaktor, isti sadrzaj, novi primitiv):
   - app/(pages)/services/_components/ServiceCapabilities.tsx  -> kartice kroz <RevealCard>
   - app/(pages)/projects/page.tsx                            -> mreza projekata i "Kako radimo" kartice kroz Card/RevealCard
   - app/_components/PageHero.tsx                             -> highlight kartice kroz <Card>
   - Gde je bila rucna klasa "rounded-3xl border border-theme theme-card ..." zameni <Card>.
   - PAZI na i18n: zadrzi tekst u blok <span>/<h3>/<p> kao sada; ne stavljaj go tekst u grid celije.

KRITERIJUMI PRIHVATANJA:
- Kartice imaju stalan plavi border; na scroll se "otkljucaju" trace-om jednom.
- reduced-motion => kartice odmah vidljive, bez animacije.
- Vizuelno identican sadrzaj kao pre, samo kroz zajednicki primitiv.
- npm run build i npm run lint prolaze.
```

---

## PROMPT 3 — Usluge: skratiti + beskonačan carousel sa fiksnim strelicama

> **⚙︎ Podešavanja:** Model **Opus** · Effort **visok** (`ultrathink`) · Mode **Plan**
> — najsloženiji korak (arhitektura carousela + SEO + animacija); OBAVEZNO prvo plan, pa izvršenje.
> Ako je preveliko, podeli na 3a (kompaktan panel) i 3b (carousel mehanika).

```
ZADATAK: Preradi stranice usluga u KRAĆU, kompaktnu formu i dodaj beskonačan horizontalni carousel:
fiksne strelice na levoj i desnoj ivici ekrana; klik na desnu ubaci sledecu uslugu tako sto ona
"izgura" trenutnu na levo; sa poslednje usluge ide na prvu (beskonacan krug, u oba smera).
Izbaci staru prev/next sekciju (carousel je zamenjuje).

Prvo otvori: app/(pages)/services/_components/ServicePageTemplate.tsx (8 sekcija — previse),
ServiceHero.tsx, ServiceProofStrip.tsx, ServiceCapabilities.tsx, ServiceFaq.tsx, ServiceFinalCta.tsx,
app/(pages)/services/layout.tsx, sve app/(pages)/services/<slug>/page.tsx (server komponente sa
metadata + JSON-LD), constants/services/index.ts, constants/disciplines.ts (DISCIPLINE_ORDER,
disciplineHref), i enigma-proto.html (sekcija "03" — tacna push/infinite/keyboard logika i .arrow stil).

ARHITEKTURA (bitna odluka — uradi ovako):
- NE menjaj <slug>/page.tsx server komponente i njihov metadata + JSON-LD (SEO mora da ostane po ruti).
- Napravi CLIENT komponentu app/(pages)/services/_components/ServiceCarousel.tsx koja:
   * ucita sve servicePages i DISCIPLINE_ORDER;
   * prima initialSlug (iz rute) i pocinje od njega;
   * renderuje KOMPAKTAN panel za tekuci slug (vidi "kompaktan panel" dole);
   * ima fiksne strelice (position: fixed/absolute na ivicama viewporta, vertikalno centrirane, z-index iznad sadrzaja),
     tacke (dots) i podrsku za tastere ArrowLeft/ArrowRight;
   * na next/prev racuna sledeci indeks preko modula po DISCIPLINE_ORDER (beskonacno, oba smera);
   * ANIMIRA "push": incoming panel gura trenutni (translateX), tacno kao two-slide track u prototipu
     (.track / translateX(-50%), transitionend -> snap). Koristi GSAP ili CSS transition, svejedno.
   * sinhronizuje URL BEZ Next rutiranja usred animacije: window.history.replaceState na disciplineHref(next),
     da se animacija ne prekine remount-om. (Direktan ulazak na /services/<slug> i dalje SSR-uje metadata.)
   * reduced-motion => trenutna zamena bez klizanja; mobilni => swipe (touch) + stack fallback.
- ServicePageTemplate.tsx neka renderuje <ServiceCarousel initialSlug={slug} /> umesto 8 sekcija.

KOMPAKTAN PANEL PO USLUZI — "prebrutalna" jedna sekcija (isti izvor podataka servicePages[slug]):
- 8 sekcija -> svedi na JEDAN kompaktan panel (~1 ekran). Manje je vise.
- Zadrzi samo: naslov + kratak lede + 1 CTA + ServiceModelStage 3D desno; ispod toga 3 KRATKA proof
  broja (stats) i najvise 3 capability stavke — kao suptilne linije/cipove, ne kao velike kartice.
- IZBACI: ServiceProofStrip kao zasebnu sekciju, ServiceDifferentiators, ServiceDeliverables i
  ServiceProcess kao velike sekcije (proces max kao 3 sitna koraka u jednoj liniji ako bas mora),
  i ServiceFinalCta prev/next navigaciju (carousel je zamenjuje).
- GLOW OSTAJE: zadrzi ambijentalni glow (isti fazon kao pocetna) i reveal glow/trace. Ne skidaj glow.
  Secis SADRZAJ i SITNICE: spajas sekcije, manje cipova, bez duplih hairline linija. Globalna pozadina
  ostaje ista; ne dodajes novu.
- Cilj: jedan jak reveal (sa glowom kao na pocetnoj), bez dugackog skrola. Mesovita publika (i stariji)
  — kratko, jasno, cisto, ali i dalje "zivo" uz glow.

PERFORMANSE: u carousel-u lazy-mount 3D model (ServiceModelStage) samo za AKTIVNU uslugu
(i eventualno susede), ne za svih 6 odjednom.

KRITERIJUMI PRIHVATANJA:
- Strelice su fiksne na ivicama ekrana; rade i klik i tasteri ← →; dots skacu na uslugu.
- Beskonacan loop u oba smera; sa poslednje na prvu i obratno.
- Push animacija (incoming gura tekuci); URL se azurira; direktan load rute i dalje radi + zadrzava SEO.
- Stranica je osetno kraca; reduced-motion i mobilni rade.
- npm run build i npm run lint prolaze.

Napomena: ako je prevelik za jedan prolaz, uradi u dve faze — (3a) kompaktan panel + skracivanje,
(3b) carousel mehanika + strelice + URL sync. Ali zavrsi obe pre "gotovo".
```

---

## PROMPT 4 — FAQ redizajn (kompaktno, u sistemu)

> **⚙︎ Podešavanja:** Model **Sonnet** · Effort **srednji** · Mode **Goal**
> — kompaktan restyle sa jasnim kriterijumima.

```
ZADATAK: Redizajniraj FAQ da bude kompaktan i u istom jeziku kao kartice (plavi border, cyan hairline,
"+" koji se okrene u "×"). Zadrzi pristupacan collapse.

Prvo otvori: app/(pages)/services/_components/ServiceFaq.tsx (vec koristi grid-template-rows 0fr/1fr
collapse i data-reveal="off" — zadrzi to), components/ui/card.tsx (iz Prompta 2),
i enigma-proto.html (sekcija "04" — referenca za izgled).

- Omotac FAQ-a: <Card> sa plavim borderom i cyan hairline gore.
- Svaka stavka: dugme (aria-expanded, aria-controls) + "+"/"×" indikator (rotate-45 na open),
  aktivna stavka naslov u plavoj (--primary). Zadrzi grid 0fr/1fr collapse (bez magicnih max-height).
- Kratko: podrazumevano prva otvorena; ostale zatvorene.
- Ako je FAQ ostao unutar service carousel panela iz Prompta 3, ubaci ga kao sitnu sekciju panela;
  ako je zaseban, neka bude jedna kompaktna sekcija. Ne duplirati logiku — ista ServiceFaq komponenta.
- Postuj i18n (tekst u blok elementima) i reduced-motion.

KRITERIJUMI PRIHVATANJA:
- FAQ vizuelno pripada sistemu (plavi border, cyan hairline, +/×), kompaktan.
- Pristupacnost ocuvana (tastatura, aria, focus-visible).
- npm run build i npm run lint prolaze.
```

---

## PROMPT 5 — Projekti: smiriti hero + stranicu

> **⚙︎ Podešavanja:** Model **Sonnet** · Effort **srednji** · Mode **Goal**
> — sažimanje sekcija + primena Card/CTA iz prethodnih koraka.

```
ZADATAK: Smiri i osnazi stranicu Projekti. Trenutni hero je prenatrpan; napravi cist H1, par proof
brojki, i prvi projekat kao veliki "featured" panel, a ostale u mrezi novih kartica sa trace reveal.

Prvo otvori: app/(pages)/projects/page.tsx, components/ui/card.tsx (Prompt 2),
components/ui/cta-button.tsx (Prompt 1), constants/projects, i enigma-proto.html.

- SAZMI SEKCIJE: stranica sada ima 4 sekcije (hero, mreza, "Kako radimo", CTA). Spusti na 2:
  (1) hero + odmah mreza projekata, (2) jedan kompaktan zavrsni CTA. "Kako radimo" ili izbaci
  (to je vec na usluge/početnoj) ili ga sazmi u jedan red od 3 sitna koraka unutar hero-a.
- HERO: eyebrow + kratak, jasan H1 (moze AutoTypingConsole, ali krace), 1 recenica lede, 2 CTA
  (nova trace dugmad), i najvise 3 proof metrike kao sitne plocice (vrednost u blok <span> — i18n/reveal).
  ZADRZI glow (isti fazon kao pocetna) — ne skidaj ga; smanjuje se broj sekcija/cipova, ne glow.
- LISTA: prvi projekat kao veliki featured <RevealCard> (media + opis), ostali u mrezi 2 kolone kroz
  <RevealCard>. Zadrzi ShowcaseVideo/monogram fallback. Manje cipova po kartici (max 3), vise vazduha.

KRITERIJUMI PRIHVATANJA:
- Hero je mirniji i jasniji; prvi projekat istaknut; ostali u trace karticama.
- Sva dugmad = nova trace varijanta; kartice = novi Card primitiv.
- npm run build i npm run lint prolaze.
```

---

## PROMPT 6 — QA / verifikacija (na kraju)

> **⚙︎ Podešavanja:** Model **Sonnet** · Effort **srednji** · Mode **Goal**
> — build/lint/typecheck + provera tema, reduced-motion i pristupačnosti.

```
ZADATAK: Zavrsna provera celog seta izmena.

1) Pokreni: npm run build, npm run lint, i (ako postoji) tsc --noEmit. Popravi sve greske.
2) Rucno prodji kroz teme: svetla, tamna, "matrix" — proveri da novi --cta-line i svi novi tokeni
   postoje u sve tri palete i da nista nije nevidljivo/nizak kontrast.
3) prefers-reduced-motion: ukljuci u dev tools i potvrdi da su trace/carousel animacije iskljucene,
   a sadrzaj odmah vidljiv i upotrebljiv.
4) Pristupacnost: focus-visible na dugmadima i strelicama, aria-expanded na FAQ, tap-target >= 44px,
   tastatura na carousel-u (← →).
5) Mobilni: strelice/carousel rade na dodir; kartice se ne lome; nema horizontalnog scroll-a.
6) Kratko izvesti sta je promenjeno po fajlu i da li je build cist.

Ne menjaj deploy konfiguraciju.
```

---

## Kratke napomene za tebe (Jovan)

- **Redosled je bitan.** Prompt 1 i 2 su „temelj"; 3/4/5 ih koriste. Ako preskočiš, Claude Code će morati
  da improvizuje stil dugmeta/kartice na više mesta i opet dobijaš nedoslednost.
- **Najteži je Prompt 3** (carousel + SEO + animacija). Tu sam Claude Code-u dao tačnu arhitekturu
  (client carousel + `history.replaceState`, server rute ostaju zbog metadata). Ako želiš „pravu" promenu
  rute sa horizontalnim prelazom, alternativa je View Transitions API — reci mi pa ti napišem tu varijantu.
- **Prototip = ugovor o izgledu.** Dok god je `enigma-proto.html` u repou, Claude Code ima tačne vrednosti
  i manje šanse da „odluta".

Reci mi ako hoćeš da neki prompt razložim sitnije (npr. Prompt 3 na 3a/3b), da dodam prompt za
navbar/footer, ili da ti napišem i prompt za `deploy-to-production` na kraju.
