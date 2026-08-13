# REPORT-08 — Mala CTA sekcija ispod FAQ-a

Krug 2, korak 08/12. Grana `feat/redesign-round2`. Status: **prošlo, komitovano.**

## Šta je urađeno

- Novi fajl `app/(pages)/services/_components/ServiceFaqCta.tsx` — jedna sekcija:
  naslov + `CtaButton` (TraceButton, `look="trace"`) jedno pored drugog
  (`flex-col` → `sm:flex-row`, prelama se ispod na mobilnom).
  - Naslov: „Imate specifično pitanje?"
  - Dugme: „Pitajte nas" → `href="/contact"`
  - Bez kartice/bordera — samo `site-gutter`/`site-container` razmak (`py-14 sm:py-16`),
    isti sistem koji koristi svaka druga sekcija na sajtu.
- Uklopljeno u `ServiceCarousel.tsx`, odmah ispod `<ServiceFaq>` (FAQ akordeon ostaje
  nepromenjen — sekcija je nova, ne zamenjuje ništa).
- `lib/i18n.ts`: dodat `[en, sr]` par za oba stringa ("Have a specific question?" /
  "Ask us") u novoj sekciji "Service FAQ CTA".

## Bug nađen i ispravljen usput

Naslov je isprva bio običan `<h2>` (nasleđuje site-wide Microgramma display font
pravilo iz `globals.css`). U toj kombinaciji font/veličina, Microgramma je
mid-word renderovala malo `č` kao veliko `Č` — „specifiČno" umesto „specifično"
(vizuelno potvrđeno screenshotom, uporedio sam sa drugim h1/h2 na sajtu koji imaju
lowercase č na drugim mestima i tamo je render bio ispravan, pa je izgledalo kao
kontekstualni font/glyph problem specifičan za ovu kombinaciju reči+veličine, ne
generalni bag sajta).

Rešenje: `data-display-font="off"` na `<h2>` + `font-aeonik` — ova sekcija je
label/chrome pored dugmeta, ne headline, pa je opt-out iz styling.md dokumentacije
tačno predviđen za ovaj slučaj. Nakon toga naslov renderuje ispravno na svim
veličinama viewporta.

## Verifikacija

- `npm run lint` — prošlo, bez upozorenja.
- `npm run build` (Turbopack, TypeScript uključen) — prošlo, svih 16 statičkih
  stranica generisano bez grešaka.
- Playwright (pravi browser, MCP): učitana `/services/web-development`, potvrđeno:
  - sekcija se renderuje odmah ispod FAQ akordeona, iznad footera
  - naslov + dugme su horizontalno poređani na desktop širini (1280px)
  - na mobilnom viewportu (390×844) se prelamaju jedno ispod drugog (screenshot)
  - dugme "Pitajte nas" vodi na `/contact`
  - EN prekidač: naslov → "Have a specific question?", dugme → "Ask us"
  - console: 0 grešaka

## Fajlovi

- `app/(pages)/services/_components/ServiceFaqCta.tsx` (nov)
- `app/(pages)/services/_components/ServiceCarousel.tsx` (izmenjen — import + mount)
- `lib/i18n.ts` (izmenjen — 2 nova `[en, sr]` para)

## Napomena

`.claude/launch.json` je bio izmenjen u working tree-u pre početka rada na ovom
koraku (dodat `enigma-logo-worktree` launch config) — nepovezano sa ovim zadatkom,
nije komitovano, ostavljeno netaknuto u working tree-u.
