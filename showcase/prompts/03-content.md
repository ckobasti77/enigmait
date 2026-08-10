# KORAK 3 — Pravi podaci o projektima i uklanjanje izmišljenog sadržaja

Radiš u repou `enigma-digital`. Ovo je automatski, nenadgledan rad. Niko ti neće odgovoriti
na pitanje — donosi odluke sam, zapiši ih u izveštaj i nastavi. Ne staj i ne traži potvrdu.

Pročitaj `AGENTS.md`, `constants/brand-guidelines.ts` (ton i glas brenda), i
`showcase/REPORT-01.md` + `showcase/REPORT-02.md` da vidiš šta je spremno.

Menjaš: `constants/projects.ts` (nov fajl), `app/(pages)/projects/page.tsx`, i pišeš
`showcase/REPORT-03.md`. Ne diraj capture i encode skripte.

## Zašto ovo radimo

`app/(pages)/projects/page.tsx` trenutno prikazuje ČETIRI IZMIŠLJENA case study-ja:
Helios Labs, Orbit Airlines, Northwind Bank, Mercury Collective. Uz njih idu DVA IZMIŠLJENA
testimonijala sa punim imenom i funkcijom (Amelia Rhodes, Chief Product Officer, Helios Labs;
Jonas Richter, VP Engineering, Orbit Airlines) i TRI IZMIŠLJENE STATISTIKE
(+120% prosečan rast saobraćaja, 12 pokrenutih tržišta, 97% zadržavanje klijenata).

Sve to izlazi napolje. Agencija koja u sopstvenim brand guidelines-ima piše
"tvrdnje potkrepite rezultatima" ne sme da ima izmišljene klijente sa imenom i prezimenom na sajtu.

## Šta ulazi umesto toga

Šest stvarnih projekata. Izvor istine za sadržaj je `showcase/captures/<id>/content.txt`
(izvučen tekst svakog sajta) plus `notes` polja u `showcase/showcase.config.json`.

Napravi `constants/projects.ts` po uzoru na ostale fajlove u `constants/` (isti stil, isti
način izvoza, TS tipovi). Predloženi oblik, prilagodi ako imaš bolji:

```ts
export type ProjectCategory = "web" | "mobile" | "system" | "marketing";

export type ProjectMedia = {
  mp4: string; webm: string; mp4Sm: string; webmSm: string; poster: string;
};

export type Project = {
  id: string;
  name: string;
  url: string;
  category: ProjectCategory;
  tag: string;            // delatnost, npr. "Lepota i nega" — kratko, ide u pill
  monogram: string;       // dvoslovni fallback kad nema medija
  title: string;          // naslov kartice
  summary: string;        // 2 recenice, sta je sajt i cemu sluzi
  scope: string[];        // sta je uradjeno: npr. ["Web sajt", "Web-shop", "SEO"]
  media: ProjectMedia | null;
};
```

Projekti (id-jevi su isti kao u showcase configu):
`lady-gaga-studio`, `ablux-travel`, `gbmt`, `the-original-way`, `fides-gradnja`, `digist`.

`media` postavi samo za one koji stvarno imaju fajlove u `public/showcase/<id>/`. Za ostale
`null` — kartica tada prikazuje postojeći dizajnirani cover sa monogramom, i to je u redu.

## Pravila za pisanje teksta — ovo je najvažniji deo

- Srpski, latinica. Ton po `constants/brand-guidelines.ts`: samouverena toplina, senior partner,
  bez agencijskog ukrasa i bez hype-a.
- **Nula izmišljenih brojeva.** Nema procenata, nema "povećali smo konverziju za X", nema broja
  korisnika, nema perioda isporuke — osim ako to doslovno piše u `content.txt` tog sajta.
  Ako nemaš metriku, opiši opseg posla. To je pošteno i i dalje prodaje.
- Nema imena klijenata kao referenci osim naziva firme koja je ionako javno na sajtu.
- `summary` najviše dve rečenice. Bez superlativa tipa "revolucionarno", "vrhunsko rešenje".
- Piši o tome ŠTA sajt radi za svoj biznis, ne o tehnologiji. Tehnologija ide u `scope`.

Ono što već znam i možeš da koristiš:
- `gbmt` = Global Beo Mobil Trend, video nadzor (ugradnja i održavanje sistema) i iskopni radovi.
- `lady-gaga-studio` = frizerski salon i studio za negu kose u Šapcu, sa prodajom proizvoda.
- `ablux-travel` = turistička agencija, verski turizam, aranžmani, rent-a-bus sa vozačem.
- `the-original-way` = e-commerce, kurirana evropska garderoba i obuća.
- `fides-gradnja` i `digist` — pročitaj `content.txt`, ja ih nisam video.

## Izmene na stranici

`app/(pages)/projects/page.tsx`:
- `caseStudies` niz izlazi, stranica čita iz `constants/projects.ts`.
- `testimonials` — cela sekcija izlazi. Ne izmišljaj zamenu, ne stavljaj prazan state.
  Bolje kraća iskrena stranica nego duža lažna.
- `stats` (+120%, 12, 97%) — izlaze. Ako imaš tačan i proverljiv broj (npr. broj projekata),
  smeš da ga zadržiš. Ako ne, ukloni ceo blok statistika.
- Sav prateći copy na stranici (uvodni pasus, "Dokazana isporuka", CTA tekstovi) pročitaj i
  ispravi sve što tvrdi nešto neproverljivo — "12 pokrenutih tržišta", "97% zadržavanja",
  "lansiranja gde su ulozi visoki" i slično. Zadrži strukturu i dizajn stranice, menjaš sadržaj.
- Grid je bio `md:grid-cols-2` za 4 kartice; sada ih je 6. Proveri da raspored i dalje diše.

Ne menjaj vizuelni jezik, klase, boje ni raspored sekcija više nego što sadržaj zahteva.
Ovo je izmena sadržaja, ne redizajn.

## Izveštaj

`showcase/REPORT-03.md`, na srpskom:
- tabela: projekat, tag, scope, da li ima media, izvor iz kog si pisao tekst
- **spisak SVIH tvrdnji koje su ostale na stranici a koje ne mogu da se dokažu** — ovo je
  kontrolna lista koju čita čovek ujutru
- šta si uklonio i zašto
- odluke koje si doneo sam
