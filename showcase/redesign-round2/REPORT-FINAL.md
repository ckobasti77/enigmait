# REPORT-FINAL — Krug 2, završni pregled (korak 12/12)

Datum: 2026-08-13, noćni autonomni lanac.
**Grana: `feat/redesign-round2` (od `feat/redesign-clean`) — NIJE push-ovana. Ništa nije deploy-ovano.**

---

## 1. Verifikacija koda (korak 12, sveže pokrenuto)

| provera | rezultat |
|---|---|
| `npm run build` | ✅ Next.js 16.2.6 + Turbopack, compile 9.9s, TypeScript 9.2s, **16/16 statičkih strana**, sve rute `○ (Static)` |
| `npm run lint` | ✅ ESLint bez ijednog upozorenja/greške (prazan izlaz) |
| `npx tsc --noEmit` | ✅ exit 0, bez grešaka |

Nijedna popravka nije bila potrebna — radno stablo je bilo čisto i sve tri provere su prošle iz prve.

## 2. Sažetak koraka 01–11

| korak | status | šta | commit | ključni fajlovi |
|---|---|---|---|---|
| 01 — grana + priprema | **OK** | grana iz `feat/redesign-clean`, folderi, provera round-1 komponenti (sve nađeno) | `edfcbbb` | `showcase/redesign-round2/` |
| 02 — CTA puls + radius + nav u CTA jeziku | **OK** | `cta-breathe` puls (3.2s, samo opacity), `--surface-radius: 14px` kao jedan izvor istine (CSS + 3 JS blizanca), `.cta-rim` na nav ostrvu i switcheru, vidljiviji ghost | `f466b68` | `globals.css`, `trace-button.tsx`, `Navbar/NavLinks/LanguageSwitcher`, `useBorderTraceReveal.ts`, `ProcessCard.tsx`, `ServicesDropdown.tsx` |
| 03 — logo kocka | **OK** | PNG emblem → inline SVG kocka od 4 prstena; ugao fitovan IoU-om na stari PNG (azimut 33°, elevacija 22° = hero kamera); draw→hold→fade→pauza loop 2.2s; reduced-motion = statična iscrtana | `21963e8` | `constants/logoCubeMark.ts`, `components/EnigmaCubeMark.tsx`, `globals.css`, `Navbar.tsx` |
| 04 — redosled sekcija | **OK** | `/` sada Hero → Timeline → Disciplines → TechSection; provereno da nijedna sekcija ne zavisi od apsolutne pozicije | `beda371` | `app/page.tsx` (jedina izmena) |
| 05 — discipline slajder | **OK** | vertikalni reel → beskonačan horizontalni slajder (wrap u oba smera, WAAPI push kopije + reel po kamerinoj osi, isti bezier); wheel budžet da ne zarobi scroll; tutorial pilula; WebGL se ne remountuje | `2d6644c` | `components/sections/disciplines/*`, `globals.css`, `lib/i18n.ts` |
| 06 — čist slajd usluga | **OK** | levi blok = h1 → lede → CTA → 3 capability čipa na dnu; eyebrow/brojač/proof skinuti (podaci ostaju u `constants/services/*`); providan panel (dark odličan, light „mekši" — vidi §4) | `a429905` | `ServicePanel.tsx`, `globals.css` |
| 07 — plave strelice + scroll dots | **OK** | disk-dugmad → goli caret (52px hit-area / 36px caret), hover iscrtavanje iz vrha ka oba kraka; wheel nad dots redom (1 notch = 1 slajd, cooldown 660ms, budžet 5) | `f215da0` | `ServiceCarousel.tsx`, `globals.css` |
| 08 — kontakt-CTA ispod FAQ | **OK** | nova sekcija naslov + „Pitajte nas" → `/contact`; usput nađen Microgramma glyph kvar (`č` → `Č`) i rešen `data-display-font="off"` | `67b28a1` | `ServiceFaqCta.tsx` (nov), `ServiceCarousel.tsx`, `lib/i18n.ts` |
| 09 — kontakt redesign | **OK** | glass forma (`.contact-glass`, bez displacement filtera), floating labels (pravi `<label for>`), 7 interes-pilula (checked = CTA puls), `interests` u server akciji (whitelist), mejl → `office@enigmait.rs` svuda (i pravne strane) | `d308228` | `ContactForm.tsx`, `actions.ts`, `contactInterests.ts` (nov), `page.tsx`, `globals.css`, `socialLinks.tsx` |
| 10 — capture mockupa | **delimično → OK** | prvi run pao/prekinut (1 slika od 24); skripta bila ispravna, **ponovo pokrenuta u koraku 11: 24/24 OK** (6 projekata × 4 veličine, 1.01 MB ukupno) | u `2423807` | `scripts/capture-mockups.mjs`, `public/mockups/*`, `constants/projectMockups.ts` |
| 11 — mockup klaster | **OK** | korice projekata = kompozicija 4 uređaja (monitor/laptop/tablet/telefon, cik-cak, container-query geometrija u „u" jedinicama); laptop pušta scroll video, ostali pravi responsive snimci; lazy (3 zahteva na load), LCP `priority` na izdvojenom | `2423807` | `project-mockup-cluster.tsx` (nov), `useInViewOnce.ts` (nov), `mockupClusterConfig.ts` (nov), `projects/page.tsx`, `globals.css` |

Svaki korak ima svoj detaljan izveštaj: `showcase/redesign-round2/REPORT-01.md` … `REPORT-11.md`.
Build + lint + tsc su prolazili u svakom koraku pojedinačno i prolaze zbirno sada (§1).

## 3. Vizuelni pregled (korak 12, Playwright, dev server, 1440×900)

Screenshotovi: `showcase/redesign-round2/review/round2-12-*.png` (13 slika; folder je u
`.gitignore` kao i u prethodnim koracima — artefakti na disku, ne u repou):

- početna: `home-{light,dark}-top`, `home-{light,dark}-disciplines`
- usluge indeks: `services-{light,dark}` · slajd usluge: `service-slide-{light,dark}` (`/services/web-development`)
- kontakt: `contact-{light,dark}` · projekti: `projects-{light,dark}`, `projects-dark-grid`

Provereno okom i/ili merenjem u browseru, u obe teme:

| princip | nalaz |
|---|---|
| pozadina ista | ✅ `.bg-video-layer` prisutan, `isolation: isolate` + opaque background; dot-wave vidljiv na svakom screenshotu, niko je nije dirao |
| glow prisutan | ✅ hero kocka, ambient glow servisnog panela, caret glow na strelicama, `--cta-pulse-glow` na CTA/nav |
| reveal prisutan | ✅ kopija stiže reč-po-reč (mid-flight blur uhvaćen u ranijim koracima; ovde bez zaostale nevidljive kopije) |
| CTA lagano pulsira | ✅ `::after` = `cta-breathe 3.2s ease-in-out infinite` na primarnom CTA |
| nav/switcher u jeziku CTA | ✅ `.nav-pill.cta-rim` border = `--cta-line` (`rgba(2,132,199,0.45)` u light), isti puls |
| radius usklađen | ✅ CTA i nav ostrvo mereno **14px** (`--surface-radius`) |
| novi redosled početne | ✅ DOM: Hero → Timeline → Disciplines → TechSection → Footer |
| disciplines slajder | ✅ strelice + 6 tačkica (aktivna izdužena 25.6×8px), model + kopija u obe teme |
| logo kocka | ✅ 4 `.logo-cube-ring`, animacija `logo-cube-draw`; uhvaćena i mid-draw faza na screenshotu |
| slajd usluge | ✅ čist panel (h1→lede→CTA→čipovi), goli plavi careti levo/desno, dots ispod |
| kontakt | ✅ `.contact-glass` `blur(18px) saturate(1.5)`, floating labels, 7 pilula, sva 3 `mailto:` → `office@enigmait.rs` |
| projekti | ✅ 6/6 `.mockup-cluster`, uređaji sa pravim responsive snimcima, featured najveći |
| konzola | ✅ **0 grešaka** na svim stranicama (samo zatečena upozorenja: `THREE.Clock` deprecation i sl.) |

Napomena o postupku: Playwright profil je nosio kolačić teme `light`, pa je tamna tema
uključivana toggle-om po stranici (kolačić se ne upisuje bez functional consent-a — to je
dizajn sajta, ne bag).

## 4. ZA PREGLED UJUTRU (ručno, subjektivno)

1. **Logo kocka (navbar)** — loop je draw → hold → fade → **pauza**, pa emblem deo vremena
   ne postoji (u nekim kadrovima navbar stoji bez znaka; vidi `service-slide-dark`). Tehnički
   je to dizajnirana pauza od 0.66s — proceni uživo da li „prazan znak" smeta, posebno na
   stranicama gde je oko često u gornjem levom uglu. Ako smeta: skratiti pauzu ili produžiti hold
   u `@keyframes logo-cube-draw` (`globals.css`).
2. **Disciplines slajder** — tempo push-a, čitljivost kopije u letu i tutorial pilula
   („Skrolujte ovde") se ocenjuju samo rukom na točkiću. Tačkice su u svetloj temi dosta
   suptilne (DOM ih ima, izmerene) — proveri da li trebaju pojačanje.
3. **Projekti — mockup klasteri** — gustina četiri uređaja po kartici je stvar ukusa; u
   `projects-dark-grid.png` ABLux laptopu sadržaj počinje odmah na gornjoj ivici ekrana
   (capture kadar) — pogledaj da li neki snimak zaslužuje ponovni capture
   (`node scripts/capture-mockups.mjs` regeneriše sve).
4. **Providan servisni panel u light temi** (korak 06) — dark je odličan; light je „mekši"
   i sam REPORT-06 preporučuje pogled uživo pre nego što se providnost prenese dalje.
5. **Microgramma `č` glyph** — dva naslova su na opt-out-u (`data-display-font="off"`) jer
   font mid-word `č` crta kao `Č` (REPORT-08/09). Svaki budući naslov sa `č` u sredini reči
   može isto — vredi zapamtiti pri pisanju kopije.
6. **Kontakt forma** — stvarno SMTP slanje NIJE testirano (zahtevalo bi produkcijske
   kredencijale; wire format `interests` provere je prošao). Jednom ručno poslati poruku.

### Preskočeno / palo u krugu (i zašto)

- **Korak 10 prvi run** — pao/prekinut posle 1/24 slike; saniran u koraku 11 ponovnim
  pokretanjem iste skripte (24/24). Nema ostatka za sanaciju.
- **Footer nije dobio emblem** (korak 03) — emblem je postojao samo u navbaru; dodavanje u
  footer bi bilo širenje opsega. Jedan `<EnigmaCubeMark>` ako se poželi.
- **Mobilni screenshotovi u ovom koraku** — nisu pravljeni (zadatak traži OBE teme na 4
  stranice, urađeno na 1440×900); mobilne provere postoje po koracima (02, 05, 06, 08, 09, 11).
- **Ništa nije popravljano u koraku 12** — nije bilo šta: build/lint/tsc čisti, konzola bez grešaka.

## 5. Git

```
$ git log --oneline feat/redesign-clean..feat/redesign-round2
2423807 feat(projects): device-mockup klaster po projektu (laptop video + slike)
d308228 feat(contact): glass forma, floating labels, interes-pilule, mejl office@enigmait.rs
67b28a1 feat(services): mala kontakt-CTA sekcija ispod FAQ-a
f215da0 feat(services): plave strelice bez bordera + hover iscrtavanje + scroll dots
a429905 feat(services): čist slajd — bez eyebrow/proof, capability čipovi na dnu
2d6644c feat(home): discipline kao beskonačan slajder + scroll/tooltip
beda371 feat(home): novi redosled — Timeline pa Disciplines pa TechSection
21963e8 feat(logo): 3D kocka emblem sa brzim draw→fade loop-om
f466b68 feat(cta,nav): lagani puls CTA, ujednačen radius, nav/switcher u CTA jeziku, vidljiviji ghost
edfcbbb chore(round2): grana + priprema (REPORT-01)
```

(Povrh ovoga stoji još samo završni docs commit ovog izveštaja.)

**Grana: `feat/redesign-round2` (od `feat/redesign-clean`) — NIJE push-ovana. Ništa nije deploy-ovano.**

## 6. Kako da pregledaš

```bash
git switch feat/redesign-round2
npm run dev        # localhost:3000
```

Redosled obilaska: početna (redosled sekcija, logo kocka u navbaru, disciplines slajder
točkićem) → `/services/web-development` (slajd, strelice, wheel nad tačkicama, FAQ CTA) →
`/contact` (forma, pilule, floating labels) → `/projects` (klasteri). Obavezno obe teme.

## 7. Kako da vratiš

```bash
git switch feat/redesign-clean   # round-1 stanje
git switch main                  # produkcijsko stanje
```

Grane se ne diraju međusobno — round-2 je ceo na svojoj grani.
