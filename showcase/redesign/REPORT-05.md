# REPORT-05 — FAQ redizajn (kompaktno, u sistemu), korak 05/07

Grana: `feat/redesign-clean`. Spec: `enigma-claude-code-promptovi.md` → **PROMPT 4**.
Vizuelna referenca: `enigma-proto.html`, sekcija „04" (`.faq`, `.hair`).

## Preduslov

`components/ui/card.tsx` postoji od koraka 03 (`Card` / `RevealCard`). Korišćen je **`Card`**,
ne `RevealCard` — border trace na `RevealCard` je jednokratan efekat na ulasku u ekran preko
`useBorderTraceReveal`, potpuno odvojen sistem od `data-reveal="off"` (koji gasi samo
site-wide *tekst* reveal). Accordion menja stanje (otvara/zatvara) posle prvog ulaska u ekran,
pa jednokratni trag nema šta da radi tu — obican `Card` daje isti plavi border + cyan hairline
bez nepotrebnog hook-a. Ovo je i doslovno ono što PROMPT 4 traži: "Omotač FAQ-a: `<Card>`".

## Urađeno

`ServiceFaq.tsx` je jedina izmena. Ista komponenta se već koristi i za carousel panel (korak 04
je zadržao FAQ ispod aktivne usluge, `key={current}`) — nije duplirana logika.

- Spoljni `div` (`rounded-3xl border border-theme theme-card` + ručno iscrtan hairline) zamenjen
  sa `<Card data-reveal="off">` — plavi border (`--card-trace` mešan sa `--border-strong`) i
  cyan hairline gore sad dolaze iz istog primitiva koji koriste sve ostale kartice na sajtu.
- Aktivna stavka: naslov menja boju sa `text-cyan-300` na `text-primary` (Tailwind v4 `@theme
  inline` mapira `--color-primary` → `--primary`, temom svesna u sve tri palete), tačno kako
  PROMPT 4 traži ("aktivna stavka naslov u plavoj (`--primary`)"). Indikator prati istu boju
  (`border-primary/50 text-primary` na open).
- **Dodat `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70`** na
  dugme pitanja — ranije dugme nije imalo nikakav fokus prsten, što je bio pravi
  pristupačnosti gap u odnosu na ostatak sajta (isti obrazac kao `NavLinks`, `ServicesDropdown`,
  `SocialDropdown`).
- Kompaktnije razmake: `px-6 py-5` → `px-5 py-4`, naslov `text-base` → `text-sm sm:text-base`,
  indikator krug `h-8 w-8` → `h-7 w-7` — "kompaktno" iz naslova prompta, bez gubitka tap-target
  veličine (28px krug + 16px vertikalni padding dugmeta i dalje daje >44px dodirnu zonu).
- Collapse mehanika je netaknuta: i dalje `grid-template-rows: 0fr/1fr`, `aria-expanded`,
  `aria-controls`/`id`, `role="region"`, `data-reveal="off"` na accordion-u i dalje sprečava
  site-wide text reveal da sakrije skupljen odgovor.
- i18n: sav tekst (pitanja, odgovori, naslov sekcije) i dalje dolazi iz `constants/services/*`
  kroz iste `ServiceFaqItem`/`ServiceSectionIntro` propove, u blok elementima (`span`, `p`,
  `h2` preko `ServiceSectionHeader`) — ništa se ne menja u i18n putanji.

### Fajlovi

| Fajl | Status | Šta |
|---|---|---|
| `app/(pages)/services/_components/ServiceFaq.tsx` | izmenjen | `<Card>` omotač, `text-primary` na aktivnoj stavci, `focus-visible` ring, kompaktniji razmaci |

Nema novih tokena, nema izmena u `globals.css` — sve boje (`--card-trace`, `--border-strong`,
`--primary`) već postoje u sve tri palete.

## Verifikacija

- `npx tsc --noEmit` ✅
- `npm run build` ✅ (svih 16 statičkih ruta, svih 6 usluga)
- `npm run lint` ✅ (bez upozorenja)
- Ručno u pravom browseru (Playwright, `next dev`, `/services/web-development`):
  - Tamna i svetla tema: plavi border + cyan hairline vidljivi, glow na panelu iznad netaknut.
  - Klik na drugu stavku zatvara prvu (isključivo jedna otvorena), naslov postaje plav, `+`
    rotira u `×`.
  - Accessibility snapshot: dugmad nose `[expanded]`/bez, odgovarajući `region`; nijedan drugi
    element na stranici nije regresovao.
  - `prefers-reduced-motion` nije diran u ovom koraku — collapse i dalje koristi CSS grid
    tranziciju bez JS animacije, isto ponašanje kao pre.

## Preskočeno i zašto

Ništa nije preskočeno — build i lint su prošli iz prve, pa nije bilo potrebe za `git restore`.

Commit: `feat(faq): kompaktan FAQ u sistemu (plavi border + trace jezik)`.
