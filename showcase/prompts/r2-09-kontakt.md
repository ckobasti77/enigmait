⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital". KRUG 2, KORAK 09/12, grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — lokalno. Pozadina ista; GLOW OSTAJE. Novi token → u sve 3 palete. i18n [en,sr].
TS bez any. prefers-reduced-motion poštovan. Dostupnost obavezna (label-i, fieldset/legend, aria). Prvo otvori:
app/(pages)/contact/page.tsx, app/(pages)/contact/_components/ContactForm.tsx, app/(pages)/contact/actions.ts.
Glass referenca: .nav-panel-body (pozadina services dropdown-a) i .liquid-glass u globals.css.

═══ ZADATAK 09 — Redizajn kontakt stranice i forme ═══
1) Skini eyebrow na vrhu („gradimo zajedno" / kicker) — skroz.
2) Mejl: promeni prikazani mejl (i mailto ako postoji) na **office@enigmait.rs** (bilo je hello@…). Proveri i footer/JSON-LD
   ako isti mejl stoji negde drugde na kontaktu.
3) POZADINA FORME = liquid-glass, NE iskošeno/zakrivljeno: kontejner forme dobija glass pozadinu u fazonu
   .nav-panel-body (blur+wash+rim), uspravno (bez skew-a). Samo pozadina/materijal, forma ostaje pravougaona.
4) INPUTI = FLOATING LABELS: bez odvojenog statičnog labela — label stoji kao placeholder u inputu; na fokus se
   animativno diže na poziciju labela; na blur ako je input PRAZAN vraća se u placeholder poziciju, ako NIJE prazan
   ostaje gore kao pravi label. Mora biti pristupačno (pravi <label> vezan for/id, ne fake placeholder). Primeni na
   sva tekstualna polja (ime, email, poruka…).
5) MULTI-SELECT „PILULE" — „Šta vas zanima?": grupa checkbox-ova stilizovanih kao male pilule (vizuelno skriven
   checkbox + label pilula), VIŠE može biti čekirano. Opcije redom: Opšte, Website, Mobilna aplikacija, Dizajn,
   Branding, SEO i GEO, Društvene mreže. ČEKIRANO stanje → pulsing-glow border kao CTA (reuse puls/token --cta-line
   iz koraka 02). Obavij u <fieldset> sa <legend> „Šta vas zanima?". Uvedi izabrane u slanje forme:
   actions.ts dobija polje `interests: string[]` (ili CSV) i uključi ga u mejl/telo. Ako je prazno, dozvoljeno.
6) Zadrži postojeću validaciju/slanje i poruke o uspehu/grešci; samo dodaj novo polje i novi izgled.

VERIFIKACIJA (pre commit-a): npm run build + lint (+ tsc) prolaze; nema eyebrow-a; mejl = office@enigmait.rs;
forma ima glass pozadinu (bez skew-a); floating label radi (fokus/blur/prazno-neprazno); pilule se čekiraju (multi),
čekirane pulsiraju glow border; interests stiže u actions.ts; EN/SR prevod; dostupnost (aria/fieldset) ok; reduced-motion ok.
- Prolazi: `git add -A && git commit -m "feat(contact): glass forma, floating labels, interes-pilule, mejl office@enigmait.rs"`.
- Ne prolazi posle razumnog truda: `git restore .` + `git clean -fd` (tvoji fajlovi), stablo čisto, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-09.md`.
